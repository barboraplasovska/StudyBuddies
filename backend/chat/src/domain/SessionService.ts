import {SessionRepository, sessionRepository} from "infrastructure/repositories/SessionRepository";

class SessionService {
    repository: SessionRepository;

    constructor(sessionRepository: SessionRepository) {
        this.repository = sessionRepository;
    }

    async isValidSession(sessionId: string) {
        return this.repository.getById(sessionId);
    }

    getByUserId(userId: string) {
        return this.repository.getByUserId(userId);
    }
}

const sessionService = new SessionService(sessionRepository);

export {
    SessionService,
    sessionService
};

