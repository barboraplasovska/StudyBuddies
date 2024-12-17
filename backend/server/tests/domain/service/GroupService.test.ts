import { GroupModel } from "database/model/GroupModel";
import { GroupService } from "domain/service/GroupService";
import {groupRepository, GroupRepository} from "database/repository/GroupRepository";
import {userRepository} from "database/repository/UserRepository";
import {groupUserRepository, GroupUserRepository} from "database/repository/GroupUserRepository";
import { HttpResponse } from "presentation/HttpResponse";
import { GroupEntity } from "domain/entity/GroupEntity";
import { GroupUserModel } from "database/model/GroupUserModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {UserWithGroupRoleEntity} from "domain/entity/UserEntity";
import {groupConverter, GroupConverter} from "domain/converter/GroupConverter";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";

describe("GroupService", () => {

    const dbModel = {
        name: "MTI 2025",
        description: "Group for MTI major promotion 2025",
        address: "83 Boulevard Marius Vivier Merle, 69003 Lyon",
        picture: "https://www.weodeo.com/wp-content/uploads/2024/03/devops.webp"
    } as GroupModel;

    const groupUserModel = {
        userid: "1",
        groupid: "1",
        grouproleid: "3"
    } as GroupUserModel;

    const groupEntity = {
        ...dbModel,
        users: [] as UserWithGroupRoleEntity[]
    } as GroupEntity;

    const groupService = new GroupService(
        groupUserRepository,
        userRepository,
        groupRepository,
        groupConverter
    );

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the groups and a status code of 200', async () => {
        const expectedResponse : GroupModel[] = [groupEntity];
        const getAllMock = jest.spyOn(GroupRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const converterMock = jest.spyOn(GroupConverter.prototype, 'toGroupEntity');
        converterMock.mockResolvedValue(groupEntity);

        const result = await groupService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : GroupModel[] = [];
        const getAllMock = jest.spyOn(GroupRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAllSchools should return a list of all the schools and a status code of 200', async () => {
        const expectedResponse : GroupModel[] = [groupEntity];
        const getAllMock = jest.spyOn(GroupRepository.prototype, 'getByFilter');
        getAllMock.mockResolvedValue(expectedResponse);

        const converterMock = jest.spyOn(GroupConverter.prototype, 'toGroupEntity');
        converterMock.mockResolvedValue(groupEntity);

        const result = await groupService.getAllSchools();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAllSchools should return an empty list with a status code 200', async () => {
        const expectedResponse : GroupModel[] = [];
        const getAllMock = jest.spyOn(GroupRepository.prototype, 'getByFilter');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupService.getAllSchools();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('get by user ID should return an error and a status code of 404 if the user does not exist', async () => {
        const expectedResponse = new HttpResponse<GroupUserModel[]>({ error: "Not Found." }, 404);
        const getAllMock = jest.spyOn(GroupUserRepository.prototype, 'getByUserId');
        getAllMock.mockResolvedValue(null);

        await expect(async () => {
            await groupService.getByUserId(groupUserModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('get by user ID should return a list of group and a status code of 202 if the user does not exist', async () => {
        const expectedResponse = new HttpResponse<GroupEntity[]>([groupEntity]);
        const getByUserMock = jest.spyOn(GroupUserRepository.prototype, 'getByUserId');
        getByUserMock.mockResolvedValue([groupUserModel]);

        const getByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const converterMock = jest.spyOn(GroupConverter.prototype, 'toGroupEntity');
        converterMock.mockResolvedValue(groupEntity);

        const result = await groupService.getByUserId(groupUserModel.userid!);


        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const user = {
            name: "Paulo Genillon",
            description: "Respo Piscine",
            roleId: "1",
            joinDate: "This is a day",
            grouproleid: "1"
        } as UserWithGroupRoleEntity;

        const expectedResponse = new HttpResponse({
            ...dbModel,
            users: [user]
        } as GroupEntity,200);

        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue(dbModel);
        jest.spyOn(GroupConverter.prototype, 'toGroupEntity').mockResolvedValue(expectedResponse.body as GroupEntity);

        const result = await groupService.getById(dbModel.id);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupModel = dbModel;
        const updateByIdMock = jest.spyOn(GroupRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(GroupRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('create group should return an error on insert failure', async() => {
        const insertMock = jest.spyOn(GroupRepository.prototype, 'insert');
        insertMock.mockImplementation(() => {
            throw new Error("An error occured");
        });

        await expect(async () => {
            await groupService.createGroup(dbModel, "1");
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })

    it('createGroup should return the expected object with a status code of 201', async () => {
        const expectedResponse : GroupModel = {
            id: "1",
            name: dbModel.name,
            description: dbModel.description,
        } as GroupModel;
        const insertMock = jest.spyOn(GroupRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const groupUserMock = jest.spyOn(GroupUserRepository.prototype, 'insert');
        groupUserMock.mockResolvedValue({
            id: "1",
            groupid: expectedResponse.id,
            grouproleid: GroupRoleEnum.OWNER
        } as GroupUserModel)
        const result = await groupService.createGroup(dbModel, "36");

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
        expect(groupUserMock).toHaveBeenCalled();
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : GroupModel = dbModel;
        const insertMock = jest.spyOn(GroupRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await groupService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });


    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupModel = dbModel;
        const deleteMock = jest.spyOn(GroupRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await groupService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(GroupRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await groupService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})
