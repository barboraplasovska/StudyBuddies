import { GroupRoleModel } from "database/model/GroupRoleModel";
import { GroupRoleService } from "domain/service/GroupRoleService";
import {groupRoleRepository, GroupRoleRepository} from "database/repository/GroupRoleRepository";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";

describe("GroupRoleService", () => {

    const dbModel: GroupRoleModel  = { id: "1", name: "Test GroupRole" } as GroupRoleModel;
    const groupRoleService = new GroupRoleService(groupRoleRepository);

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the grouproles and a status code of 200', async () => {
        const expectedResponse : GroupRoleModel[] = [dbModel];
        const getAllMock = jest.spyOn(GroupRoleRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : GroupRoleModel[] = [];
        const getAllMock = jest.spyOn(GroupRoleRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupRoleModel = dbModel;
        const getByIdMock = jest.spyOn(GroupRoleRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(GroupRoleRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupRoleService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupRoleModel = dbModel;
        const updateByIdMock = jest.spyOn(GroupRoleRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(GroupRoleRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await groupRoleService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : GroupRoleModel = dbModel;
        const insertMock = jest.spyOn(GroupRoleRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : GroupRoleModel = dbModel;
        const deleteMock = jest.spyOn(GroupRoleRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await groupRoleService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(GroupRoleRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await groupRoleService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})
