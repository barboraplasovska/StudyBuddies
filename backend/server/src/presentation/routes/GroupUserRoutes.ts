import {ErrorResponse} from "../../utils/ErrorResponse";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { GroupUserModel } from "database/model/GroupUserModel";
import { HttpResponse } from "presentation/HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { groupUserService } from "domain/service/GroupUserService";

import setMetricsByRoute from "../middlewares/metrics";
import { checkGroupRole, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";
const groupUserRouter = express.Router();

groupUserRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: GroupUser
 *   description: Group users handling
 */

/**
 * @swagger
 * /group/user/all:
 *   get:
 *     summary: Retrieve a list of group users.
 *     description: Retrieve a list of group users.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: A list of group users.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupUserRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/{groupid}/all:
 *   get:
 *     summary: Retrieve a list of group users in a group.
 *     description: Retrieve a list of group users in a group.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: groupid
 *        in: path
 *        required: true
 *        description: Numeric ID of the group with all the group users.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of group users.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.get('/:groupid/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.getByGroup(req.params.groupid);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/{id}:
 *   get:
 *     summary: Retrieve a group user from an id.
 *     description: Retrieve a group user from an id.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group user to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved group user.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/{id}:
 *   put:
 *     summary: Update a group user from an id.
 *     description: Update a group user from an id.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group user to update.
 *        schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupUserModelRequest'
 *     responses:
 *       200:
 *         description: The group user has been updated.
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
 *          description: The group user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.put('/:id', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user:
 *   post:
 *     summary: Create a new group user.
 *     description: Create a group user in the database.
 *     tags: [GroupUser]
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
 *             $ref: '#/components/schemas/GroupUserModelRequest'
 *     responses:
 *       201:
 *         description: The group user has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupUserRouter.post('/', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.insert(req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/leave/{groupId}:
 *   post:
 *     summary: Leave a groupe.
 *     description: Leave a group.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: groupId
 *        in: path
 *        description: The ID of the group to leave
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: The group user has been deleted.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupUserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupUserRouter.post('/leave/:groupId', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel | ErrorResponse> = await groupUserService.leaveGroup(req.params.groupId, req.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/{id}:
 *   delete:
 *     summary: Delete a group user from an id.
 *     description: Delete a group user from an id.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group user to delete.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The group user has been deleted.
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
 *          description: The group user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.delete('/:id', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/promote/{id}/{userId}:
 *   patch:
 *     summary: Promote a user to the above role.
 *     description: Promote a user to the above role.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group in which the user to demote is registered.
 *        schema:
 *           type: string
 *      - name: userId
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to demote.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user has been promoted.
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
 *          description: Group user not found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.patch('/promote/:id/:userId', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.promote(req.params.id, req.params.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/demote/{id}/{userId}:
 *   patch:
 *     summary: Demote a user to the above role.
 *     description: Demote a user to the above role.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group in which the user to demote is registered.
 *        schema:
 *           type: string
 *      - name: userId
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to demote.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user has been demoted.
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
 *          description: Group user not found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.patch('/demote/:id/:userId', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.demote(req.params.id, req.params.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/user/owner/edit/{id}/{userId}:
 *   patch:
 *     summary: Change the owner of a group.
 *     description: Change the owner of a group.
 *     tags: [GroupUser]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group whose owner is going to change.
 *        schema:
 *           type: string
 *      - name: userId
 *        in: path
 *        required: true
 *        description: Numeric ID of the new owner
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The owner has been changed. The response body contains new owner data.
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
 *          description: Group or owner has not been found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupUserRouter.patch('/owner/edit/:id/:userId', checkGroupRole(GroupRoleEnum.OWNER), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupUserModel> = await groupUserService.changeOwner(req.params.id, req.params.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export { groupUserRouter };