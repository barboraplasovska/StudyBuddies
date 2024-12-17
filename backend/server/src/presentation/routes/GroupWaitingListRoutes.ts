import {GroupModel} from "database/model/GroupModel";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { GroupUserModel } from "database/model/GroupUserModel";
import { GroupWaitingListModel } from "database/model/GroupWaitingListModel";
import { HttpResponse } from "../HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { groupWaitingListService } from "domain/service/GroupWaitingListService";
import setMetricsByRoute from "presentation/middlewares/metrics";
import { checkGroupRole, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const groupWaitingListRouter = express.Router();

groupWaitingListRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: GroupWaitingList
 *   description: Groups Waiting List handling
 */

/**
 * @swagger
 * /group/waitinglist/join/{groupid}:
 *   post:
 *     summary: Make the authenticated user join the group waiting list.
 *     description: Make the authenticated user join the group waiting list.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: groupid
 *        in: path
 *        required: true
 *        description: Numeric ID of the group's id to join.
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
 *               $ref: '#/components/schemas/GroupWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupWaitingListRouter.post('/join/:groupid', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupWaitingListModel> = await groupWaitingListService.join(req.userId!, req.params.groupid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/waitinglist/leave/{groupid}:
 *   delete:
 *     summary: Make the authenticated user leave the group waiting list.
 *     description: Make the authenticated user leave the group waiting list.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: groupid
 *        in: path
 *        required: true
 *        description: Numeric ID of the group's id to leave.
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
 *               $ref: '#/components/schemas/GroupWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupWaitingListRouter.delete('/leave/:groupid', createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: HttpResponse<GroupWaitingListModel> = await groupWaitingListService.leave(req.userId!, req.params.groupid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/waitinglist/accept/{id}/{userid}:
 *   post:
 *     summary: Give access to the group.
 *     description: Make the authenticated user leave the group waiting list.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned group's id.
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
 *         description: The user has been accepted in the group.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupUserResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupWaitingListRouter.post('/accept/:id/:userid', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupWaitingListService.accept(req.params.userid, req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/waitinglist/decline/{id}/{userid}:
 *   delete:
 *     summary: Decline access to the group.
 *     description: Make the authenticated user leave the group waiting list.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the concerned group's id.
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
 *               $ref: '#/components/schemas/GroupWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupWaitingListRouter.delete('/decline/:id/:userid', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupWaitingListModel> = await groupWaitingListService.decline(req.params.userid, req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/waitinglist/my:
 *   get:
 *     summary: Retrieve a list of a group the current user is waiting for approval.
 *     description: Retrieve a list of a group the current user is waiting for approval.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: All the retrieved groups.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupEntityResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupWaitingListRouter.get('/my', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel[]> = await groupWaitingListService.getByUserId(req.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/waitinglist/{id}:
 *   get:
 *     summary: Retrieve a list of users in the waiting list of a group.
 *     description: Retrieve a list of users in the waiting list of a group.
 *     tags: [GroupWaitingList]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group's waiting list to retrieve.
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
 *               $ref: '#/components/schemas/GroupWaitingListResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupWaitingListRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupWaitingListModel[]> = await groupWaitingListService.getByGroupId(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export {
    groupWaitingListRouter
};