import { AppRoleRepository } from "database/repository/AppRoleRepository";
import { AppRoleModel } from "database/model/AppRoleModel";
import { AppRoleService } from "domain/service/AppRoleService";
import { ErrorResponse } from "utils/ErrorResponse";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";

describe("AppRoleService", () => {

    const dbModel: AppRoleModel  = { id: "1", name: "Test AppRole" } as AppRoleModel;
    const appRoleService: AppRoleService = new AppRoleService(
        new AppRoleRepository()
    );

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the approles and a status code of 200', async () => {
        const expectedResponse : AppRoleModel[] = [dbModel];
        const getAllMock = jest.spyOn(AppRoleRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : AppRoleModel[] = [];
        const getAllMock = jest.spyOn(AppRoleRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : AppRoleModel = dbModel;
        const getByIdMock = jest.spyOn(AppRoleRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(AppRoleRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await appRoleService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : AppRoleModel = dbModel;
        const updateByIdMock = jest.spyOn(AppRoleRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(AppRoleRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await appRoleService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : AppRoleModel = dbModel;
        const insertMock = jest.spyOn(AppRoleRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : AppRoleModel = dbModel;
        const deleteMock = jest.spyOn(AppRoleRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await appRoleService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const deleteMock = jest.spyOn(AppRoleRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await appRoleService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})
