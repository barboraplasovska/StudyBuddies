import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {EventUserModel} from "database/model/EventUserModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {EventUserRepository, eventUserRepository} from "database/repository/EventUserRepository";

class EventUserService extends BaseService<EventUserModel, EventUserRepository> {

    constructor(eventUserRepository: EventUserRepository) {
        super(eventUserRepository);
    }

    async getByEvent(eventId: string) {
        const result = await this.repository.getByEventId(eventId);
        if (result.length === 0)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        return new HttpResponse<EventUserModel>(result);
    }
}

const eventUserService = new EventUserService(eventUserRepository);

export {
    EventUserService,
    eventUserService,
};