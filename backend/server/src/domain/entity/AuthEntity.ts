import {CredentialModel} from "database/model/CredentialModel";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {JWT} from "utils/jwt";
import {SessionModel} from "database/model/SessionModel";
import {UserModel} from "database/model/UserModel";
import bcrypt from "bcryptjs";
import {redis} from "../../app";
import {CredentialRepository, credentialRepository} from "database/repository/CredentialRepository";
import {EmailService, emailService} from "domain/service/EmailService";
import {SessionService, sessionService} from "domain/service/SessionService";
import {UserService, userService} from "domain/service/UserService";

type AuthBody = {
    userInfo: UserModel;
    credentialInfo: CredentialModel
};

type AuthResponse = {
    user: UserModel;
    session: SessionModel;
};

type JwtContent = {
    userId: string,
    appRoleId: string,
    iat: number
};

class AuthEntity {

    private sessionService: SessionService;
    private userService: UserService;
    private emailService: EmailService;
    private credentialRepository: CredentialRepository;

    constructor(
        sessionService: SessionService,
        userService: UserService,
        emailService: EmailService,
        credentialRepository: CredentialRepository) {
        this.sessionService = sessionService;
        this.userService = userService;
        this.emailService = emailService;
        this.credentialRepository = credentialRepository;
    }

    async generateValidationCode(body: AuthBody) {
        const credentials = await this.credentialRepository.getByEmail(body.credentialInfo.email!);
        const isRegisteringProcessLaunched = await redis.getCredentialEntity(body.credentialInfo.email!);

        if (credentials !== null || isRegisteringProcessLaunched !== null)
            throw new HttpError(ErrorEnum.FORBIDDEN, 'A user is already registered with this email');
        const insertedUser : HttpResponse<UserModel> = await this.userService.insert({
            ...body.userInfo,
            verified: false
        } as UserModel);
        const { email, password } = body.credentialInfo;
        const userModel = insertedUser.body as UserModel;
        if (!userModel)
            throw new HttpError(ErrorEnum.BAD_REQUEST,"Impossible to convert object to UserModel");
        if (!email || !password)
        {
            await this.userService.delete(userModel.id);
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Email or password is not defined !");
        }

        const isRegistered = await this.emailService.confirmRegistrationEmail(email, password, userModel.id);
        if (!isRegistered)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request !");
        return new HttpResponse<UserModel>(userModel, 201);
    }

    async verifyRegistrationCode(email: string, code: string) {
        const credentialEntity = await redis.getCredentialEntity(email);
        if (!credentialEntity)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "The registering process has not been launched (Bad Request!)");

        if (credentialEntity.validationCode !== code)
            throw new HttpError(ErrorEnum.FORBIDDEN, "Invalid validation code");

        await redis.delete(email);

        const userModel = await this.userService.verifyAccount(credentialEntity.userId);

        const schoolName = await email.getSchoolName();
        await this.userService.addToGroup(schoolName, userModel.id);

        const insertedSession = await this.sessionService.register(userModel.id, credentialEntity.email, credentialEntity.password);

        if (insertedSession.error || !insertedSession.session)
        {
            await this.userService.delete(userModel.id);
            throw new Error(insertedSession.error);
        }

        return new HttpResponse({
            user: userModel,
            session: insertedSession.session
        } as AuthResponse, 201);
    }

    async login(userId: string) {
        // Since credentials have been checked in the routes, the user exists, no verification are mandatory
        // neither for the user id nor the session
        const userEntity = await this.userService.getById(userId);
        const { id, name, description, roleId, joinDate, banDate, verified} = userEntity.body as UserModel;
        if (!verified)
            throw new HttpError(ErrorEnum.FORBIDDEN, "This account has not been verified !");
        if (banDate)
            throw new HttpError(ErrorEnum.FORBIDDEN, `You are banned since ${banDate}`);
        const session = await this.sessionService.getByUserId(userId);
        if (session !== null)
            await this.sessionService.delete(session.id);

        const newSession = await this.sessionService.createSession(userId);

        return {
            user: { id, name, description, roleId, joinDate, banDate},
            session: newSession,
        } as AuthResponse;
    }

    loginByJwt(jwt: JWT, token: string) {
        const decodedJwt = jwt.decodeJWT(token) as JwtContent;
        return this.login(decodedJwt.userId);
    }

    async generateNewValidationCode(to: string) {
        const credentials = await redis.getCredentialEntity(to);
        if (!credentials)
            throw new HttpError(ErrorEnum.FORBIDDEN, "Any registration process has been started!");
        return this.emailService.askForNewCode(credentials);
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        if (oldPassword === newPassword)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "You cannot use the same password as the previous one !");
        const credential = await this.credentialRepository.getByUserId(userId);
        if (credential === null || credential.email === undefined)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Account not found.");
        const isValidPassword = await this.sessionService.checkCredentialValidity(credential.email, oldPassword);
        if (isValidPassword === null)
            throw new HttpError(ErrorEnum.FORBIDDEN, "Invalid password");

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        const newCredentials = { ...credential, password: hashed };
        return new HttpResponse<CredentialModel | null>(await this.credentialRepository.updateById(credential.id, newCredentials));
    }

    async initResetPasswordProcess(email: string) {
        const credentials = await this.credentialRepository.getByEmail(email);
        if (!credentials || credentials.userid === undefined) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "There is no account with this email address.");
        }

        const user = await this.userService.getById(credentials.userid);
        const body = user.body as UserModel;
        if (!body || !body.verified) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "You must verify your account before resetting your password");
        }

        return this.emailService.initResetPasswordProcess(email);
    }

    async validateResetPasswordCode(email: string, code: string) {
        const resetpwdentity = await redis.getResetProcessEntity(email);
        if (!resetpwdentity)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Any password reset process has been launched !");

        if (resetpwdentity.validationCode !== code)
            throw new HttpError(ErrorEnum.FORBIDDEN, "Invalid validation code");

        redis.set(email, {...resetpwdentity, verified: true});
    }

    async resetPassword(email: string, password: string) : Promise<HttpResponse<CredentialModel | null>>
    {
        const resetpwdentity = await redis.getResetProcessEntity(email);
        if (!resetpwdentity)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Any password reset process has been launched !");

        if (!resetpwdentity.verified)
            throw new HttpError(ErrorEnum.FORBIDDEN, "You must use the previously sent validation code to validate the resetting process");

        const credential = await this.credentialRepository.getByEmail(email);
        if (credential === null || credential.userid === undefined || credential.password === undefined)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newCredentials = { ...credential, password: hashed };
        await redis.delete(email);

        return new HttpResponse<CredentialModel | null>(await this.credentialRepository.updateById(credential.id, newCredentials));
    }
}

const authEntity = new AuthEntity(sessionService, userService, emailService, credentialRepository);

export {
    AuthEntity,
    AuthResponse,
    JwtContent,
    authEntity
};
