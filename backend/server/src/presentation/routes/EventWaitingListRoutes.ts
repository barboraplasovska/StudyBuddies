import { EventUserModel } from "database/model/EventUserModel";
import { EventWaitingListModel } from "database/model/EventWaitingListModel";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { HttpResponse } from "../HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { eventWaitingListService } from "domain/service/EventWaitingListService";
import setMetricsByRoute from "../middlewares/metrics";
import { checkGroupRoleWithEvent, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const eventWaitingListRouter = express.Router();

eventWaitingListRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: EventWaitingList
 *   description: Events Waiting List handling
 */

/**
 * @swagger
 * /group/event/waitinglist/join/{eventid}:
 *   post:
 *     summary: Make the authenticated user join the event waiting list.
 *     description: Make the authenticated user join the event waiting list.
 *     tags: [EventWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: eventid
 *        in: path
 *        required: true
 *        description: Numeric ID of the event's id to join.
 *        schema:
 *           type: string
 *     responses:
 *       201:
 *         description: The user has successfully joined the waiting list.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventWaitingListRouter.post('/join/:eventid', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventWaitingListModel> = await eventWaitingListService.join(req.userId!, req.params.eventid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/waitinglist/leave/{eventid}:
 *   delete:
 *     summary: Make the authenticated user leave the event waiting list.
 *     description: Make the authenticated user leave the event waiting list.
 *     tags: [EventWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: eventid
 *        in: path
 *        required: true
 *        description: Numeric ID of the event's id to leave.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user has successfully left the waiting list.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventWaitingListRouter.delete('/leave/:eventid', createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: HttpResponse<EventWaitingListModel> = await eventWaitingListService.leave(req.userId!, req.params.eventid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/waitinglist/accept/{id}/{userid}:
 *   post:
 *     summary: Give access to the group.
 *     description: Make the authenticated user leave the group waiting list.
 *     tags: [EventWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned event's id.
 *        schema:
 *           type: string
 *      - name: userid
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned user's id.
 *        schema:
 *           type: string
 *     responses:
 *       201:
 *         description: The user has been accepted in the event.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventUserResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventWaitingListRouter.post('/accept/:id/:userid', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventUserModel> = await eventWaitingListService.accept(req.params.userid, req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/waitinglist/decline/{id}/{userid}:
 *   delete:
 *     summary: Decline access to the event.
 *     description: Make the authenticated user leave the event waiting list.
 *     tags: [EventWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned event's id.
 *        schema:
 *           type: string
 *      - name: userid
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned user's id.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user has been accepted in the group.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventWaitingListRouter.delete('/decline/:id/:userid', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventWaitingListModel> = await eventWaitingListService.decline(req.params.userid, req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/waitinglist/{id}:
 *   get:
 *     summary: Retrieve a list of users in the waiting list of an event.
 *     description: Retrieve a list of users in the waiting list of an event.
 *     tags: [EventWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event's waiting list to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved waiting list.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventWaitingListRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventWaitingListModel[]> = await eventWaitingListService.getByEventId(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export {
    eventWaitingListRouter
};