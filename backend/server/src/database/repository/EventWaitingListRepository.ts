import { BaseRepository } from "./BaseRepository";
import { EventWaitingListDbModel, EventWaitingListModel } from "database/model/EventWaitingListModel";

class EventWaitingListRepository extends BaseRepository<EventWaitingListModel> {

    constructor() {
        super(EventWaitingListDbModel);
    }

    async deleteByUserAndEvent(userId: string, eventId: string)
    {
        const result : EventWaitingListModel = await this.getByEventAndUser(eventId, userId);
        return this.delete(result.id);
    }

    getByEventId(eventId: string) {
        return this.dbModel.findAll({ where: { eventid: eventId } });
    }

    getByEventAndUser(eventId: string, userId: string) {
        return this.dbModel.findOne({ where: { eventid: eventId, userid: userId }});
    }
}

const eventWaitingListRepository = new EventWaitingListRepository();

export { EventWaitingListRepository, eventWaitingListRepository };