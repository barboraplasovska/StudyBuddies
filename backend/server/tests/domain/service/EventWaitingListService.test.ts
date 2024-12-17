import { ErrorResponse } from "utils/ErrorResponse";
import { HttpResponse } from "presentation/HttpResponse";
import { EventWaitingListModel } from "database/model/EventWaitingListModel";
import { EventWaitingListService } from "domain/service/EventWaitingListService";
import {eventWaitingListRepository, EventWaitingListRepository} from "database/repository/EventWaitingListRepository";
import {eventUserRepository, EventUserRepository} from "database/repository/EventUserRepository";
import { EventUserModel } from "database/model/EventUserModel";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {eventRepository, EventRepository} from "database/repository/EventRepository";
import {EventModel} from "database/model/EventModel";

describe("EventWaitingListService", () => {

    const dbModel: EventWaitingListModel  = { id: "1", userid: "1", eventid: "1" } as EventWaitingListModel;
    const eventWaitingListService = new EventWaitingListService(
        eventWaitingListRepository,
        eventUserRepository,
        eventRepository
    );

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list and a status code of 200', async () => {
        const expectedResponse : EventWaitingListModel[] = [dbModel];
        const getAllMock = jest.spyOn(EventWaitingListRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : EventWaitingListModel[] = [];
        const getAllMock = jest.spyOn(EventWaitingListRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventWaitingListModel = dbModel;
        const getByIdMock = jest.spyOn(EventWaitingListRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(EventWaitingListRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventWaitingListModel = dbModel;
        const updateByIdMock = jest.spyOn(EventWaitingListRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(EventWaitingListRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : EventWaitingListModel = dbModel;
        const insertMock = jest.spyOn(EventWaitingListRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventWaitingListModel = dbModel;
        const deleteMock = jest.spyOn(EventWaitingListRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const deleteMock = jest.spyOn(EventWaitingListRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('join should return 400 if event does not exist', async() => {
        const expectedResponse : ErrorResponse = {error: "Not Found."};
        const eventByIdMock = jest.spyOn(EventRepository.prototype, 'getById');
        eventByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.join(dbModel.userid!, dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, expectedResponse.error));
    })

    it('join should return 400 if the user is already in the group', async() => {
        const expectedResponse : ErrorResponse = {error: "This user is already in the event."};
        const eventByIdMock = jest.spyOn(EventRepository.prototype, 'getById');
        eventByIdMock.mockResolvedValue({
            name: "myEvent"
        } as EventModel);
        const joinMock = jest.spyOn(EventUserRepository.prototype, 'getByEventAndUser');
        joinMock.mockResolvedValue("different from null");


        await expect(async () => {
            await eventWaitingListService.join(dbModel.userid!, dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, expectedResponse.error));
    })

    it('join should return 400 if the user is not in the group but in waiting list', async() => {
        const expectedResponse : ErrorResponse = {error: "This user is already in the waiting list."};
        const eventByIdMock = jest.spyOn(EventRepository.prototype, 'getById');
        eventByIdMock.mockResolvedValue({
            name: "myEvent"
        } as EventModel);

        const joinMock = jest.spyOn(EventUserRepository.prototype, 'getByEventAndUser');
        joinMock.mockResolvedValue(null);

        const alreadyInList = jest.spyOn(EventWaitingListRepository.prototype, 'getByEventAndUser');
        alreadyInList.mockResolvedValue("different from null");

        await expect(async () => {
            await eventWaitingListService.join(dbModel.userid!, dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, expectedResponse.error));
    })

    it('join should return 200 if the user is neither in the group nor in waiting list', async() => {
        const expectedResponse = new HttpResponse<EventWaitingListModel>(dbModel)
        const joinMock = jest.spyOn(EventUserRepository.prototype, 'getByEventAndUser');
        joinMock.mockResolvedValue(null);

        const alreadyInList = jest.spyOn(EventWaitingListRepository.prototype, 'getByEventAndUser');
        alreadyInList.mockResolvedValue(null);

        const insertMock = jest.spyOn(EventWaitingListService.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.join(dbModel.userid!, dbModel.eventid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })

    it('leave should return 400 if user and/or group does not exist', async() => {
        const leaveMock = jest.spyOn(EventWaitingListRepository.prototype, 'deleteByUserAndEvent');
        leaveMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.leave(dbModel.userid!, dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })

    it('leave should return 200 if user and/or group exists', async() => {
        const expectedResponse= dbModel;
        const joinMock = jest.spyOn(EventWaitingListRepository.prototype, 'deleteByUserAndEvent');
        joinMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.leave(dbModel.userid!, dbModel.eventid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('accept should return 400 if user and/or group are not in the waiting list', async() => {
        const expectedResponse = new HttpResponse<EventWaitingListModel>({ error: "Bad Request." }, 400);
        const acceptMock = jest.spyOn(EventWaitingListService.prototype, 'deleteEventWaitingList');
        acceptMock.mockResolvedValue(expectedResponse);

        await expect(async () => {
            await eventWaitingListService.accept(dbModel.userid!, dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })

    it('accept should return 200 and valid body on success', async() => {
        const expectedResponse = new HttpResponse<EventWaitingListModel>(dbModel, 200);
        const acceptMock = jest.spyOn(EventWaitingListService.prototype, 'deleteEventWaitingList');
        acceptMock.mockResolvedValue(expectedResponse);

        const insertMock = jest.spyOn(EventUserRepository.prototype, 'insert');
        const insertMockObject = {
            id: "1",
            userid: "1",
            eventid: "1",
            grouproleid: "1"
        } as EventUserModel;
        insertMock.mockResolvedValue(insertMockObject)

        const result = await eventWaitingListService.accept(dbModel.userid!, dbModel.eventid!);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(insertMockObject);
    })

    it('decline should return 200 if user and/or group exists', async() => {
        const expectedResponse= dbModel;
        const declineMock = jest.spyOn(EventWaitingListRepository.prototype, 'deleteByUserAndEvent');
        declineMock.mockResolvedValue(expectedResponse);

        const result = await eventWaitingListService.decline(dbModel.userid!, dbModel.eventid!);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('getByGroupId should return 404 if the waiting list is empty', async() => {
        const getByGroupIdMock = jest.spyOn(EventRepository.prototype, 'getById');
        getByGroupIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventWaitingListService.getByEventId(dbModel.eventid!);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    })

    it('getByGroupId should return 200 if the waiting list is not empty', async() => {
        const expectedResponse = new HttpResponse([dbModel]);
        jest.spyOn(EventRepository.prototype, 'getById').mockResolvedValue({
            name: "Event"
        } as EventModel)
        const getByGroupIdMock = jest.spyOn(EventWaitingListRepository.prototype, 'getByEventId');
        getByGroupIdMock.mockResolvedValue(expectedResponse.body);

        const result = await eventWaitingListService.getByEventId(dbModel.eventid!);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result.body).toEqual(expectedResponse.body);
    })
})
