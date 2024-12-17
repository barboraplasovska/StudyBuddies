import request from "supertest";
import {app} from "../../../src/app";
import {HttpResponse} from "presentation/HttpResponse";
import {GroupUserModel} from "database/model/GroupUserModel";
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
import {GroupUserMember, GroupUserOwner} from "./utils/group-user";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {GroupModel} from "database/model/GroupModel";
import {GroupService} from "domain/service/GroupService";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {UserModel} from "database/model/UserModel";
import {UserRepository} from "database/repository/UserRepository";
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

describe("GroupRoutes", () => {

    const dbModel = {
        name: "MTI 2025",
        description: "Group for MTI major promotion 2025",
        address: "83 Boulevard Marius Vivier Merle, 69003 Lyon",
        picture: "https://www.weodeo.com/wp-content/uploads/2024/03/devops.webp"
    } as GroupModel;

    const userModel: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    beforeEach(() => {
        jest.spyOn(BugsnagWrapper.prototype, 'notify').mockImplementation(() => {})
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(userModel);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
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
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return status code 403 with a valid JWT but session is expired', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupUserModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all', LimitByEndpoints.getAll],
        ['getSchools', request(app).get, 'schools', LimitByEndpoints.getAll],
        ['getById', request(app).get, '1', LimitByEndpoints.getById],
        ['updateById', request(app).put, '1', LimitByEndpoints.put],
        ['insert', request(app).post, '', LimitByEndpoints.post],
        ['delete', request(app).delete, '1', LimitByEndpoints.delete],
        ['getByUserId', request(app).get, 'find/my', LimitByEndpoints.getById],
    ])('%s too many requests', async(_: any, req: any, path: string, limit: number) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        for (let i = 0; i < limit; i++) {
            await req(`/group/${path}`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await req(`/group/${path}`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ['getAllGroups', request(app).get, 'all'],
        ['getAllSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1'],
        ['createGroup', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return valid body and status code 500 on unhandled errors', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupModel>({ error: "Bad request!" }, 500);
        const mock = jest.spyOn(GroupService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAllGroups', request(app).get, 'all'],
        ['getAllSchools', request(app).get, 'schools'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1'],
        ['createGroup', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['getByUserId', request(app).get, 'find/my'],
    ])('%s should return valid body and status code 400 on bad requests', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<GroupModel>({ error: "Bad request!" }, 400);
        const mock = jest.spyOn(GroupService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getById", "1", request(app).get],
        ["getAllGroups", "all", request(app).get],
        ['getAllSchools', "schools", request(app).get],
        ["updateById", "1", request(app).put],
        ["createGroup", "", request(app).post],
        ["delete", "1", request(app).delete],
        ['getByUserId', "find/my", request(app).get],
    ])('%s should return valid body and status code 200 when group exists', async (operation: any, path: string, req: any) => {
        const expectedResponse = new HttpResponse<GroupModel>(dbModel, 200);
        const getByIdMock = jest.spyOn(GroupService.prototype, operation);

        getByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["updateById", "1", request(app).put],
        ["createGroup", "", request(app).post]
    ])('%s should return valid body and status code 401 when permissions are not valids', async (operation: any, path: string, req: any) => {
        const expectedResponse = new HttpResponse<GroupModel>({error: "Unauthorized !"}, 401);
        const getByIdMock = jest.spyOn(GroupService.prototype, operation);

        getByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);

        const res = await req(`/group/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })
})