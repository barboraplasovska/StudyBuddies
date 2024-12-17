import { GroupUserModel } from "database/model/GroupUserModel"
import {groupUserRepository, GroupUserRepository} from "database/repository/GroupUserRepository";
import { GroupUserService } from "domain/service/GroupUserService";
import { HttpResponse } from "presentation/HttpResponse";
import { ErrorResponse } from "utils/ErrorResponse";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {groupRepository, GroupRepository} from "database/repository/GroupRepository";
import {GroupModel} from "database/model/GroupModel";

describe("GroupUserService", () => {
    const dbModel = {
        userid: "1",
        groupid: "1",
        grouproleid: "3"
    } as GroupUserModel;

    const groupUserService = new GroupUserService(groupRepository, groupUserRepository);

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('leaveGroup should return a groupuser model and a status code of 200 if groupuser exist', async () => {
        const expectedResponse : GroupUserModel = dbModel;
        const getByGroupAndUserMock = jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser');
        getByGroupAndUserMock.mockResolvedValue(expectedResponse);

        jest.spyOn(GroupUserRepository.prototype, 'delete').mockResolvedValue(dbModel);
        const result = await groupUserService.leaveGroup(dbModel.groupid!, dbModel.userid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('leaveGroup should return an error and a status code of 404 if groupuser does not exist', async () => {
        const expectedResponse = new HttpResponse({error: "Not Found."}, ErrorEnum.NOT_FOUND);
        const getByGroupAndUserMock = jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser');
        getByGroupAndUserMock.mockResolvedValue(null);

        const result = await groupUserService.leaveGroup("1", "1");

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    });

    it('getAll should return a list of all the groups and a status code of 200', async () => {
        const expectedResponse : GroupUserModel[] = [dbModel];
        const getAllMock = jest.spyOn(GroupUserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupUserService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : GroupUserModel[] = [];
        const getAllMock = jest.spyOn(GroupUserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupUserService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse = new HttpResponse(dbModel, 200);

        jest.spyOn(GroupUserRepository.prototype, 'getById').mockResolvedValue(dbModel);

        const result = await groupUserService.getById(dbModel.id);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(GroupUserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('getByGroup should return the expected list of objects with a status code of 200', async () => {
        const expectedResponse = [dbModel];
        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue({
            name: "MTI",
            description: "Best group",
        } as GroupModel);
        jest.spyOn(GroupUserRepository.prototype, 'getByGroupId').mockResolvedValue(expectedResponse);

        const result = await groupUserService.getByGroup(dbModel.groupid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getByGroup should return not found if the group does not exist', async () => {
        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.getByGroup(dbModel.groupid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('getByGroup should return an empty list of objects with a status code of 200', async () => {
        const expectedResponse: GroupUserModel[] = [];
        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue({
            name: "MTI",
            description: "Best group",
        } as GroupModel);
        jest.spyOn(GroupUserRepository.prototype, 'getByGroupId').mockResolvedValue(expectedResponse);

        const result = await groupUserService.getByGroup(dbModel.groupid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupUserModel = dbModel;
        const updateByIdMock = jest.spyOn(GroupUserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupUserService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(GroupUserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('promote should return the expected object with a status code of 200', async () => {
        const expectedResponse = dbModel;
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(dbModel);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(expectedResponse);

        const result = await groupUserService.promote(dbModel.groupid!, dbModel.userid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('promote should return error with a status code of 404', async () => {
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(dbModel);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.promote(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('promote should return error with a status code of 403', async () => {
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.promote(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.FORBIDDEN, "Forbidden."));
    });

    it('demote should return the expected object with a status code of 200', async () => {
        const expectedResponse = {
            ...dbModel,
            grouproleid: "2"
        } as GroupUserModel;
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(expectedResponse);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(expectedResponse);

        const result = await groupUserService.demote(dbModel.groupid!, dbModel.userid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('demote should return error with a status code of 404', async () => {
        const found = {
            ...dbModel,
            grouproleid: "2"
        } as GroupUserModel;
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(found);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.demote(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('demote should return error with a status code of 403', async () => {
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.promote(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.FORBIDDEN, "Forbidden."));
    });

    it('changeOwner should return the expected object with a status code of 200', async () => {
        const expectedResponse = dbModel;
        jest.spyOn(GroupUserRepository.prototype, 'getGroupOwner').mockResolvedValue(expectedResponse);
        jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser').mockResolvedValue(expectedResponse);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(expectedResponse);

        const result = await groupUserService.changeOwner(dbModel.groupid!, dbModel.userid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('changeOwner should return an error with a status code of 404', async () => {
        jest.spyOn(GroupUserRepository.prototype, 'getGroupOwner').mockResolvedValue(null);
        jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser').mockResolvedValue(dbModel);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(dbModel);

        await expect(async () => {
            await groupUserService.changeOwner(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('changeOwner should return an error with a status code of 404', async () => {
        const expectedResponse: ErrorResponse = { error: "Not Found." };
        jest.spyOn(GroupUserRepository.prototype, 'getGroupOwner').mockResolvedValue(dbModel);
        jest.spyOn(GroupUserRepository.prototype, 'getByGroupAndUser').mockResolvedValue(null);
        jest.spyOn(GroupUserRepository.prototype, 'updateById').mockResolvedValue(dbModel);

        await expect(async () => {
            await groupUserService.changeOwner(dbModel.groupid!, dbModel.userid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : GroupUserModel = dbModel;
        const insertMock = jest.spyOn(GroupUserRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await groupUserService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupUserModel = dbModel;
        const deleteMock = jest.spyOn(GroupUserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await groupUserService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(GroupUserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await groupUserService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})