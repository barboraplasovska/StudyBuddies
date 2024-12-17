import { BaseService } from "./BaseService";
import { CredentialModel } from "database/model/CredentialModel";
import { SessionModel } from "database/model/SessionModel";
import bcrypt from "bcryptjs";
import { v4 } from 'uuid';
import {CredentialRepository, credentialRepository} from "database/repository/CredentialRepository";
import {SessionRepository, sessionRepository} from "database/repository/SessionRepository";

class SessionService extends BaseService<SessionModel, SessionRepository> {
    credentialRepository: CredentialRepository;

    constructor(sessionRepository: SessionRepository,
                credentialRepository: CredentialRepository) {
        super(sessionRepository);

        this.credentialRepository = credentialRepository;
    }

    async register(userId: string, email: string, password: string) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        
        const newCredentials = { userid: userId, email: email, password: hashed, salt: salt } as CredentialModel;
        if (newCredentials) {
            const result: CredentialModel = await this.credentialRepository.insert(newCredentials);
            try {
                const session: SessionModel = await this.createSession(userId);
                return { result, session };
            }
            catch {
                await this.credentialRepository.delete(result.id);
            }
        }
        
        return { error: "Could not register." };
    }

    async checkCredentialValidity(email: string, password: string) {
        const credential = await this.credentialRepository.getByEmail(email);
        if (credential === null || credential.password === undefined || credential.userid === undefined)
            return null;
        const isValidPassword = await bcrypt.compare(password, credential.password!);
        return isValidPassword ? credential.userid : null;

    }

    createSession(userId: string) {
        const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const newSession = {
            id: v4(),
            userid: userId,
            expireat: expireAt.toString()
        } as SessionModel;

        return this.repository.insert(newSession);
    }

    async isValidSession(sessionId: string) {
        return this.repository.getById(sessionId);
    }

    getByUserId(userId: string) {
        return this.repository.getByUserId(userId);
    }
}

const sessionService = new SessionService(sessionRepository, credentialRepository);

export {
    SessionService,
    sessionService
};

