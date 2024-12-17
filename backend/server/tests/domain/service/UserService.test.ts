import { ErrorResponse } from "utils/ErrorResponse";
import { UserService } from "domain/service/UserService";
import { UserModel } from "database/model/UserModel";
import {groupRepository, GroupRepository} from "database/repository/GroupRepository";
import {groupUserRepository, GroupUserRepository} from "database/repository/GroupUserRepository";
import {userRepository, UserRepository} from "database/repository/UserRepository";
import { HttpResponse } from "presentation/HttpResponse";
import { UserEntity } from "domain/entity/UserEntity";
import { GroupModel } from "database/model/GroupModel";
import { GroupUserModel } from "database/model/GroupUserModel";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import {SessionRepository, sessionRepository} from "database/repository/SessionRepository";

describe("UserService", () => {

    const dbModel: UserModel  = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: false
    } as UserModel;

    const groupModel = {
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

    const userService = new UserService(groupRepository, groupUserRepository, userRepository, sessionRepository);

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the users and a status code of 200', async () => {
        const expectedResponse : UserModel[] = [dbModel];
        const getAllMock = jest.spyOn(UserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await userService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : UserModel[] = [];
        const getAllMock = jest.spyOn(UserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await userService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, expectedResponse.error));
    });

    it('getById should return the expected object with a status code of 200 (empty group user)', async () => {
        const expectedResponse = new HttpResponse({
            ...dbModel,
            groups: [] as GroupModel[],
        } as UserEntity, 200);

        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const getGroupUserFromUserIdMock = jest.spyOn(GroupUserRepository.prototype, 'getByUserId');
        getGroupUserFromUserIdMock.mockResolvedValue([]);

        const result = await userService.getById(dbModel.id);
        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200 (not empty group user)', async () => {
        const groupModel = {
            name: "MTI 2025",
            description: "Group for MTI major promotion 2025"
        } as GroupModel;

        const groupUserModel = {
            id: "1",
            userid: "36",
            groupid: "1",
            grouproleid: "1"
        } as GroupUserModel;

        const expectedResponse = new HttpResponse({
            ...dbModel,
            groups: [groupModel],
        } as UserEntity, 200);

        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const getGroupUserByIdMock = jest.spyOn(GroupUserRepository.prototype, 'getByUserId');
        getGroupUserByIdMock.mockResolvedValue([groupUserModel])

        const getGroupByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getGroupByIdMock.mockResolvedValue(groupModel);

        const result = await userService.getById(dbModel.id);
        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200 (invalid group)', async() => {
        const expectedResponse = new HttpResponse({
            ...dbModel,
            groups: [] as GroupModel[],
        } as UserEntity, 200);
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const getGroupUserFromUserIdMock = jest.spyOn(GroupUserRepository.prototype, 'getByUserId');
        getGroupUserFromUserIdMock.mockResolvedValue([]);

        const getGroupByIdMock = jest.spyOn(GroupRepository.prototype, 'getById');
        getGroupByIdMock.mockResolvedValue(null);

        const result = await userService.getById(dbModel.id);
        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    })

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : UserModel = dbModel;
        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await userService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : UserModel = dbModel;
        const insertMock = jest.spyOn(UserRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await userService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : UserModel = dbModel;
        const deleteMock = jest.spyOn(UserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await userService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const deleteMock = jest.spyOn(UserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('ban by id should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };

        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        const deleteByUserIdMock = jest.spyOn(SessionRepository.prototype, 'deleteByUserId');
        deleteByUserIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.banById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('ban by id should return No Content with a status code of 204 on success', async () => {
        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(dbModel);

        const deleteByUserIdMock = jest.spyOn(SessionRepository.prototype, 'deleteByUserId');
        deleteByUserIdMock.mockResolvedValue(null);

        const result = await userService.banById(dbModel.id);

        expect(result.statusCode).toEqual(204);
    });

    it('unban by id should return No Content with a status code of 204 on success', async () => {
        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(dbModel);

        const result = await userService.unbanById(dbModel.id);

        expect(result.statusCode).toEqual(204);
    });

    it('unban by id should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const updateByIdMock = jest.spyOn(UserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.unbanById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, expectedResponse.error));
    });

    it('verify account should throw error if the user is not found', async() => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.verifyAccount(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, expectedResponse.error));
    })

    it('verify account should return verified user if user is valid', async() => {
        const expectedResponse = { ...dbModel, verified: true };
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const user = await userService.verifyAccount(dbModel.id);
        expect(user).toMatchObject(expectedResponse);
    })

    it('addToGroup should throw error if the user is not found', async() => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await userService.addToGroup("EPITA", dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, expectedResponse.error));
    })

    it('addToGroup with valid user and already created group', async() => {
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const getGroupByNameMock = jest.spyOn(GroupRepository.prototype, 'getByName');
        getGroupByNameMock.mockResolvedValue(groupModel);

        const insertGroupUserMock = jest.spyOn(GroupUserRepository.prototype, 'insert');
        insertGroupUserMock.mockResolvedValue(groupUserModel);

        const user = await userService.addToGroup("EPITA", dbModel.id);
        expect(user).toMatchObject(groupUserModel);
    })

    it('addToGroup with valid user and no created group', async() => {
        const getByIdMock = jest.spyOn(UserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(dbModel);

        const getGroupByNameMock = jest.spyOn(GroupRepository.prototype, 'getByName');
        getGroupByNameMock.mockResolvedValue(null);

        const insertGroupMock = jest.spyOn(GroupRepository.prototype, 'insert');
        insertGroupMock.mockResolvedValue(groupModel);

        const insertGroupUserMock = jest.spyOn(GroupUserRepository.prototype, 'insert');
        insertGroupUserMock.mockResolvedValue(groupUserModel);

        const user = await userService.addToGroup("EPITA", dbModel.id);
        expect(user).toMatchObject(groupUserModel);
        expect(insertGroupMock).toHaveBeenCalled();
    })
})