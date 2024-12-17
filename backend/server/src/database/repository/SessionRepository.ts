import { BaseRepository } from "./BaseRepository";
import { SessionDbModel, SessionModel } from "database/model/SessionModel";

class SessionRepository extends BaseRepository<SessionModel> {
    constructor() {
        super(SessionDbModel);
    }

    getByUserId(userId: string) {
        return this.dbModel.findOne({ where: { userId: userId }, raw: true });
    }

    async deleteByUserId(userId: string) {
        const session = await this.dbModel.findOne({ where: { userId: userId } });
        if (session == null)
            return null;
        return session.destroy();
    }
}

const sessionRepository = new SessionRepository();

export { SessionRepository, sessionRepository };

