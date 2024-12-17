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
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {EventModel} from "database/model/EventModel";
import {EventService} from "domain/service/EventService";
import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import {HttpError} from "utils/errors/HttpError";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {UserModel} from "database/model/UserModel";
import {UserRepository} from "database/repository/UserRepository";
import {AppRoleModel} from "database/model/AppRoleModel";
import {icsCalendarService} from "domain/service/ICSCalendarService";
import ical from "ical-generator";
import {CredentialRepository} from "database/repository/CredentialRepository";
import {CredentialModel} from "database/model/CredentialModel";
import {emailService} from "domain/service/EmailService";
import {EventEntity} from "../../../src/domain/entity/EventEntity";
import {GroupModel} from "../../../src/database/model/GroupModel";
import {UserWithGroupRoleEntity} from "../../../src/domain/entity/UserEntity";

jest.mock('redis', () => ({
    createClient: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
    }))
}))

describe("EventRoutes", () => {

    const onlineDbModel : EventModel = {
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

    const onlineDbModelWithUndefinedName : EventModel = {
        id: "1",
        name: undefined,
        description: "",
        groupId: "1",
        date: "20-12-2028",
        location: "online",
        link: "link",
        address: undefined,
        maxPeople: 10
    } as EventModel;

    const userModel: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    const groupModel = {
        name: "MTI 2025",
        description: "Group for MTI major promotion 2025",
        address: "83 Boulevard Marius Vivier Merle, 69003 Lyon",
        picture: "https://www.weodeo.com/wp-content/uploads/2024/03/devops.webp"
    } as GroupModel;

    const calendar = ical({name: "StudyBuddies Event"});

    beforeEach(() => {
        jest.spyOn(BugsnagWrapper.prototype, 'notify').mockImplementation(() => {})
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(userModel)
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 when no authorization headers are provided', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 when authorization headers does not start with Bearer', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Missing authorization header or does not start with Bearer) !"}, 403);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 when an incorrect JWT is provided into auth headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 with a well formed JWT but with invalid inner elements', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Invalid JWT) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 with a valid JWT but no sessionId provided into headers', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Missing sessionId) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
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
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 with a valid JWT but sessionId does not exist', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(null);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 with a valid JWT but sessionId does not corresponds to the given JWT userId', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Forbidden (Invalid session information) !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionWithWrongUserId);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'invalid session id');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getAll', request(app).get, 'all'],
        ['getById', request(app).get, '1'],
        ['getByFilter', request(app).get, 'filter'],
        ['getCalendar', request(app).get, 'calendar/1'],
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
        ['calendarExport', request(app).post, 'calendar/export/1'],
        ['shareCalendar', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return status code 403 with a valid JWT but session is expired', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Session expired !"}, 403);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithAdministratorPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(sessionExpired);

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithAdministratorPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['update', request(app).put, '1'],
        ['create', request(app).post, ''],
        ['delete', request(app).delete, '1'],
        ['updateLocation', request(app).patch, '1/location'],
    ])('%s should return status code 401 with a valid JWT but invalid role', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserMember);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test.each([
        ['getCalendar', request(app).get, 'calendar/1'],
        ['Export', request(app).post, 'calendar/export/1'],
        ['Share', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return 401 if the user who execute the request is not registered in the event', async (_: string, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Unauthorized !"}, 401);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(expectedResponse);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAll', request(app).get, 'all', LimitByEndpoints.getAll],
        ['getById', request(app).get, '1', LimitByEndpoints.getById],
        ['getByFilter', request(app).get, 'filter', LimitByEndpoints.getAll],
        ['getCalendar', request(app).get, 'calendar/1', LimitByEndpoints.getById],
        ['update', request(app).put, '1', LimitByEndpoints.put],
        ['create', request(app).post, '', LimitByEndpoints.post],
        ['delete', request(app).delete, '1', LimitByEndpoints.delete],
        ['updateLocation', request(app).patch, '1/location', LimitByEndpoints.patch],
        ['calendarExport', request(app).post, 'calendar/export/1', LimitByEndpoints.post],
        ['calendarShare', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com', LimitByEndpoints.post]
    ])('%s too many requests', async(_: string, req: any, path: string, limit: number) => {
        const expectedResponse : String = "Too many requests, please try again later.";

        const calendar = ical({name: "StudyBuddies Event"});
        jest.spyOn(icsCalendarService, 'generateCalendar').mockImplementationOnce(() => {
            return calendar;
        });
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));
        jest.spyOn(CredentialRepository.prototype, 'getByUserId').mockResolvedValue({
            id: "1",
            userid: "1",
            email: "paul.genillon@epita.fr",
            password: "unsecured_password",
            salt: "this_is_a_salt"
        } as CredentialModel);
        jest.spyOn(emailService, 'sendCalendar').mockImplementation();
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(new HttpResponse<EventModel>({error: "None !"}));
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);

        for (let i = 0; i < limit; i++) {
            await req(`/group/event/${path}`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await req(`/group/event/${path}`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(429);
        expect(res.text).toEqual(expectedResponse);
    })

    test.each([
        ['getAll', 'getAll', request(app).get, 'all'],
        ['getById', 'getById', request(app).get, '1'],
        ['getByFilter', 'getByFilter', request(app).get, 'filter'],
        ['getCalendar', 'getById', request(app).get, 'calendar/1'],
        ['createEvent', 'createEvent', request(app).post, ''],
        ['updateById', 'updateById', request(app).put, '1'],
        ['delete', 'delete', request(app).delete, '1'],
        ['updateLocation', 'updateLocation', request(app).patch, '1/location'],
        ['exportCalendar', 'getById', request(app).post, 'calendar/export/1'],
        ['shareCalendar', 'getById', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return valid body and status code 500 on unhandled error', async (_:string, operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Bad request!" }, 500);

        jest.spyOn(EventService.prototype, operation).mockImplementationOnce(() => {
            throw new Error("Bad request!")
        });
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel, 200));


        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ['getAll', 'getAll', request(app).get, 'all'],
        ['getById', 'getById', request(app).get, '1'],
        ['getByFilter', 'getByFilter', request(app).get, 'filter'],
        ['getCalendar', 'getById', request(app).get, 'calendar/1'],
        ['createEvent', 'createEvent', request(app).post, ''],
        ['updateById', 'updateById', request(app).put, '1'],
        ['delete', 'delete', request(app).delete, '1'],
        ['updateLocation', 'updateLocation', request(app).patch, '1/location'],
        ['exportCalendar', 'getById', request(app).post, 'calendar/export/1'],
        ['shareCalendar', 'getById', request(app).post, 'calendar/share/1/paul.genillon63@gmail.com']
    ])('%s should return valid body and status code 400 on bad requests', async (_: string, operation: any, req: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Bad Request." }, 400);
        const mock = jest.spyOn(EventService.prototype, operation);

        mock.mockImplementationOnce(() => {
            throw new HttpError(ErrorEnum.BAD_REQUEST, "Bad Request.")
        });

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel, 200));

        const res = await req(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('getAll should return valid body and status code 200 with only one role', async () => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 200);
        const getAllMock = jest.spyOn(EventService.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .get(`/group/event/all`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    it('getAll should return valid body and status code 200 with multiple roles', async () => {
        const secondUser : EventModel =  {
            id: "2",
            name: "Study 2",
            description: "",
            groupId: "1",
            date: "20-12-2028",
            location: "online",
            link: "link",
            address: undefined,
            maxPeople: 11
        } as EventModel;
        const body = [onlineDbModel, secondUser]

        const expectedResponse = new HttpResponse<EventModel>(body, 200);
        const getAllMock = jest.spyOn(EventService.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .get(`/group/event/all`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedResponse.body);
    })

    test.each([
        ["getById", "1"]
    ])('%s should return valid body and status code 200 when event exists', async (operation: any, path: string) => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 200);
        const getByIdMock = jest.spyOn(GroupUserService.prototype, operation);

        getByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .get(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('get by id should return valid body and status code 404 when event does not exists', async () => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Not Found." }, 404);
        const getByIdMock = jest.spyOn(EventService.prototype, 'getById');

        getByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .get(`/group/event/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(404);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('get by filter should return a valid body and status code 200', async () => {
        const expectedEvent = {...onlineDbModel, group: groupModel, users: [] as UserWithGroupRoleEntity[]} as EventEntity
        const expectedResponse = new HttpResponse<EventEntity[]>([expectedEvent], 200);

        jest.spyOn(EventService.prototype, 'getByFilter').mockResolvedValue(expectedResponse);
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));

        const res = await request(app)
            .get('/group/event/filter')
            .query({ day: '2025-10-10', time: '10:29' })
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('get calendar should return a valid body and status 200', async () => {
        const expectedResponse = new HttpResponse<string>(calendar.toString(), 200);

        jest.spyOn(icsCalendarService, 'generateCalendar').mockReturnValue(calendar);
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));

        const res = await request(app)
            .get('/group/event/calendar/1')
            .query({ day: '2025-10-10', time: '10:29' })
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');

        expect(res.status).toBe(200);
        expect(res.text).toEqual(expectedResponse.body);
    });

    it('update by id should return valid body and status code 200 when event exists', async () => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 200);
        const updateByIdMock = jest.spyOn(EventService.prototype, 'updateById');

        updateByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));

        const res = await request(app)
            .put(`/group/event/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('update by id should return valid body and status code 404 when event does not exists', async () => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Not Found." }, 404);
        const updateById = jest.spyOn(EventService.prototype, 'updateById');

        updateById.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .put(`/group/event/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(404);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('createEvent should return valid body and status code 201 when event has been created', async () => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 201);
        const insertMock = jest.spyOn(EventService.prototype, 'createEvent');

        insertMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .post(`/group/event`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(201);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('delete by id should return valid body and status code 200 when event exists', async () => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 200);
        const deleteByIdMock = jest.spyOn(EventService.prototype, 'delete');

        deleteByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .delete(`/group/event/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('delete by id should return valid body and status code 404 when event does not exists', async () => {
        const expectedResponse = new HttpResponse<EventModel>({ error: "Not Found." }, 404);
        const deleteByIdMock = jest.spyOn(EventService.prototype, 'delete');

        deleteByIdMock.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserAdmin);

        const res = await request(app)
            .delete(`/group/event/1`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.status).toBe(404);
        expect(res.body).toEqual(expectedResponse.body);
    })

    it('updateLocation should return the edited event with status code 200', async () => {
        const expectedResponse = new HttpResponse<EventModel>(onlineDbModel, 200);
        const mockedValue = jest.spyOn(EventService.prototype, 'updateLocation');

        mockedValue.mockResolvedValue(expectedResponse);

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(GroupUserService.prototype, 'getByGroupAndUser').mockResolvedValue(GroupUserOwner);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(expectedResponse);

        const res = await request(app)
            .patch(`/group/event/1/location`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
    
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ['export', 'calendar/export/1'],
        ['share', 'calendar/share/1/paul.genillon63@gmail.com']
    ])('Calendar %s but user is not registered to given event', async (_:string, path: string) => {
        const expectedResponse = new HttpResponse({error: "Unauthorized."}, ErrorEnum.UNAUTHORIZED)
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(expectedResponse);
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await request(app)
            .post(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ['export', 'calendar/export/1'],
        ['share', 'calendar/share/1/paul.genillon63@gmail.com']
    ])('Calendar %s with registered user and undefined event name', async (_:string, path: string) => {
        const expectedResponse = new HttpResponse({error: "Bad Request."}, ErrorEnum.BAD_REQUEST)
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(
            new HttpResponse({error: "None!"})
        );
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(
            new HttpResponse(onlineDbModelWithUndefinedName)
        )

        const res = await request(app)
            .post(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ['export', 'calendar/export/1', 'getByUserId']
    ])('Calendar %s with registered user and null credential', async (_:string, path: string, mock: any) => {
        const expectedResponse = new HttpResponse({error: "Not Found."}, ErrorEnum.NOT_FOUND)

        jest.spyOn(icsCalendarService, 'generateCalendar').mockImplementationOnce(() => {
            return calendar;
        });
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));
        jest.spyOn(CredentialRepository.prototype, mock).mockResolvedValue(null);
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(new HttpResponse<EventModel>({error: "None !"}));
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await request(app)
            .post(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ['export', 'calendar/export/1', 'getByUserId']
    ])('Calendar %s with registered user and undefined credential user email', async (_:string, path: string, mock: any) => {
        const expectedResponse = new HttpResponse({error: "Not Found."}, ErrorEnum.NOT_FOUND)

        jest.spyOn(icsCalendarService, 'generateCalendar').mockImplementationOnce(() => {
            return calendar;
        });
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));
        jest.spyOn(CredentialRepository.prototype, mock).mockResolvedValue({
            id: "1",
            userid: "1",
            email: undefined,
            password: "unsecured_password",
            salt: "this_is_a_salt"
        } as CredentialModel);
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(new HttpResponse<EventModel>({error: "None !"}));
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await request(app)
            .post(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })

    test.each([
        ['export', 'calendar/export/1', 'getByUserId'],
        ['share', 'calendar/share/1/paul.genillon63@gmail.com', 'getByEmail']
    ])('Calendar %s in normal usage condition', async (_:string, path: string, mock: any) => {
        const expectedResponse = new HttpResponse({})

        jest.spyOn(icsCalendarService, 'generateCalendar').mockImplementationOnce(() => {
            return calendar;
        });
        jest.spyOn(EventService.prototype, 'getById').mockResolvedValue(new HttpResponse<EventModel>(onlineDbModel));
        jest.spyOn(CredentialRepository.prototype, mock).mockResolvedValue({
            id: "1",
            userid: "1",
            email: "paul.genillon@epita.fr",
            password: "unsecured_password",
            salt: "this_is_a_salt"
        } as CredentialModel);
        jest.spyOn(emailService, 'sendCalendar').mockResolvedValue(new HttpResponse({}))
        jest.spyOn(EventService.prototype, 'isUserRegisteredInEvent').mockResolvedValue(new HttpResponse<EventModel>({error: "None !"}));
        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);

        const res = await request(app)
            .post(`/group/event/${path}`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.body).toEqual(expectedResponse.body);
        expect(res.status).toBe(expectedResponse.statusCode);
    })
})