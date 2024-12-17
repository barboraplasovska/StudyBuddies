import { EventUserModel } from "database/model/EventUserModel";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { HttpResponse } from "../HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { eventUserService } from "domain/service/EventUserService";
import setMetricsByRoute from "../middlewares/metrics";
import { checkGroupRoleWithEvent, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const eventUserRouter = express.Router();

eventUserRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: EventUser
 *   description: Event users handling
 */

/**
 * @swagger
 * /group/event/user/{eventid}/all:
 *   get:
 *     summary: Retrieve a list of event users in a group.
 *     description: Retrieve a list of event users in a group.
 *     tags: [EventUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: eventid
 *        in: path
 *        required: true
 *        description: Numeric ID of the event with all the event users.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of event users.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group id cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventUserRouter.get('/:eventid/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await eventUserService.getByEvent(req.params.eventid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/user/{id}:
 *   get:
 *     summary: Retrieve an event user from an id.
 *     description: Retrieve an event user from an id.
 *     tags: [EventUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event user to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved event user.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventUserRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventUserModel> = await eventUserService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/user/{eventid}/{id}:
 *   put:
 *     summary: Update an event user from an id.
 *     description: Update an event user from an id.
 *     tags: [EventUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: eventid
 *        in: path
 *        required: true
 *        description: Numeric ID of the event including the event user to update.
 *        schema:
 *           type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event user to update.
 *        schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUserModelRequest'
 *     responses:
 *       200:
 *         description: The event user has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventUserRouter.put('/:eventid/:id', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventUserModel> = await eventUserService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/user:
 *   post:
 *     summary: Create a new event user.
 *     description: Create an event user in the database.
 *     tags: [EventUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUserModelRequest'
 *     responses:
 *       201:
 *         description: The event user has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventUserRouter.post('/', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventUserModel> = await eventUserService.insert(req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/user/{eventid}/{id}:
 *   delete:
 *     summary: Delete an event user from an id.
 *     description: Delete an event user from an id.
 *     tags: [EventUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: eventid
 *        in: path
 *        required: true
 *        description: Numeric ID of the event which is including the event user.
 *        schema:
 *           type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event user to delete.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The event user has been deleted.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventUserRouter.delete('/:eventid/:id', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventUserModel> = await eventUserService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export {
    eventUserRouter,
};