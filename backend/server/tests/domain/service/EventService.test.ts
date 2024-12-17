import {userRepository, UserRepository} from "database/repository/UserRepository";
import { HttpResponse } from "presentation/HttpResponse";
import { EventService } from "domain/service/EventService";
import {eventRepository, EventRepository} from "database/repository/EventRepository";
import {EventLocation, EventModel} from "database/model/EventModel";
import {groupRepository, GroupRepository} from "database/repository/GroupRepository";
import {groupUserRepository, GroupUserRepository} from "database/repository/GroupUserRepository";
import {eventUserRepository, EventUserRepository} from "database/repository/EventUserRepository";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {EventUserModel} from "database/model/EventUserModel";
import {EventEntity} from "domain/entity/EventEntity";
import {UserWithGroupRoleEntity} from "domain/entity/UserEntity";
import {UserModel} from "database/model/UserModel";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import { GroupUserModel } from "database/model/GroupUserModel";
import {EventConverter} from "domain/converter/EventConverter";

describe("EventService", () => {

    const dbModel : EventModel = {
        id: "1",
        name: "Study",
        description: "",
        groupId: "1",
        date: "20-12-2028",
        location: "online",
        link: "link",
        address: undefined,
        maxPeople: 10
    } as EventModel;

    const dbModelOffline : EventModel = {
        id: "1",
        name: "Study",
        description: "",
        groupId: "1",
        date: "20-12-2028",
        location: "offline",
        link: "link",
        address: "14 Avenue Voltaire",
        maxPeople: 10
    } as EventModel;

    const entity : EventEntity = {
        ...dbModel,
        users: [] as UserWithGroupRoleEntity[]
    } as EventEntity;

    const eventService = new EventService(
        eventRepository,
        groupRepository,
        groupUserRepository,
        userRepository,
        eventUserRepository
    );

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the events and a status code of 200', async () => {
        const expectedResponse : EventModel[] = [dbModel];
        const getAllMock = jest.spyOn(EventRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : EventModel[] = [];
        const getAllMock = jest.spyOn(EventRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await eventService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse = new HttpResponse({ ...dbModel, group: null, users: [] },200);

        jest.spyOn(EventRepository.prototype, 'getById').mockResolvedValue(dbModel);
        jest.spyOn(GroupRepository.prototype, 'getById').mockResolvedValue(null);
        jest.spyOn(EventUserRepository.prototype, 'getByEventId').mockResolvedValue([]);
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(null);

        const result = await eventService.getById(dbModel.id);

        expect(result.statusCode).toEqual(expectedResponse.statusCode);
        expect(result).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(EventRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('getByUserId should return an empty list with a status code 200', async () => {
        const expectedResponse: EventEntity[] = [];
        jest.spyOn(EventUserRepository.prototype, 'getByUserId').mockResolvedValue([]);

        const result = await eventService.getByUserId('userid');
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('getByUserId should return a list with a status code 200', async () => {
        const expectedResponse : EventEntity[] = [entity];
        jest.spyOn(EventUserRepository.prototype, 'getByUserId')
            .mockResolvedValue([{} as EventUserModel])
        jest.spyOn(EventUserRepository.prototype, 'getByEventId')
            .mockResolvedValue([])
        jest.spyOn(EventRepository.prototype, 'getById')
            .mockResolvedValue(dbModel)
        jest.spyOn(GroupRepository.prototype, 'getById')
            .mockResolvedValue(null);
        jest.spyOn(UserRepository.prototype, 'getById')
            .mockResolvedValue({} as UserModel);

        const result = await eventService.getByUserId(dbModel.id);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    test.each([
        ['day', undefined, undefined],
        [undefined, 'time', undefined],
        [undefined, undefined, 'userId'],
        [undefined, undefined, undefined]
    ])('getByFilter should return a list with a status code 200', async (day: string | undefined, time: string | undefined, userId: string | undefined) => {
        const expectedResponse: EventModel = dbModel;
        const groupUserDbModel: GroupUserModel = {
            id: "1",
            userid: "userId",
            groupid: "1",
            grouproleid: "2"
        } as GroupUserModel;

        jest.spyOn(GroupUserRepository.prototype, 'getByUserId').mockResolvedValue([groupUserDbModel]);
        jest.spyOn(EventConverter.prototype, 'toEventEntity').mockResolvedValue(entity)
        jest.spyOn(EventRepository.prototype, 'getByFilter').mockResolvedValue([entity]);

        const result = await eventService.getByFilter(day as string, time as string, userId);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual([entity]);
    })

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventModel = dbModel;
        const updateByIdMock = jest.spyOn(EventRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await eventService.updateById(dbModelOffline.id, dbModelOffline);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(EventRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await eventService.updateById(dbModel.id, dbModelOffline);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : EventModel = dbModel;
        const insertMock = jest.spyOn(EventRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await eventService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventModel = dbModel;
        const deleteMock = jest.spyOn(EventRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await eventService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('createEvent should return the expected object with a status code of 201', async () => {
        const expectedResponse : EventModel = dbModel;
        const insertMock = jest.spyOn(EventRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const insertEventUserMock = jest.spyOn(EventUserRepository.prototype, 'insert');
        insertEventUserMock.mockResolvedValue({
            userid: "1",
            eventid: expectedResponse.id,
            grouproleid: GroupRoleEnum.OWNER
        } as EventUserModel);

        const result = await eventService.createEvent(dbModel, "1");

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
        expect(insertEventUserMock).toHaveBeenCalled();
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const deleteMock = jest.spyOn(EventRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await eventService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateLocation should return the expected object with a status code of 200', async () => {
        const expectedResponse : EventModel = dbModel;
        jest.spyOn(EventRepository.prototype, 'updateById').mockResolvedValue(expectedResponse);

        const result = await eventService.updateLocation(dbModel.id, dbModel.location!, dbModel.link, dbModel.address);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    })

    it('updateLocation should return Not Found with a status code of 404', async () => {
        jest.spyOn(EventRepository.prototype, 'updateById').mockResolvedValue(null);
        await expect(async () => {
            await eventService.updateLocation(dbModel.id, dbModel.location!, dbModel.link, dbModel.address);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    })

    test.each([
        [EventLocation.OFFLINE, "link", undefined],
        [EventLocation.ONLINE, undefined, "address"]
    ])('updateLocation should return Bad Request with a status code of 400 with invalid information', async (location: EventLocation, link?: string | undefined, address?: string | undefined) => {
        await expect(async () => {
            await eventService.updateLocation(dbModel.id, location, link, address);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request."));
    })
})
