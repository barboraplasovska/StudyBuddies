import {GroupWaitingListModel} from "database/model/GroupWaitingListModel";
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
import {GroupWaitingListService} from "domain/service/GroupWaitingListService";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {GroupModel} from "database/model/GroupModel";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {UserModel} from "database/model/UserModel";
import {UserRepository} from "database/repository/UserRepository";
import {AppRoleModel} from "../../../src/database/model/AppRoleModel";
import {GroupEntity} from "../../../src/domain/entity/GroupEntity";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("GroupWaitingListRoutes", () => {

    const dbModel: GroupWaitingListModel  = { id: "1", userid: "1", groupid: "1" } as GroupWaitingListModel;
    const userModel: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    afterEach(() => {
        jest.restoreAllMocks();
    })

    beforeEach(() => {
        jest.spyOn(BugsnagWrapper.prototype, 'notify').mockImplementation(() => {})
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(userModel);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
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
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroup', request(app).get, '1'],
        ['getByUser', request(app).get, 'my']
    ])('%s should return status code 403 with a valid JWT but session is expired', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1']
    ])('%s should return status code 401 with a valid JWT but invalid role', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroupId', request(app).get, '1'],
        ['getByUserId', request(app).get, 'my']
    ])('%s should return valid body and status code 500 on unhandled error', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Bad request!" }, 500);
        const getAllMock = jest.spyOn(GroupWaitingListService.prototype, operation);
        getAllMock.mockImplementationOnce((..._) => {
            throw new Error("Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['join', request(app).post, 'join/1'],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1'],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroupId', request(app).get, '1'],
        ['getByUserId', request(app).get, 'my']
    ])('%s should return valid body and status code 400 on bad requests', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>({ error: "Bad request!" }, 400);
        const getAllMock = jest.spyOn(GroupWaitingListService.prototype, operation);

        getAllMock.mockImplementationOnce((..._) => {
            throw new HttpError(ErrorEnum.BAD_REQUEST,"Bad request!");
        });
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['join', request(app).post, 'join/1', LimitByEndpoints.post],
        ['leave', request(app).delete, 'leave/1', LimitByEndpoints.delete],
        ['accept', request(app).post, 'accept/1/1', LimitByEndpoints.post],
        ['decline', request(app).delete, 'decline/1/1', LimitByEndpoints.delete],
        ['getByGroupId', request(app).get, '1', LimitByEndpoints.getById],
        ['getByUser', request(app).get, 'my', LimitByEndpoints.getById]
    ])('%s too many requests', async (_: string, req: any, path: string, limit: number) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        for (let i = 0; i < limit; i++) {
            await req(`/group/waitinglist/${path}`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await req(`/group/waitinglist/${path}`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    it('getByGroupId should return valid body and status code 404 when group does not exists', async () => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel[]>({ error: "Not Found." }, 404);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const getByGroupMock = jest.spyOn(GroupWaitingListService.prototype, 'getByGroupId');
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);
        getByGroupMock.mockResolvedValue(expectedResponse);

        const res = await request(app)
            .get(`/group/waitinglist/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', "validSessionId");

        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['join', request(app).post, 'join/1', 201],
        ['leave', request(app).delete, 'leave/1'],
        ['accept', request(app).post, 'accept/1/1', 201],
        ['decline', request(app).delete, 'decline/1/1'],
        ['getByGroupId', request(app).get, '1']
    ])('%s should return valid body and status code 200 (or 201) with only one role', async (method: any, req: any, path: string, statusCode: number = 200) => {
        const expectedResponse = new HttpResponse<GroupWaitingListModel>(dbModel, statusCode);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const getAllMock = jest.spyOn(GroupWaitingListService.prototype, method);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        getAllMock.mockResolvedValue(expectedResponse);

        const res = await req(`/group/waitinglist/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    it('getByUser should return valid body and status code 200', async () => {
        const expectedResponse = new HttpResponse<GroupEntity[]>([{
            name: "MTI 2025",
            description: "Group for MTI major promotion 2025"
        } as GroupEntity])

        const getByUserIdMock = jest.spyOn(GroupWaitingListService.prototype, 'getByUserId');
        getByUserIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await request(app).get(`/group/waitinglist/my`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
    });
})