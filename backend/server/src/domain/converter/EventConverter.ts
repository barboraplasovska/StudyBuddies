import {EventEntity} from "../entity/EventEntity";
import {EventModel} from "database/model/EventModel";
import {GroupUserModel} from "database/model/GroupUserModel";
import {UserWithGroupRoleEntity} from "../entity/UserEntity";
import {EventRepository, eventRepository} from "database/repository/EventRepository";
import {EventUserRepository, eventUserRepository} from "database/repository/EventUserRepository";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {UserRepository, userRepository} from "database/repository/UserRepository";

class EventConverter {
    eventRepository: EventRepository;
    groupRepository: GroupRepository;
    userRepository: UserRepository;
    eventUserRepository: EventUserRepository;

    constructor(eventRepository: EventRepository,
                userRepository: UserRepository,
                eventUserRepository: EventUserRepository,
                groupRepository: GroupRepository,) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.eventUserRepository = eventUserRepository;
        this.groupRepository = groupRepository;
    }

    public async toEventEntity(event: EventModel): Promise<EventEntity> {
        const group = await this.groupRepository.getById(event.groupId!);
        return {
            ...event,
            group: group,
            users: await this.getUsersByEventId(event.id)
        } as EventEntity;
    }

    private async getUsersByEventId(eventId: string): Promise<UserWithGroupRoleEntity[]> {
        return await Promise.all(
            (await this.eventUserRepository.getByEventId(eventId))
                .map(async (groupUser: GroupUserModel) => ({
                    ...(await this.userRepository.getById(groupUser.userid!)),
                    grouproleid: groupUser.grouproleid!
                } as UserWithGroupRoleEntity))
        );
    }
}

const eventConverter = new EventConverter(
    eventRepository,
    userRepository,
    eventUserRepository,
    groupRepository
);

export { EventConverter, eventConverter };