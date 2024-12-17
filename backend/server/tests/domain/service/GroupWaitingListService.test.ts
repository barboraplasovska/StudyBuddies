import { ErrorResponse } from "utils/ErrorResponse";
import { GroupWaitingListModel } from "database/model/GroupWaitingListModel";
import { GroupWaitingListService } from "domain/service/GroupWaitingListService";
import {groupWaitingListRepository, GroupWaitingListRepository} from "database/repository/GroupWaitingListRepository";
import {groupUserRepository, GroupUserRepository} from "database/repository/GroupUserRepository";
import { HttpResponse } from "presentation/HttpResponse";
import { GroupUserModel } from "database/model/GroupUserModel";
import {groupRepository, GroupRepository} from "database/repository/GroupRepository";
import { GroupModel } from "database/model/GroupModel";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import {GroupConverter} from "../../../src/domain/converter/GroupConverter";
import {GroupEntity} from "../../../src/domain/entity/GroupEntity";

describe("GroupWaitingListService", () => {

    const dbModel: GroupWaitingListModel  = { id: "1", userid: "1", groupid: "1" } as GroupWaitingListModel;
    const groupWaitingListService = new GroupWaitingListService(
        groupWaitingListRepository,
        groupUserRepository,
        groupRepository
    );

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list and a status code of 200', async () => {
        const expectedResponse : GroupWaitingListModel[] = [dbModel];
        const getAllMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : GroupWaitingListModel[] = [];
        const getAllMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupWaitingListModel = dbModel;
        const getByIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupWaitingListService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupWaitingListModel = dbModel;
        const updateByIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const updateByIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupWaitingListService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : GroupWaitingListModel = dbModel;
        const insertMock = jest.spyOn(GroupWaitingListRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupWaitingListModel = dbModel;
        const deleteMock = jest.spyOn(GroupWaitingListRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(GroupWaitingListRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await groupWaitingListService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('join should return 400 if the user is already in the group', async() => {
        const expectedResponse : ErrorResponse = {error: "This user is already in the group."};

        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue({
            name: "MTI",
            description: "Best Group"
        } as GroupModel)
        const joinMock = jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser');
        joinMock.mockResolvedValue("different from null");

        await expect(async () => {
            await groupWaitingListService.join(dbModel.userid!, dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the group."));
    })

    it('join should return 400 if the user is not in the group but in waiting list', async() => {
        const expectedResponse : ErrorResponse = {error: "This user is already in the waiting list."};
        const joinMock = jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser');
        joinMock.mockResolvedValue(null);

        const alreadyInList = jest.spyOn(GroupWaitingListRepository.prototype, 'getByGroupAndUser');
        alreadyInList.mockResolvedValue("different from null");

        await expect(async () => {
            await groupWaitingListService.join(dbModel.userid!, dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "This user is already in the waiting list."));
    })

    it('join should return 200 if the user is neither in the group nor in waiting list', async() => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>(dbModel)
        const joinMock = jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser');
        joinMock.mockResolvedValue(null);

        const alreadyInList = jest.spyOn(GroupWaitingListRepository.prototype, 'getByGroupAndUser');
        alreadyInList.mockResolvedValue(null);

        const insertMock = jest.spyOn(GroupWaitingListService.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.join(dbModel.userid!, dbModel.groupid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })

    it('leave should return 400 if user and/or group does not exist', async() => {
        const joinMock = jest.spyOn(GroupWaitingListRepository.prototype, 'deleteByUserAndGroup');
        joinMock.mockResolvedValue(null);

        await expect(async () => {
            await groupWaitingListService.leave(dbModel.userid!, dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })

    it('leave should return 200 if user and/or group exists', async() => {
        const expectedResponse= dbModel;
        const joinMock = jest.spyOn(GroupWaitingListRepository.prototype, 'deleteByUserAndGroup');
        joinMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.leave(dbModel.userid!, dbModel.groupid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('accept should return 400 if user and/or group are not in the waiting list', async() => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Bad request!" }, 400);
        const acceptMock = jest.spyOn(GroupWaitingListService.prototype, 'deleteGroupWaitingList');
        acceptMock.mockResolvedValue(expectedResponse);

        await expect(async () => {
            await groupWaitingListService.accept(dbModel.userid!, dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })

    it('accept should return 200 and valid body on success', async() => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>(dbModel, 200);
        const acceptMock = jest.spyOn(GroupWaitingListService.prototype, 'deleteGroupWaitingList');
        acceptMock.mockResolvedValue(expectedResponse);

        const insertMock = jest.spyOn(GroupUserRepository.prototype, 'insert');
        const insertMockObject = {
            id: "1",
            userid: "1",
            groupid: "1",
            grouproleid: "1"
        } as GroupUserModel
        insertMock.mockResolvedValue(insertMockObject)

        const result = await groupWaitingListService.accept(dbModel.userid!, dbModel.groupid!);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(insertMockObject);
    })

    it('decline should return 200 if user and/or group exists', async() => {
        const expectedResponse= dbModel;
        const declineMock = jest.spyOn(GroupWaitingListRepository.prototype, 'deleteByUserAndGroup');
        declineMock.mockResolvedValue(expectedResponse);

        const result = await groupWaitingListService.decline(dbModel.userid!, dbModel.groupid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('getByGroupId should return 200 if the waiting list is not empty', async() => {
        const expectedResponse = new HttpResponse([dbModel]);
        const getByGroupIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getByGroupId');
        getByGroupIdMock.mockResolvedValue(expectedResponse.body);

        const result = await groupWaitingListService.getByGroupId(dbModel.groupid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })

    it('getByGroupId should return 404 if the group does not exist', async() => {
        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue(null);

        await expect(async () => {
            await groupWaitingListService.getByGroupId(dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    })

    it('getByUserId should return 200 if the group list is empty', async() => {
        const expectedResponse = new HttpResponse([]);
        const getByUserIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getByUserId');
        getByUserIdMock.mockResolvedValue(expectedResponse.body);

        const getGroupByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getGroupByIdMock.mockResolvedValue(null);

        const result = await groupWaitingListService.getByUserId(dbModel.userid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })

    it('getByUserId should return 200 if the group list is not empty', async() => {
        const groupModel = {
            name: "MTI 2025",
            description: "Group for MTI major promotion 2025"
        } as GroupModel;
        const expectedResponse = new HttpResponse([groupModel]);
        const getByUserIdMock = jest.spyOn(GroupWaitingListRepository.prototype, 'getByUserId');
        getByUserIdMock.mockResolvedValue(expectedResponse.body);

        jest.spyOn(GroupConverter.prototype, 'toGroupEntity').mockResolvedValue(groupModel as GroupEntity)

        const getGroupByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getGroupByIdMock.mockResolvedValue(groupModel);

        const result = await groupWaitingListService.getByUserId(dbModel.userid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })
})
