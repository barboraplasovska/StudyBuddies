import { BaseRepository } from "./BaseRepository";
import { EventUserDbModel, EventUserModel } from "database/model/EventUserModel";

class EventUserRepository extends BaseRepository<EventUserModel> {

    constructor() {
        super(EventUserDbModel);
    }

    getByEventId(eventId: string) {
        return this.dbModel.findAll({ where: { eventid: eventId }});
    }

    getByUserId(userId: string): Promise<EventUserModel[]> {
        return this.dbModel.findAll({ where: { userid: userId }});
    }

    getByEventAndUser(eventId: string, userId: string) {
        return this.dbModel.findOne({ where: { eventid: eventId, userid: userId }});
    }
}

const eventUserRepository = new EventUserRepository();

export {
    EventUserRepository,
    eventUserRepository
};