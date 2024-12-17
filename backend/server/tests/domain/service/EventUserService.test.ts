import { EventUserModel } from "database/model/EventUserModel";
import { EventUserService } from "domain/service/EventUserService";
import {eventUserRepository, EventUserRepository} from "database/repository/EventUserRepository";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";

describe("EventUserService", () => {

    const dbModel: EventUserModel  = { id: "1", userid: "1", eventid: "1", grouproleid: "1" } as EventUserModel;
    const eventUserService = new EventUserService(eventUserRepository);

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the approles and a status code of 200', async () => {
        const expectedResponse : EventUserModel[] = [dbModel];
        const getAllMock = jest.spyOn(EventUserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : EventUserModel[] = [];
        const getAllMock = jest.spyOn(EventUserRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventUserModel = dbModel;
        const getByIdMock = jest.spyOn(EventUserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(EventUserRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventUserService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('getByEvent should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventUserModel = dbModel;
        const getByIdMock = jest.spyOn(EventUserRepository.prototype, 'getByEventId');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.getByEvent(dbModel.eventid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getByEvent should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(EventUserRepository.prototype, 'getByEventId');
        getByIdMock.mockResolvedValue([] as EventUserModel[]);

        await expect(async () => {
            await eventUserService.getByEvent(dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventUserModel = dbModel;
        const updateByIdMock = jest.spyOn(EventUserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(EventUserRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventUserService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : EventUserModel = dbModel;
        const insertMock = jest.spyOn(EventUserRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventUserModel = dbModel;
        const deleteMock = jest.spyOn(EventUserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await eventUserService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(EventUserRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await eventUserService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})
