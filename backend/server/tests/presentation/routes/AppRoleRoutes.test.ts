import {AppRoleService} from "domain/service/AppRoleService";
import {HttpResponse} from "presentation/HttpResponse";
import {AppRoleModel} from "database/model/AppRoleModel";
import {app} from "../../../src/app";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import request from "supertest"
import {
    decodeJWT,
    validJwtWithAdministratorPermission,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements
} from "./utils/jwt";
import {jwt} from "presentation/middlewares/authorization";
import { SessionService } from "domain/service/SessionService";
import { sessionExpired, sessionWithWrongUserId, validSession } from "./utils/session";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {UserModel} from "database/model/UserModel";
import {UserRepository} from "database/repository/UserRepository";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("AppRoleRoutes", () => {

    const dbModel: AppRoleModel = { id: "1", name: "Test AppRole" } as AppRoleModel;

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

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 when no authorization headers are provided', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/approle/${path}`)
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
        ['delete', request(app).delete, '1'],
    ])('%s should return status code 403 with a valid JWT but session is expired', async (endpoint: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all', LimitByEndpoints.getAll],
        ['getById', request(app).get, '1', LimitByEndpoints.getById],
        ['updateById', request(app).put, '1', LimitByEndpoints.put],
        ['insert', request(app).post, '', LimitByEndpoints.post],
        ['delete', request(app).delete, '1', LimitByEndpoints.delete]
    ])('%s too many requests', async(operation: any, req: any, path: string, limit: number) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        for (let i = 0; i < limit; i++) {
            await req(`/approle/${path}`)
                .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await req(`/approle/${path}`)
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1'],
        ['insert', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return valid body and status code 500 on unhandled errors', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Bad request!" }, 500);
        const mock = jest.spyOn(AppRoleService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1'],
        ['insert', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return valid body and status code 400 on bad requests', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Bad request!" }, 400);
        const mock = jest.spyOn(AppRoleService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad request!")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['updateById', request(app).put, '1'],
        ['insert', request(app).post, ''],
        ['delete', request(app).delete, '1']
    ])('%s should return valid body and status code 401 with valid JWT but invalid app role', async (operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Unauthorized !" }, 401);
        const mock = jest.spyOn(AppRoleService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });

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
        ['updateById', request(app).put, '1'],
        ['insert', request(app).post, ''],
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
        ["getAll", 200, request(app).get, "all"],
        ["getById", 200, request(app).get, "1"],
        ["insert", 201, request(app).post, "/"],
        ["delete", 200, request(app).delete, "1"]
    ])('%s should return valid body and status code %i with only one role', async (method: any, statusCode: number, req: any, path: string) => {
        const expectedResponse = new HttpResponse<AppRoleModel>(dbModel, statusCode);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const getAllMock = jest.spyOn(AppRoleService.prototype, method);
        getAllMock.mockResolvedValue(expectedResponse);

        const res = await req(`/approle/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ["delete", request(app).delete],
        ["getById", request(app).get],
        ["updateById", request(app).put]
    ])('%s by id should return valid body and status code 404 when app role does not exists', async (method: any, req: any) => {
        const expectedResponse = new HttpResponse<AppRoleModel>({ error: "Not Found." }, 404);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const deleteByIdMock = jest.spyOn(AppRoleService.prototype, method);
        deleteByIdMock.mockResolvedValue(expectedResponse);

        const res = await req(`/approle/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', "validSessionId");

        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })
})