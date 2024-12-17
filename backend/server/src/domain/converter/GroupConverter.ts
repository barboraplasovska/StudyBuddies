import {GroupEntity} from "domain/entity/GroupEntity";
import {GroupModel} from "database/model/GroupModel";
import {GroupUserModel} from "database/model/GroupUserModel";
import {UserWithGroupRoleEntity} from "../entity/UserEntity";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";
import {UserRepository, userRepository} from "database/repository/UserRepository";

class GroupConverter {
    groupRepository: GroupRepository;
    userRepository: UserRepository;
    groupUserRepository: GroupUserRepository;

    constructor(groupRepository: GroupRepository,
                userRepository: UserRepository,
                groupUserRepository: GroupUserRepository,) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupUserRepository = groupUserRepository;
    }

    public async toGroupEntity(group: GroupModel): Promise<GroupEntity> {
        return {
            ...group,
            users: await this.getUsersByGroupId(group.id)
        } as GroupEntity;
    }

    private async getUsersByGroupId(groupId: string): Promise<UserWithGroupRoleEntity[]> {
        return await Promise.all(
            (await this.groupUserRepository.getByGroupId(groupId))
                .map(async (groupUser: GroupUserModel) => ({
                    ...(await this.userRepository.getById(groupUser.userid!)),
                    grouproleid: groupUser.grouproleid!
                } as UserWithGroupRoleEntity))
        );
    }
}

const groupConverter = new GroupConverter(
    groupRepository,
    userRepository,
    groupUserRepository
);

export { GroupConverter, groupConverter };