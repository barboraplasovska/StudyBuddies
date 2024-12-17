import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {EventUserModel} from "database/model/EventUserModel";
import {EventWaitingListModel} from "database/model/EventWaitingListModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {EventRepository, eventRepository} from "database/repository/EventRepository";
import {EventUserRepository, eventUserRepository} from "database/repository/EventUserRepository";
import {EventWaitingListRepository, eventWaitingListRepository} from "database/repository/EventWaitingListRepository";

class EventWaitingListService extends BaseService<EventWaitingListModel, EventWaitingListRepository> {
    eventUserRepository : EventUserRepository;
    eventRepository : EventRepository;

    constructor(eventWaitingListRepository: EventWaitingListRepository,
                eventUserRepository: EventUserRepository,
                eventRepository: EventRepository) {
        super(eventWaitingListRepository);

        this.eventUserRepository = eventUserRepository;
        this.eventRepository = eventRepository;
    }

    async join(userId: string, eventId: string) : Promise<HttpResponse<EventWaitingListModel>> {
        const isEventExisting = await this.eventRepository.getById(eventId);
        if (isEventExisting === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }

        const isAlreadyInEvent = await this.eventUserRepository.getByEventAndUser(eventId, userId);
        if (isAlreadyInEvent != null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the event.");
        }

        const isAlreadyInWaitingList = await this.repository.getByEventAndUser(eventId, userId);
        if (isAlreadyInWaitingList != null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the waiting list.");
        }

        return this.insert({
            userid: userId,
            eventid: eventId
        } as EventWaitingListModel);
    }

    async leave(userId: string, groupId: string) : Promise<HttpResponse<EventWaitingListModel>> {
        const groupWaitingList = await this.repository.deleteByUserAndEvent(userId, groupId);
        if (groupWaitingList === null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }
        return new HttpResponse<EventWaitingListModel>(groupWaitingList);
    }

    async deleteEventWaitingList(userId: string, groupId: string) {
        const deleted = await this.repository.deleteByUserAndEvent(userId, groupId);
        if (deleted === null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }
        return new HttpResponse<EventWaitingListModel>(deleted);
    }

    async accept(userId: string, eventId: string) {
        const deleted = await this.deleteEventWaitingList(userId, eventId);
        if (deleted.statusCode !== 200)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        const insertedGroupUser = await this.eventUserRepository.insert({
            userid: userId,
            eventid: eventId,
            grouproleid: GroupRoleEnum.MEMBER
        } as EventUserModel);
        return new HttpResponse<EventUserModel>(insertedGroupUser, 201);
    }

    decline(userId: string, groupId: string) {
        return this.deleteEventWaitingList(userId, groupId);
    }

    async getByEventId(eventId: string) {
        const event = await this.eventRepository.getById(eventId);
        if (event === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }
        const users = await this.repository.getByEventId(eventId);
        return new HttpResponse<EventWaitingListModel[]>(users);
    }

}

const eventWaitingListService = new EventWaitingListService(
    eventWaitingListRepository,
    eventUserRepository,
    eventRepository
);

export { EventWaitingListService, eventWaitingListService };