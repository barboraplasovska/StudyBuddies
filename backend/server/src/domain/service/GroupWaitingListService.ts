import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {GroupEntity} from "../entity/GroupEntity";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {GroupUserModel} from "database/model/GroupUserModel";
import {GroupWaitingListModel} from "database/model/GroupWaitingListModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {groupConverter} from "../converter/GroupConverter";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";
import {GroupWaitingListRepository, groupWaitingListRepository} from "database/repository/GroupWaitingListRepository";

class GroupWaitingListService extends BaseService<GroupWaitingListModel, GroupWaitingListRepository> {
    groupUserRepository: GroupUserRepository;
    groupRepository: GroupRepository;

    constructor(groupWaitingListRepository: GroupWaitingListRepository,
                groupUserRepository: GroupUserRepository,
                groupRepository: GroupRepository) {
        super(groupWaitingListRepository);

        this.groupUserRepository = groupUserRepository;
        this.groupRepository = groupRepository;
    }

    async join(userId: string, groupId: string) : Promise<HttpResponse<GroupWaitingListModel>> {
        const group = await this.groupRepository.getById(groupId);
        if (group === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }

        const isAlreadyInGroup = await this.groupUserRepository.getByGroupAndUser(groupId, userId);
        if (isAlreadyInGroup != null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the group.");
        }

        const isAlreadyInWaitingList = await this.repository.getByGroupAndUser(groupId, userId);
        if (isAlreadyInWaitingList != null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the waiting list.");
        }

        return this.insert({
            userid: userId,
            groupid: groupId
        } as GroupWaitingListModel);
    }

    async leave(userId: string, groupId: string) : Promise<HttpResponse<GroupWaitingListModel>> {
        const groupWaitingList = await this.repository.deleteByUserAndGroup(userId, groupId);
        if (groupWaitingList === null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }
        return new HttpResponse<GroupWaitingListModel>(groupWaitingList);
    }

    async deleteGroupWaitingList(userId: string, groupId: string) {
        const deleted = await this.repository.deleteByUserAndGroup(userId, groupId);
        if (deleted === null) {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }
        return new HttpResponse<GroupWaitingListModel>(deleted);
    }

    async accept(userId: string, groupId: string) {
        const deleted = await this.deleteGroupWaitingList(userId, groupId);
        if (deleted.statusCode !== 200)
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        const insertedGroupUser = await this.groupUserRepository.insert({
            userid: userId,
            groupid: groupId,
            grouproleid: GroupRoleEnum.MEMBER
        } as GroupUserModel);
        return new HttpResponse<GroupUserModel>(insertedGroupUser, 201);
    }

    decline(userId: string, groupId: string) {
        return this.deleteGroupWaitingList(userId, groupId);
    }

    async getByGroupId(groupId: string) {
        const group = await this.groupRepository.getById(groupId);
        if (group === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }
        const users = await this.repository.getByGroupId(groupId);
        return new HttpResponse<GroupWaitingListModel[]>(users);
    }

    async getByUserId(userId: string) {
        const groupWaitingList = await this.repository.getByUserId(userId);
        const groups: GroupEntity[] = await Promise.all(groupWaitingList.map(
                async(groupWaitingList: GroupWaitingListModel) => {
                    const gpModel = await this.groupRepository.getById(groupWaitingList.groupid!);
                    if (gpModel === null)
                        throw new Error("Server error");
                    return groupConverter.toGroupEntity(gpModel);
                }
            ));
        return new HttpResponse<GroupEntity[]>(groups);
    }
}

const groupWaitingListService = new GroupWaitingListService(
    groupWaitingListRepository,
    groupUserRepository,
    groupRepository
);

export { GroupWaitingListService, groupWaitingListService };