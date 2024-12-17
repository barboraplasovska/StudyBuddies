import {SessionModel} from "infrastructure/models/SessionModel";

const validSession: SessionModel = {
    id: "1",
    userid: "36",
    expireat: "2100-05-14 15:38:28"
} as SessionModel;

const sessionWithWrongUserId : SessionModel = {
    id: "1",
    userid: "800",
    expireat: "2100-05-14 15:38:28"
} as SessionModel;

const sessionExpired : SessionModel = {
    id: "1",
    userid: "36",
    expireat: "2010-05-14 15:38:28"
} as SessionModel;

export {
    validSession,
    sessionWithWrongUserId,
    sessionExpired,
}