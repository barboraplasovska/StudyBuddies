import {EventUserModel} from "database/model/EventUserModel";
import request from "supertest";
import {app} from "../../../src/app";
import {HttpResponse} from "presentation/HttpResponse";
import {jwt} from "presentation/middlewares/authorization";
import {
    decodeJWT,
    validJwtWithAdministratorPermission,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements
} from "./utils/jwt";
import {SessionService} from "domain/service/SessionService";
import {sessionExpired, sessionWithWrongUserId, validSession} from "./utils/session";
import {GroupUserService} from "domain/service/GroupUserService";
import {GroupUserAdmin, GroupUserMember, GroupUserOwner} from "./utils/group-user";
import {EventService} from "domain/service/EventService";
import {EventModel} from "database/model/EventModel";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {EventUserService} from "domain/service/EventUserService";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {UserModel} from "database/model/UserModel";
import {UserRepository} from "database/repository/UserRepository";
import {AppRoleModel} from "../../../src/database/model/AppRoleModel";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("EventUserRoutes", () => {

    const dbModel : EventUserModel = {
        id: "1",
        userid: "36",
        eventid: "1",
        grouproleid: "1"
    } as EventUserModel;

    const eventModel = {
        id: "1",
        name: "MTI 2025",
        description: "MTI group",
        groupId: "1",
        date: "2024-05-30",
        location: "online",
        link: "this is a tiny link",
        maxPeople: 50
    } as EventModel

    const userModel: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    const eventModelWithUndefinedGroupId = {
        id: "1",
        name: "MTI 2025",
        description: "MTI group",
        date: "2024-05-30",
        location: "online",
        link: "this is a tiny link",
        maxPeople: 50
    } as EventModel

    beforeEach(() => {
        jest.spyOn(BugsnagWrapper.prototype, 'notify').mockImplementation(() => {})
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(userModel);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ['(EU) getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/group/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['(EU) getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return valid body and status code 403 with non verified account', async (_: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid JWT) !" }, 403);
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue({...userModel, verified: false} as UserModel)

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/group/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/group/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['(EU) getById', request(app).get, '1'],
        ['(EU) updateById', request(app).put, '1/1'],
        ['(EU) insert', request(app).post, '/'],
        ['(EU) delete', request(app).delete, '1/1'],
    ])('%s should return status code 403 with a valid JWT but session is expired', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['(EU) updateById', request(app).put, '1/1', eventModel],
        ['(EU) delete', request(app).delete, '1/1', eventModel],
        ['(EU) updateById with undefined group', request(app).put, '1/1', eventModelWithUndefinedGroupId],
        ['(EU) delete with undefined group', request(app).delete, '1/1', eventModelWithUndefinedGroupId]
    ])('%s should return status code 401 with a valid JWT but invalid role and existing event', async (_: string, req: any, path: string, evModel: EventModel) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById')
            .mockResolvedValue(new HttpResponse<EventModel>(evModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getByEvent', request(app).get, '1/all', LimitByEndpoints.getAll],
        ['(EU) getById', request(app).get, '1', LimitByEndpoints.getById],
        ['(EU) updateById', request(app).put, '1/1', LimitByEndpoints.put],
        ['(EU) insert', request(app).post, '/', LimitByEndpoints.post],
        ['(EU) delete', request(app).delete, '1/1', LimitByEndpoints.delete],
    ])('%s too many requests', async(_: string, req: any, path: string, limit: number) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(eventModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        for (let i = 0; i < limit; i++) {
            await req(`/group/event/user/${path}`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await req(`/group/event/user/${path}`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ['getByEvent', request(app).get, '1/all', LimitByEndpoints.getAll],
        ['getById', request(app).get, '1', LimitByEndpoints.getById],
        ['updateById', request(app).put, '1/1', LimitByEndpoints.put],
        ['insert', request(app).post, '/', LimitByEndpoints.post],
        ['delete', request(app).delete, '1/1', LimitByEndpoints.delete],
    ])('(EU) %s should return valid body and status code 500 on unhandled exception', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Bad request!" }, 500);
        const mock = jest.spyOn(EventUserService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(eventModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getByEvent', request(app).get, '1/all', LimitByEndpoints.getAll],
        ['getById', request(app).get, '1', LimitByEndpoints.getById],
        ['updateById', request(app).put, '1/1', LimitByEndpoints.put],
        ['insert', request(app).post, '/', LimitByEndpoints.post],
        ['delete', request(app).delete, '1/1', LimitByEndpoints.delete],
    ])('(EU) %s should return valid body and status code 400 on bad request', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Bad Request." }, 400);
        const mock = jest.spyOn(EventUserService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(eventModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1/1'],
        ['delete', request(app).delete, '1/1'],
    ])('(EU) %s should return valid body and status code 404 when group user does not exists', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventUserModel>({ error: "Not Found." }, 404);
        const getByIdMock = jest.spyOn(EventUserService.prototype, operation);

        getByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(eventModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getByEvent', request(app).get, '1/all'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1/1'],
        ['insert', request(app).post, '/', 201],
        ['delete', request(app).delete, '1/1'],
    ])('(EU) %s should return status code 200', async (operation: any, req: any, path: string, statusCode = 200) => {
        const expectedResponse = new HttpResponse<EventUserModel>(dbModel, statusCode);
        const mockedValue = jest.spyOn(EventUserService.prototype, operation);

        mockedValue.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(eventModel));
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/event/user/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })
})