import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {GroupModel} from "database/model/GroupModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {GroupUserModel} from "database/model/GroupUserModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {UserEntity} from "domain/entity/UserEntity";
import {UserModel} from "database/model/UserModel";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";
import {SessionRepository, sessionRepository} from "database/repository/SessionRepository";
import {UserRepository, userRepository} from "database/repository/UserRepository";

class UserService extends BaseService<UserModel, UserRepository> {
    groupRepository: GroupRepository;
    groupUserRepository: GroupUserRepository;
    sessionRepository: SessionRepository;

    constructor(groupRepository: GroupRepository,
                groupUserRepository: GroupUserRepository,
                userRepository: UserRepository,
                sessionRepository: SessionRepository) {
        super(userRepository);

        this.groupRepository = groupRepository;
        this.groupUserRepository = groupUserRepository;
        this.sessionRepository = sessionRepository;
    }

    override async getById(id: string): Promise<HttpResponse<UserEntity>> {
        const user = await this.repository.getById(id);
        if (user === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }

        const groupUsers: GroupUserModel[] = await this.groupUserRepository.getByUserId(id);
        const groupModels: Promise<GroupModel | null>[] = groupUsers.map((groupUser: GroupUserModel) => this.groupRepository.getById(groupUser.groupid!));
        const groups = (await Promise.all(groupModels))
            .filter((groupModel: GroupModel | null) : groupModel is GroupModel => groupModel !== null);

        return new HttpResponse<UserEntity>({ ...user, groups: groups } as UserEntity, 200);
    }

    async banById(id: string) {
        const result = await this.repository.updateById(id, { banDate: new Date() });
        if (result === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        await this.sessionRepository.deleteByUserId(id);
        return new HttpResponse<UserModel>(result, 204);
    }

    async unbanById(id: string) {
        const result = await this.repository.updateById(id, { banDate: null });
        if (result === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        return new HttpResponse<UserModel>(result, 204);
    }

    async verifyAccount(id: string) {
        const user = await this.repository.getById(id);
        if (user === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        user.verified = true;
        await this.repository.updateById(id, user);
        return user;
    }

    async addToGroup(groupName: string, id: string): Promise<GroupUserModel> {
        const user = await this.repository.getById(id);
        if (user === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");

        let group = await this.groupRepository.getByName(groupName);
        const isGroupAlreadyCreated = group !== null;
        if (!isGroupAlreadyCreated)
            group = await this.groupRepository.insert({
                name: groupName,
                description: `Group for ${groupName}'s students`,
                verified: true
            } as GroupModel);

        return this.groupUserRepository.insert({
            userid: id,
            groupid: group.id,
            grouproleid: isGroupAlreadyCreated ? GroupRoleEnum.MEMBER : GroupRoleEnum.OWNER
        } as GroupUserModel);
    }
}

const userService = new UserService(groupRepository, groupUserRepository, userRepository, sessionRepository);

export {
    UserService,
    userService
};
