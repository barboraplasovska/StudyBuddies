import {DateWrapper} from "utils/wrapper/DateWrapper";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {HttpError} from "utils/errors/HttpError";
import {JWT} from "utils/jwt";
import {Socket} from "socket.io";
import {sessionService} from "domain/SessionService";
import {userRepository} from "infrastructure/repositories/UserRepository";
import {NextFunction, Request, Response} from "express";

const jwt = new JWT();

type JwtContent = {
    userId: string,
    appRoleId: string,
    iat: number
};

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
                await checkAccountValidity(decodedJWT.userId);
                req.jwt = authJwt;
                req.userId = decodedJWT.userId;
                req.appRoleId = decodedJWT.appRoleId;
                next();
            }
            else
            {
                res.status(403);
                res.json({error: "Forbidden (Invalid JWT) !"});
            }
        }
        catch (error) {
            res.status(403);
            res.json({error: "Forbidden (Invalid JWT) !"});
        }
    }
};

const socketCheckJWT = async (socket: Socket, next: (err?: Error) => void) => {
    const authHeader = socket.handshake?.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Forbidden (Missing authorization header or does not start with Bearer) !"));
    }

    try {
        const authJwt = authHeader.split(' ')[1];
        const decodedJWT = jwt.decodeJWT(authJwt) as JwtContent;

        if (decodedJWT.userId && decodedJWT.appRoleId) {
            socket.data.userId = decodedJWT.userId;
            await checkAccountValidity(decodedJWT.userId);
            next();
        } else {
            return next(new Error("Forbidden (Invalid JWT) !"));
        }
    } catch (error) {
        return next(new Error("Forbidden (Invalid JWT) !"));
    }
};


const isSessionValid = async (sessionId: string | string[] | undefined, userId: string) => {
    if (!sessionId || typeof sessionId !== "string")
    {
        return 1;
    }
    const session = await sessionService.isValidSession(sessionId);
    if (session === null || session.userid != userId)
    {
        return 2;
    }
    const expirationDate = new Date(session.expireat!).getTime();
    const currentDate = dateWrapper.getTime(Date.now());
    if (expirationDate >= currentDate)
        return 0;
    return 3;
};

const verifySession = async(req: Request, res: Response, next: NextFunction) => {
    const isValid = await isSessionValid(req.headers.sessionid, req.userId!);

    switch (isValid) {
        case 0:
            next();
            break;
        case 1:
            res.status(403);
            res.json({error: "Forbidden (Missing sessionId) !"});
            break;
        case 2:
            res.status(403);
            res.json({error: "Forbidden (Invalid session information) !"});
            break;
        case 3:
            res.status(403);
            res.json({error: "Session expired !"});
            break;
        default:
    }

};

const socketVerifySession = async(socket: Socket, next: (err?: Error) => void) => {
    const isValid = await isSessionValid(socket.handshake?.headers.sessionid, socket.data.userId! );

    switch (isValid) {
        case 0:
            next();
            break;
        case 1:
            next(new Error("Forbidden (Missing sessionId) !"));
            break;
        case 2:
            next(new Error("Forbidden (Invalid session information) !"));
            break;
        case 3:
            next(new Error("Session expired !"));
            break;
        default:
            next(new Error("No session information found!"));
    }
};

export {
    checkJWT,
    socketCheckJWT,
    verifySession,
    socketVerifySession,
    jwt
};