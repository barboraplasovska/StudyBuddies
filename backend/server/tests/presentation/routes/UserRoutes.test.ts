import {UserService} from "domain/service/UserService";
import {HttpResponse} from "presentation/HttpResponse";
import {UserModel} from "database/model/UserModel";
import request from "supertest";
import {app} from "../../../src/app";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {UserEntity} from "domain/entity/UserEntity";
import {GroupModel} from "database/model/GroupModel";
import {AuthEntity, AuthResponse} from "domain/entity/AuthEntity";
import {SessionModel} from "database/model/SessionModel";
import {v4} from "uuid";
import {jwt} from "presentation/middlewares/authorization";
import {jwt as jwtMock} from "presentation/routes/UserRoutes";
import {
    decodeJWT,
    validJwtWithAdministratorPermission,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements
} from "./utils/jwt";
import {SessionService} from "domain/service/SessionService";
import {sessionExpired, sessionWithWrongUserId, validSession} from "./utils/session";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {Redis} from "database/Redis";
import {UserRepository} from "database/repository/UserRepository";
import {AppRoleModel} from "database/model/AppRoleModel";
import {CredentialModel} from "database/model/CredentialModel";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("UserRoutes", () => {

    const expectedBody: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    const userEntity: UserEntity = {
        id: expectedBody.id,
        name: expectedBody.name,
        description: expectedBody.description,
        roleId: expectedBody.roleId,
        groups: [] as GroupModel[],
    } as UserEntity

    const expectedExpirationDate = new Date(2024,1,1).toISOString();
    const expectedSession: SessionModel = {
        id: v4(),
        userid: "1",
        expireat: expectedExpirationDate,
    } as SessionModel

    const expectedJWT = "my-jwt";

    const checkCookie = (res: any) => {
        const cookie = res.get("Set-Cookie");
        const validFormatDate = new Date(expectedExpirationDate).getTime();
        expect(cookie?.at(0)?.startsWith(`jwt=${expectedJWT}`)).toBeTruthy();
        expect(cookie?.at(1)).toBeDefined();
        expect(cookie?.at(2)?.startsWith(`expireAt=${validFormatDate}`)).toBeTruthy();
    }

    afterEach(() => {
        jest.restoreAllMocks();
    })

    beforeEach(() => {
        jest.spyOn(BugsnagWrapper.prototype, 'notify').mockImplementation(() => {})
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(expectedBody);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return valid body and status code 403 with non verified account', async (_: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid JWT) !" }, 403);
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue({...expectedBody, verified: false} as UserModel)

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1'],
        ['delete', request(app).delete, '1'],
        ['change password', request(app).patch, 'password/change/old/new']
    ])('%s should return status code 403 with a valid JWT but session is expired', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['ban', request(app).patch, 'ban/1'],
        ['unban', request(app).patch, 'unban/1']
    ])('%s should return status code 401 with a valid JWT but invalid role', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['update', request(app).put, '1'],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 401 with a valid JWT but invalid user', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ["getAll", "all", UserService.prototype, request(app).get],
        ["getById", "1", UserService.prototype, request(app).get],
        ["updateById", "36", UserService.prototype, request(app).put],
        ["delete", "36", UserService.prototype, request(app).delete],
        ["banById", "ban/36", UserService.prototype, request(app).patch],
        ["unbanById", "unban/36", UserService.prototype, request(app).patch],
        ["generateValidationCode", "register", AuthEntity.prototype, request(app).post],
        ["generateNewValidationCode", "verify/mail/new", AuthEntity.prototype, request(app).get],
        ["verifyRegistrationCode", "verify/mail/code", AuthEntity.prototype, request(app).post],
        ['changePassword', 'password/change/old/new', AuthEntity.prototype,request(app).patch]
    ])('%s should return valid body and status code 500 on uncaught error', async (operation: any, path: string, prototype: any, req: any) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Bad request!" }, 500);
        const mockedResponse = jest.spyOn(prototype, operation);

        mockedResponse.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

        if  (operation == "banById" || operation == "unbanById")
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        else
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));

        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getAll", "all", UserService.prototype, request(app).get],
        ["getById", "1", UserService.prototype, request(app).get],
        ["updateById", "36", UserService.prototype, request(app).put],
        ["delete", "36", UserService.prototype, request(app).delete],
        ["banById", "ban/36", UserService.prototype, request(app).patch],
        ["unbanById", "unban/36", UserService.prototype, request(app).patch],
        ["generateValidationCode", "register", AuthEntity.prototype, request(app).post],
        ["generateNewValidationCode", "verify/mail/new", AuthEntity.prototype, request(app).get],
        ["verifyRegistrationCode", "verify/mail/code", AuthEntity.prototype, request(app).post],
        ['changePassword', 'password/change/old/new', AuthEntity.prototype,request(app).patch],
        ['resetPassword', 'password/reset/edit/email/password', AuthEntity.prototype, request(app).post]
    ])('%s should return valid body and status code 400 on bad requests', async (operation: any, path: string, prototype: any, req: any) => {
        const expectedResponse = new HttpResponse<UserModel>({ error: "Bad request!" }, 400);
        const getAllMock = jest.spyOn(prototype, operation);

        getAllMock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad request!");
        });

        if  (operation == "banById" || operation == "unbanById")
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        else
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));

        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getAll", "all", LimitByEndpoints.getAll, request(app).get],
        ["getById", "1", LimitByEndpoints.getById, request(app).get],
        ["updateById", "36", LimitByEndpoints.put, request(app).put],
        ["register", "register", LimitByEndpoints.post, request(app).post],
        ["verify", "verify/mail/123456", LimitByEndpoints.post, request(app).post],
        ["askForNewCode", "verify/mail/new", LimitByEndpoints.getById, request(app).get],
        ["login", "login", LimitByEndpoints.post, request(app).post],
        ["banById", "ban/1", LimitByEndpoints.patch, request(app).patch],
        ["unbanById", "unban/1", LimitByEndpoints.patch, request(app).patch],
        ["delete", "36", LimitByEndpoints.delete, request(app).delete],
        ['changePassword', 'password/change/old/new', LimitByEndpoints.patch, request(app).patch],
        ['reset password', 'password/reset/edit/email/password', LimitByEndpoints.post, request(app).post]
    ])('%s too many requests', async (method: string, path: string, limit: number, req: any) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        if (method == "banById" || method == "unbanById")
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        else
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(Redis.prototype, 'handleEvent').mockImplementationOnce(() => {});

        for (let i = 0; i < limit; i++) {
            await req(`/user/${path}`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        }
        const res = await req(`/user/${path}`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ["getById", request(app).get, '1'],
        ["getAll", request(app).get, 'all'],
        ["updateById", request(app).put, '36'],
        ["delete", request(app).delete, '36'],
    ])('%s should return valid body and status code 200 when user exists with any group', async (method: any, req: any, path: string, statusCode = 200) => {
        const expectedResponse = new HttpResponse<UserEntity>(userEntity, statusCode);
        const getByIdMock = jest.spyOn(UserService.prototype, method);
        getByIdMock.mockResolvedValue(expectedResponse);

        if (method == "banById" || method == "unbanById")
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        else
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getById", "1", request(app).get],
        ["updateById", "36", request(app).put],
        ["delete", "36", request(app).delete],
        ["banById", "ban/1", request(app).patch],
        ["unbanById", "/unban/1", request(app).patch],
    ])('%s should return valid body and status code 404 when user does not exists', async (method: any, path: string, req: any) => {
        const expectedResponse = new HttpResponse<UserEntity>({ error: "Not Found." }, 404);
        const getByIdMock = jest.spyOn(UserService.prototype, method);

        getByIdMock.mockResolvedValue(expectedResponse);
        if (method == "banById" || method == "unbanById")
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        else
            jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));

        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('register should return valid body and status code 201 when validation code has been generated', async () => {
        const expectedResponse = new HttpResponse<UserModel>(expectedBody, 201);

        const insertMock = jest.spyOn(AuthEntity.prototype, 'generateValidationCode');
        insertMock.mockResolvedValue(expectedResponse);
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .post(`/user/register`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(expectedResponse.statusCode);

        const userBody = expectedResponse.body as UserModel;
        expect(res.body).toEqual(userBody);
    })

    it('askForNewCode should return valid body and status code 204 when email has been sent again', async () => {
        const insertMock = jest.spyOn(AuthEntity.prototype, 'generateNewValidationCode');
        insertMock.mockResolvedValue(true);

        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)
        const res = await request(app)
            .get(`/user/verify/mail/new`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(204);
    })

    it('verify code should return valid body and status code 201 when the provided code is valid', async () => {
        const expectedResponse = new HttpResponse<AuthResponse>({
            user: expectedBody,
            session: expectedSession,
        } as AuthResponse, 201);

        const insertMock = jest.spyOn(AuthEntity.prototype, 'verifyRegistrationCode');
        insertMock.mockResolvedValue(expectedResponse);
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .post(`/user/verify/mail/code`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(expectedResponse.statusCode);

        const userBody = expectedResponse.body as AuthResponse;
        expect(res.body).toEqual(userBody);
        checkCookie(res)
    })

    it('change password should return valid body and status code 200 when the password has been changed', async () => {
        const expectedResponse = new HttpResponse<CredentialModel>({
            userid: expectedBody.id,
            email: "paul.genillon@epita.fr",
            password: "pwd",
            salt: "eomsfjcmsekcmlfjsdlm"
        } as CredentialModel);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const changePwdMock = jest.spyOn(AuthEntity.prototype, 'changePassword');
        changePwdMock.mockResolvedValue(expectedResponse);
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .patch(`/user/password/change/old/new`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    it('reset password should return valid body and status code 200 when the password has been changed', async () => {
        const expectedResponse = new HttpResponse<CredentialModel>({
            userid: expectedBody.id,
            email: "paul.genillon@epita.fr",
            password: "pwd",
            salt: "eomsfjcmsekcmlfjsdlm"
        } as CredentialModel);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const resetPwdMock = jest.spyOn(AuthEntity.prototype, 'resetPassword');
        resetPwdMock.mockResolvedValue(expectedResponse);
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .post(`/user/password/reset/edit/old/new`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["ban", "banById"],
        ["unban", "unbanById"]
    ])('%s by id should return 204', async(operation: string, method: any) => {
        const expectedResponse = new HttpResponse<UserModel>([], 204);
        const banByIdMock = jest.spyOn(UserService.prototype, method);
        banByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await request(app)
            .patch(`/user/${operation}/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    it('init reset password process should return valid body and status code 204 when the process has been init', async () => {
        const expectedResponse = new HttpResponse({ email: "paul.genillon@epita.fr" }, 204);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        jest.spyOn(AuthEntity.prototype, 'initResetPasswordProcess').mockImplementation();
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .post(`/user/password/reset/init/paul.genillon@epita.fr`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    it('validate reset password process should return valid body and status code 204 when the process has been validated', async () => {
        const expectedResponse = new HttpResponse({ email: "paul.genillon@epita.fr" }, 204);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        jest.spyOn(AuthEntity.prototype, 'validateResetPasswordCode').mockImplementation();
        jest.spyOn(jwtMock, "genJWT").mockReturnValue(expectedJWT)

        const res = await request(app)
            .post(`/user/password/reset/validate/paul.genillon@epita.fr/241294`)
            .set('bypass-ratelimit', 'true');
        expect(res.status).toBe(expectedResponse.statusCode);
    })
})