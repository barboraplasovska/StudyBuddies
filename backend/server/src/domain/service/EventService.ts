import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {EventEntity} from "domain/entity/EventEntity";
import {EventUserModel} from "database/model/EventUserModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {GroupUserModel} from "database/model/GroupUserModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {UserModel} from "database/model/UserModel";
import {UserWithGroupRoleEntity} from "domain/entity/UserEntity";
import {eventConverter} from "../converter/EventConverter";
import {EventLocation, EventModel} from "database/model/EventModel";
import {EventRepository, eventRepository} from "database/repository/EventRepository";
import {EventUserRepository, eventUserRepository} from "database/repository/EventUserRepository";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";
import {Op, col, fn, where} from "sequelize";
import {UserRepository, userRepository} from "database/repository/UserRepository";

class EventService extends BaseService<EventModel, EventRepository> {
    private groupRepository : GroupRepository;
    private groupUserRepository : GroupUserRepository;
    private userRepository : UserRepository;
    private eventUserRepository : EventUserRepository;

    constructor(eventRepository: EventRepository,
                groupRepository: GroupRepository,
                groupUserRepository: GroupUserRepository,
                userRepository: UserRepository,
                eventUserRepository: EventUserRepository) {
        super(eventRepository);

        this.groupRepository = groupRepository;
        this.groupUserRepository = groupUserRepository;
        this.userRepository = userRepository;
        this.eventUserRepository = eventUserRepository;
    }

    async updateLocation(id: string, location: string, link?: string, address?: string) {
        if ((location === EventLocation.OFFLINE && address == null)
            || (location === EventLocation.ONLINE && link == null)) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }

        const result = await this.repository.updateById(id, {
            location: location,
            link: location === EventLocation.OFFLINE ? null : link,
            address: location === EventLocation.ONLINE ? null : address
        });

        if (result === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        return new HttpResponse<EventModel>(result, 200,);
    }

    override async updateById(groupId: string, body: EventModel): Promise<HttpResponse<EventModel>> {
        if (body.address === undefined)
            return new HttpResponse<EventModel>({error: "Invalid address (Bad Request!)"}, ErrorEnum.BAD_REQUEST);
        return super.updateById(groupId, body);
    }

    override async getById(id: string): Promise<HttpResponse<EventModel>> {
        const event : EventModel | null = await this.repository.getById(id);
        if (event == null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }

        const group = await this.groupRepository.getById(event.groupId!);
        
        const groupUsers : GroupUserModel[] = await this.eventUserRepository.getByEventId(id);
        const userModels = groupUsers.map((groupUser: GroupUserModel) => {
            return this.userRepository.getById(groupUser.userid!);
        });
        const users : UserModel[] = (await Promise.all(userModels))
            .filter((userModel: UserModel | null) : userModel is UserModel => userModel !== null);

        return new HttpResponse<EventEntity>({ ...event, group, users } as EventEntity, 200);
    }

    async createEvent(body: EventModel, userId: string): Promise<HttpResponse<EventModel>> {
        if (body.location !== EventLocation.ONLINE) {
            if (body.address === undefined)
                return new HttpResponse<EventModel>({error: "Invalid address (Bad Request!)"}, ErrorEnum.BAD_REQUEST);
        }
        const startTime = new Date(body.date!);
        const endTime = new Date(body.endtime!);
        if (startTime.getTime() > endTime.getTime()) {
            return new HttpResponse<EventModel>({error: "Invalid date (Bad Request!)"}, ErrorEnum.BAD_REQUEST);
        }
        const event = await this.repository.insert(body);
        await this.eventUserRepository.insert({
            userid: userId,
            eventid: event.id,
            grouproleid: GroupRoleEnum.OWNER
        } as EventUserModel);
        return new HttpResponse<EventModel>(event, 201);
    }

    async getByUserId(userId: string) {
        const eventUsers: EventUserModel[] = await this.eventUserRepository.getByUserId(userId);

        const events = eventUsers.map(async (eventUser) => {
            const event = await this.repository.getById(eventUser.eventid!);
            return this.getEventEntityFromEvent(event!);
        });

        return new HttpResponse<EventEntity[]>(
            (await Promise.all(events)).filter((event): event is EventEntity => event !== null)
        );
    }

    async getByFilter(day: string, time: string, userId: string | undefined) {
        let filter : { date?: object, id?: object } = {};

        if (userId as string) {
            const groupUsers = await this.groupUserRepository.getByUserId(userId!);
            filter = {
                ...filter,
                id: {
                    [Op.in]: groupUsers.map((groupUser: GroupUserModel) => groupUser.groupid!)
                }
            };
        }

        if (time) {
            let beginTime: { beginH: number, beginMin: number, beginSec: number, beginMs: number } = { beginH: 0, beginMin: 0, beginSec: 0, beginMs: 0 };
            let endTime: { endH: number, endMin: number, endSec: number, endMs: number } = { endH: 0, endMin: 0, endSec: 0, endMs: 0 };

            switch (time) {
                case 'morning':
                    beginTime = { beginH: 0, beginMin: 0, beginSec: 0, beginMs: 0 };
                    endTime = { endH: 12, endMin: 59, endSec: 59, endMs: 999 };
                    break;
                case 'afternoon':
                    beginTime = { beginH: 13, beginMin: 0, beginSec: 0, beginMs: 0 };
                    endTime = { endH: 18, endMin: 59, endSec: 59, endMs: 999 };
                    break;
                case 'evening':
                    beginTime = { beginH: 19, beginMin: 0, beginSec: 0, beginMs: 0 };
                    endTime = { endH: 23, endMin: 59, endSec: 59, endMs: 999 };
                    break;
                default:
            }
           filter = {
               ...filter,
               date: {
                   ...filter.date,
                   [Op.and]: [
                       where(fn('HOUR', col('date')), {
                           [Op.gte]: beginTime.beginH,
                           [Op.lte]: endTime.endH
                       }),
                       where(fn('MINUTE', col('date')), {
                           [Op.gte]: beginTime.beginMin,
                           [Op.lte]: endTime.endMin
                       }),
                       where(fn('SECOND', col('date')), {
                           [Op.gte]: beginTime.beginSec,
                           [Op.lte]: endTime.endSec
                       }),
                       where(fn('MICROSECOND', col('date')), {
                           [Op.gte]: beginTime.beginMs * 1000,
                           [Op.lte]: endTime.endMs * 1000,
                       })
                   ]
               }
           };
        }

        if (day) {
            const startDay = new Date(Date.parse(day));
            const endDay = new Date(Date.parse(day));
            endDay.setHours(23, 59, 59, 999);
            filter = {
                ...filter,
                date: {
                    ...filter.date,
                    [Op.between]: [startDay, endDay]
                }
            };
        }

        const eventRepository = this.repository as EventRepository;
        const filters = await eventRepository.getByFilter(filter);
        const eventEntities = await Promise.all(filters.map(async(event) => await eventConverter.toEventEntity(event)));

        return new HttpResponse<EventEntity[]>(eventEntities);
    }

    private async getEventEntityFromEvent(event: EventModel) {
        return {
            ...event,
            group: (await this.groupRepository.getById(event.groupId!)) ?? undefined,
            users: await this.getUsersByEventId(event.id)
        } as EventEntity;
    }

    private async getUsersByEventId(eventId: string): Promise<UserWithGroupRoleEntity[]> {
        return await Promise.all(
            (await this.eventUserRepository.getByEventId(eventId))
                .map(async (eventUser: EventUserModel) => ({
                    ...(await this.userRepository.getById(eventUser.userid!)),
                    grouproleid: eventUser.grouproleid!
                } as UserWithGroupRoleEntity))
        );
    }

    async isUserRegisteredInEvent(eventId: string, userId: string)
    {
        const event = await eventRepository.getById(eventId);
        if (event === null)
            return new HttpResponse({error: "Not Found."}, ErrorEnum.NOT_FOUND);
        const usersInEvent = await this.getUsersByEventId(eventId);
        return usersInEvent.filter(u => u.id === userId).length === 1 ?
            new HttpResponse({}) :
            new HttpResponse({error: "Unauthorized."}, ErrorEnum.UNAUTHORIZED);
    }
}

const eventService = new EventService(
    eventRepository,
    groupRepository,
    groupUserRepository,
    userRepository,
    eventUserRepository
);

export { EventService, eventService };
