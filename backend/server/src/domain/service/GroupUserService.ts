import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {GroupUserModel} from "database/model/GroupUserModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";

class GroupUserService extends BaseService<GroupUserModel, GroupUserRepository> {

    private groupRepository: GroupRepository;

    constructor(groupRepository: GroupRepository,
                groupUserRepository: GroupUserRepository) {
        super(groupUserRepository);

        this.groupRepository = groupRepository;
    }

    async getByGroup(groupId: string) {
        const isGroupValid = await this.groupRepository.getById(groupId);
        if (isGroupValid === null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        const result = await this.repository.getByGroupId(groupId);
        return new HttpResponse<GroupUserModel>(result);
    }

    getByGroupAndUser(groupId: string, userId: string): Promise<GroupUserModel | null> {
        return this.repository.getByGroupAndUser(groupId, userId);
    }

    private async updateRole(groupUserId: string, roleId: string) : Promise<HttpResponse<GroupUserModel>> {
        const result = await this.repository.updateById(groupUserId, { grouproleid: roleId, });
        return new HttpResponse<GroupUserModel>(
            result ?? { error: "Not Found." },
            result == null ? 404 : 200,
        );
    }

    async promote(groupId: string, userId: string) : Promise<HttpResponse<GroupUserModel>> {
        const result = await this.getByGroupAndUser(groupId, userId);
        if (result != null && result.grouproleid == GroupRoleEnum.MEMBER)
        {
            const newRoleId = (Number(result?.grouproleid) - 1).toString();
            const groupUserModel = await this.updateRole(result.id, newRoleId);
            if (groupUserModel.statusCode === ErrorEnum.NOT_FOUND)
                throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
            return groupUserModel;
        }
        throw new HttpError(ErrorEnum.FORBIDDEN, "Forbidden.");
    }

    async demote(groupId: string, userId: string) : Promise<HttpResponse<GroupUserModel>> {
        const result = await this.getByGroupAndUser(groupId, userId);
        if (result != null && result.grouproleid == GroupRoleEnum.ADMINISTRATOR)
        {
            const newRoleId = (Number(result?.grouproleid) + 1).toString();
            const groupUserModel = await this.updateRole(result.id, newRoleId);
            if (groupUserModel.statusCode === ErrorEnum.NOT_FOUND)
                throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
            return groupUserModel;
        }
        throw new HttpError(ErrorEnum.FORBIDDEN, "Forbidden.");
    }

    async changeOwner(groupId: string, userId: string) : Promise<HttpResponse<GroupUserModel>> {
        const currentOwner = await this.repository.getGroupOwner(groupId);
        const newOwner = await this.repository.getByGroupAndUser(groupId, userId);
        if (currentOwner == null || newOwner == null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }
        const newOwnerResult = await this.updateRole(newOwner.id, GroupRoleEnum.OWNER);
        const lastOwnerResult = await this.updateRole(currentOwner.id, GroupRoleEnum.ADMINISTRATOR);
        if  (lastOwnerResult.statusCode !== 200) {
            return lastOwnerResult;
        }
        return newOwnerResult;
    }

    async leaveGroup(groupId: string, userId: string)
    {
        const groupUser = await this.getByGroupAndUser(groupId, userId);
        if (groupUser === null)
            return new HttpResponse({error: "Not Found."}, ErrorEnum.NOT_FOUND);
        return this.delete(groupUser.id);
    }
}

const groupUserService = new GroupUserService(groupRepository, groupUserRepository);


export { GroupUserService, groupUserService };