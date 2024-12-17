import {BaseService} from "./BaseService";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {GroupEntity} from "domain/entity/GroupEntity";
import {GroupModel} from "database/model/GroupModel";
import {GroupRequestEntity} from "../entity/GroupRequestEntity";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {GroupUserModel} from "database/model/GroupUserModel";
import {HttpError} from "utils/errors/HttpError";
import {HttpResponse} from "presentation/HttpResponse";
import {GroupConverter, groupConverter} from "domain/converter/GroupConverter";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {GroupUserRepository, groupUserRepository} from "database/repository/GroupUserRepository";
import {UserRepository, userRepository} from "database/repository/UserRepository";

class GroupService extends BaseService<GroupModel, GroupRepository> {
    private groupUserRepository : GroupUserRepository;
    private userRepository : UserRepository;

    private groupConverter: GroupConverter;

    constructor(groupUserRepository : GroupUserRepository,
                userRepository : UserRepository,
                groupRepository: GroupRepository,
                groupConverter: GroupConverter) {
        super(groupRepository);

        this.groupUserRepository = groupUserRepository;
        this.userRepository = userRepository;
        this.groupConverter = groupConverter;
    }

    async getByUserId(userId: string): Promise<HttpResponse<GroupEntity[]>>  {
        const groupUsers: GroupUserModel[] = await this.groupUserRepository.getByUserId(userId);
        if (groupUsers == null)
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");

        const groupModels: Promise<GroupModel | null>[] = groupUsers.map((groupUser: GroupUserModel) => this.repository.getById(groupUser.groupid!));
        const groups = (await Promise.all(groupModels))
            .filter((groupModel: GroupModel | null) : groupModel is GroupModel => groupModel !== null)
            .map((group) => this.groupConverter.toGroupEntity(group));

        return new HttpResponse<GroupEntity[]>(await Promise.all(groups));
    }

    async getByParentId(parentId: string): Promise<HttpResponse<GroupEntity[]>> {
        let filter : { parentId?: string } = {};

        if (parentId) {
            filter = {
                ...filter,
                parentId: parentId
            };
        }

        const groups = await this.repository.getByFilter(filter);
        const groupEntities = groups.map((group) => this.groupConverter.toGroupEntity(group));
        return new HttpResponse<GroupEntity[]>(await Promise.all(groupEntities));
    }

    async getAllSchools(): Promise<HttpResponse<GroupEntity[]>> {
        const groups = await this.repository.getByFilter({ verified: true });
        const groupEntities = groups.map((group) => this.groupConverter.toGroupEntity(group));
        return new HttpResponse<GroupEntity[]>(await Promise.all(groupEntities));
    }

    async getAllGroups(): Promise<HttpResponse<GroupEntity[]>> {
        const groups = await this.repository.getAll();
        const groupEntities = groups.map((group) => this.groupConverter.toGroupEntity(group));
        return new HttpResponse<GroupEntity[]>(await Promise.all(groupEntities));
    }

    override async getById(id: string): Promise<HttpResponse<GroupEntity>> {
        const group = await this.repository.getById(id);
        if (group === null) {
            throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
        }
        const groupEntity = await groupConverter.toGroupEntity(group);
        return new HttpResponse<GroupEntity>(groupEntity, 200);
    }

    async createGroup(body: GroupRequestEntity, userId: string, isVerified: boolean = false): Promise<HttpResponse<GroupModel>> {
        try {
            if (body.address === undefined)
                return new HttpResponse<GroupModel>({error: "Invalid address (Bad Request!)"}, ErrorEnum.BAD_REQUEST);
            const group = await this.repository.insert({ ...body, verified: isVerified} as GroupModel);
            await this.groupUserRepository.insert({
                userid: userId,
                groupid: group.id,
                grouproleid: GroupRoleEnum.OWNER
            } as GroupUserModel);
            return new HttpResponse<GroupModel>(group, 201);
        }
        catch {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.");
        }
    }

    override async updateById(groupId: string, body: GroupModel): Promise<HttpResponse<GroupModel>> {
        if (body.address === undefined)
            return new HttpResponse<GroupModel>({error: "Invalid address (Bad Request!)"}, ErrorEnum.BAD_REQUEST);
        return super.updateById(groupId, body);
    }
}

const groupService = new GroupService(
    groupUserRepository,
    userRepository,
    groupRepository,
    groupConverter
);

export { GroupService, groupService };
