import {AppRoleEnum} from "utils/enumerations/AppRoleEnum";
import {DateWrapper} from "utils/wrapper/DateWrapper";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {EventModel} from "database/model/EventModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";
import {HttpError} from "utils/errors/HttpError";
import {JWT} from "utils/jwt";
import {JwtContent} from "domain/entity/AuthEntity";
import {eventService} from "domain/service/EventService";
import {groupUserService} from "domain/service/GroupUserService";
import {sessionService} from "domain/service/SessionService";
import {userRepository} from "database/repository/UserRepository";
import {NextFunction, Request, Response} from "express";

const jwt = new JWT();
const dateWrapper = new DateWrapper();


/**
 * @swagger
 * components:
 *   responses:
 *     Forbidden:
 *       description: Forbidden access to data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForbiddenResponse'
 *     Unauthorized:
 *       description: Unauthorized access to data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnauthorizedResponse'
 */

const checkAccountValidity = async(userId: string) => {
    const user = await userRepository.getById(userId);
    if (user === null)
        throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");

    if (user.verified === undefined || !user.verified)
        throw new HttpError(ErrorEnum.UNAUTHORIZED, "Unauthorized");
};

const checkJWT = async(req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        res.status(403);
        res.json({error: "Forbidden (Missing authorization header or does not start with Bearer) !"});
    }
    else
    {
        try {
            const authJwt = req.headers.authorization!.split(' ')[1];
            const decodedJWT = jwt.decodeJWT(authJwt) as JwtContent;
            if (decodedJWT.userId && decodedJWT.appRoleId)
            {
                req.jwt = authJwt;
                req.userId = decodedJWT.userId;
                req.appRoleId = decodedJWT.appRoleId;
                await checkAccountValidity(decodedJWT.userId);
                next();
            }
            else
            {
                res.status(403);
                res.json({error: "Forbidden (Invalid JWT) !"});
            }
        }
        catch {
            res.status(403);
            res.json({error: "Forbidden (Invalid JWT) !"});
        }
    }
};

const verifySession = async(req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.headers.sessionid;
    if (!sessionId || typeof sessionId !== "string")
    {
        res.status(403);
        res.json({error: "Forbidden (Missing sessionId) !"});
    }
    else
    {
        const session = await sessionService.isValidSession(sessionId);
        if (session === null || session.userid != req.userId)
        {
            res.status(403);
            res.json({error: "Forbidden (Invalid session information) !"});
        }
        else {
            const expirationDate = new Date(session.expireat!).getTime();
            const currentDate = dateWrapper.getTime(Date.now());
            if (expirationDate >= currentDate)
                next();
            else
            {
                res.status(403);
                res.json({error: "Session expired !"});
            }
        }
    }
};

const checkAppRole = (required: AppRoleEnum) => (req: Request, res: Response, next: NextFunction) => {
    if (req.appRoleId! <= required)
        next();
    else
    {
        res.status(401);
        res.json({error: "Unauthorized !"});
    }
};

const checkGroupRoleByGroupID = async (required: GroupRoleEnum, groupId: string, userId: string) => {
    const groupUser = await groupUserService.getByGroupAndUser(groupId, userId);
    return groupUser !== null && groupUser.grouproleid! <= required;
};

const checkGroupRole = (required: GroupRoleEnum) => async(req: Request, res: Response, next: NextFunction) => {
    const hasValidPermission = await checkGroupRoleByGroupID(required, req.params.id, req.userId!);
    if (hasValidPermission)
        next();
    else
    {
        res.status(401);
        res.json({error: "Unauthorized !"});
    }
};

const checkGroupRoleWithEvent = (required: GroupRoleEnum) => async(req: Request, res: Response, next: NextFunction) => {
    const eventModel = await eventService.getById(req.params.id);
    const event = eventModel.body as EventModel;
    if (event !== null && event.groupId != undefined) {
        // TODO: check perm in eventUser not groupUser
        const hasValidPermission = await checkGroupRoleByGroupID(required, event.groupId, req.userId!);
        if (hasValidPermission)
            next();
        else {
            res.status(401);
            res.json({error: "Unauthorized !"});
        }
    }
    else {
        res.status(401);
        res.json({error: "Unauthorized !"});
    }
};

const checkGroupRoleCreateEvent = (required: GroupRoleEnum) => async(req: Request, res: Response, next: NextFunction) => {
    const hasValidPermission = await checkGroupRoleByGroupID(required, req.body.groupId, req.userId!);
    if (hasValidPermission)
        next();
    else
    {
        res.status(401);
        res.json({error: "Unauthorized !"});
    }
};

const checkUser = (
            requiredAppRole: AppRoleEnum = AppRoleEnum.ADMINISTRATOR
        ) => (req: Request, res: Response, next: NextFunction) => {
    if (req.userId == req.params.id || requiredAppRole >= req.appRoleId!)
        next();
    else
    {
        res.status(401);
        res.json({error: "Unauthorized !"});
    }
};

const isUserRegisteredInEvent = ()  => async (req: Request, res: Response, next: NextFunction) => {
    const isRegistered = await eventService.isUserRegisteredInEvent(req.params.id, req.userId);
    if (isRegistered.statusCode !== 200)
        res.status(isRegistered.statusCode).json(isRegistered.body);
    else
        next();
};

export {
    checkJWT,
    verifySession,
    checkAppRole,
    checkGroupRole,
    checkUser,
    checkGroupRoleWithEvent,
    checkGroupRoleCreateEvent,
    isUserRegisteredInEvent,
    jwt
};