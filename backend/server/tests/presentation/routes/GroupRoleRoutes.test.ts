import {HttpResponse} from "presentation/HttpResponse";
import {app} from "../../../src/app";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {GroupRoleModel} from "database/model/GroupRoleModel";
import request from "supertest"
import {GroupRoleService} from "domain/service/GroupRoleService";
import {
    decodeJWT,
    validJwtWithAdministratorPermission,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements
} from "./utils/jwt";
import {jwt} from "presentation/middlewares/authorization";
import {SessionService} from "domain/service/SessionService";
import {sessionExpired, sessionWithWrongUserId, validSession} from "./utils/session";
import {GroupUserService} from "domain/service/GroupUserService";
import {GroupUserAdmin, GroupUserMember, GroupUserOwner} from "./utils/group-user";
import {GroupUserModel} from "database/model/GroupUserModel";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {UserRepository} from "database/repository/UserRepository";
import {UserModel} from "database/model/UserModel";
import {AppRoleModel} from "database/model/AppRoleModel";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("GroupRoleRoutes", () => {

    const dbModel: GroupRoleModel  = { id: "1", name: "Test GroupRole" } as GroupRoleModel;

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
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
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
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 403 with a valid JWT but session is expired', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return status code 401 with a valid JWT but invalid role', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ["getAll", "all", request(app).get, GroupUserAdmin],
        ["getById", "1", request(app).get, GroupUserAdmin],
        ["updateById", "1", request(app).put, GroupUserOwner],
        ["insert", "/", request(app).post, GroupUserOwner],
        ["delete", "1", request(app).delete, GroupUserOwner]
    ])('%s should return valid body and status code 400 on bad requests', async (operation: any, path: string, req: any, groupUser: GroupUserModel) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Bad request!" }, 400);
        const getAllMock = jest.spyOn(GroupRoleService.prototype, operation);

        getAllMock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(groupUser);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ["getAll", "all", request(app).get, GroupUserAdmin],
        ["getById", "1", request(app).get, GroupUserAdmin],
        ["updateById", "1", request(app).put, GroupUserOwner],
        ["insert", "/", request(app).post, GroupUserOwner],
        ["delete", "1", request(app).delete, GroupUserOwner]
    ])('%s should return valid body and status code 500 on unhandled exception', async (operation: any, path: string, req: any, groupUser: GroupUserModel) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Bad request!" }, 500);
        const getAllMock = jest.spyOn(GroupRoleService.prototype, operation);

        getAllMock.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(groupUser);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getAll", "all", LimitByEndpoints.getAll, request(app).get, GroupUserAdmin],
        ["getById", "1", LimitByEndpoints.getById, request(app).get, GroupUserAdmin],
        ["update", "1", LimitByEndpoints.put, request(app).put, GroupUserOwner],
        ["insert", "/", LimitByEndpoints.post, request(app).post, GroupUserOwner],
        ["delete", "1", LimitByEndpoints.delete, request(app).delete, GroupUserOwner]
    ])('%s too many requests', async (_: string, path: string, limit: number, req: any, groupUser: GroupUserModel) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(groupUser);

        for (let i = 0; i < limit; i++) {
            await req(`/group/role/${path}`)
                    .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                    .set('sessionId', 'validSessionId');
        }
        const res = await req(`/group/role/${path}`)
        .set('authorization', `Bearer ${validJwtWithUserPermission}`)
        .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ["delete", request(app).delete, GroupUserOwner],
        ["getById", request(app).get, GroupUserAdmin],
        ["updateById", request(app).put, GroupUserOwner]
    ])('%s by id should return valid body and status code 404 when app role does not exists', async (method: any, req: any, groupUser: GroupUserModel) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>({ error: "Not Found." }, 404);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const deleteByIdMock = jest.spyOn(GroupRoleService.prototype, method);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(groupUser);
        deleteByIdMock.mockResolvedValue(expectedResponse);

        const res = await req(`/group/role/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', "validSessionId");

        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getAll", 200, request(app).get, "all", GroupUserAdmin],
        ["getById", 200, request(app).get, "1", GroupUserAdmin],
        ["insert", 201, request(app).post, "/", GroupUserOwner],
        ["delete", 200, request(app).delete, "1", GroupUserOwner],
        ["updateById", 200, request(app).put, "1", GroupUserOwner]
    ])('%s should return valid body and status code %i with only one role', async (method: any, statusCode: number, req: any, path: string, groupUser: GroupUserModel) => {
        const expectedResponse = new HttpResponse<GroupRoleModel>(dbModel, statusCode);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const getAllMock = jest.spyOn(GroupRoleService.prototype, method);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(groupUser);

        getAllMock.mockResolvedValue(expectedResponse);

        const res = await req(`/group/role/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });
})