import { BaseRepository } from "./BaseRepository";
import { EventDbModel, EventModel } from "database/model/EventModel";

class EventRepository extends BaseRepository<EventModel> {
    constructor() {
        super(EventDbModel);
    }

    getByFilter(filter: object): Promise<EventModel[]> {
        return this.dbModel.findAll({
            where: filter,
            raw: true,
        });
    }
}

const eventRepository  = new EventRepository();

export { EventRepository, eventRepository };