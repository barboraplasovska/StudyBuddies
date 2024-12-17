import { SessionDbModel, SessionModel } from "infrastructure/models/SessionModel";

class SessionRepository {
    dbModel;
    constructor() {
        this.dbModel = SessionDbModel;
    }

    getById(id: string): Promise<SessionModel | null> {
        return this.dbModel.findByPk(id);
    }

    getByUserId(userId: string) {
        return this.dbModel.findOne({ where: { userid: userId }, raw: true });
    }
}

const sessionRepository = new SessionRepository();

export { SessionRepository, sessionRepository };

