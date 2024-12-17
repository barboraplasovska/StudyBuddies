import {IMessage} from "infrastructure/models/message";
import request from "supertest";
import {jwt} from "presentation/middlewares/authorization";
import {server} from "../../../src/app";
import {UserRepository} from "infrastructure/repositories/UserRepository";
import {UserModel} from "infrastructure/models/UserModel";
import {
    decodeJWT,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements
} from "./utils/jwt";
import MessageService from "domain/MessageService";
import {SessionService} from "domain/SessionService";
import {validSession} from "./utils/session";

describe('MessageRoutes', () => {
    const messageModel: IMessage = {
        senderId: '1',
        roomId: '1',
        content: 'Hello Test!',
        createdAt: new Date(Date.parse('2018-08-10T00:00:00.000Z')),
        updatedAt: new Date(Date.parse('2018-08-10T00:00:00.000Z')),
    } as IMessage;

    const userModel: UserModel = {
        id: "1",
        name: "Paul",
        description: "YAKA Respo JS",
        roleId: "1",
        picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s",
        verified: true
    } as UserModel;

    beforeEach(() => {
        jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(userModel);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GetPaginated should return status code 403 when no authorization headers are provided', async () => {
        const expectedResponse = { body: { error: "Forbidden (Missing authorization header or does not start with Bearer) !" }, statusCode: 403 };

        const res = await request(server).get('/messages')
            .set('bypass-ratelimit', 'true');
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test('GetPaginated should return status code 403 when authorization headers does not start with Bearer', async () => {
        const expectedResponse = { body: { error: "Forbidden (Missing authorization header or does not start with Bearer) !" }, statusCode: 403};

        const res = await request(server).get('/messages')
            .set('bypass-ratelimit', 'true')
            .set('authorization', "DoNotStartWithBearer");
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test('GetPaginated should return status code 403 when an incorrect JWT is provided into auth headers', async () => {
        const expectedResponse = { body: { error: "Forbidden (Invalid JWT) !"}, statusCode: 403};

        const res = await request(server).get(`/messages`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer invalidJwt`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test('GetPaginated should return status code 403 with a well formed JWT but with invalid inner elements', async () => {
        const expectedResponse = { body: { error: "Forbidden (Invalid JWT) !"}, statusCode: 403};

        jest.spyOn(jwt, "decodeJWT").mockImplementation(() => {
            throw new Error("Invalid signature")
        });

        const res = await request(server).get(`/messages`)
            .set('bypass-ratelimit', 'true')
            .set('authorization', `Bearer ${wellFormedJwtWithoutValidElements}`);
        expect(res.statusCode).toBe(expectedResponse.statusCode);
        expect(res.body).toEqual(expectedResponse.body);
    });

    test('GetPaginated should return too many requests', async() => {
        const expectedResponse : String = "Too many requests, please try again later.";

        jest.spyOn(jwt, "decodeJWT").mockReturnValue(decodeJWT(validJwtWithUserPermission));
        jest.spyOn(SessionService.prototype, 'isValidSession').mockResolvedValue(validSession);
        jest.spyOn(MessageService.prototype, 'getPaginatedMessages').mockResolvedValue([]);

        for (let i = 0; i < 150; i++) {
            await request(server).get(`/messages`)
                .set('authorization', `Bearer ${validJwtWithUserPermission}`)
                .set('sessionId', 'validSessionId');
        }
        const res = await request(server).get(`/messages`)
            .set('authorization', `Bearer ${validJwtWithUserPermission}`)
            .set('sessionId', 'validSessionId');
        expect(res.text).toEqual(expectedResponse);
        expect(res.status).toBe(429);
    })

    test('GetPaginated should return 200 with a list of messages', () => {

    });
});