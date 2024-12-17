import { GroupEntity } from "domain/entity/GroupEntity";
import { GroupModel } from "database/model/GroupModel";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { HttpResponse } from "presentation/HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { groupService } from "domain/service/GroupService";
import setMetricsByRoute from "../middlewares/metrics";
import { checkGroupRole, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const groupRouter = express.Router();

groupRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Groups handling
 */

/**
 * @swagger
 * /group/all:
 *   get:
 *     summary: Retrieve a list of groups
 *     description: Retrieve a list of groups.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: A list of groups.
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
 */
groupRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupEntity[]> = await groupService.getAllGroups();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/schools:
 *   get:
 *     summary: Retrieve a list of schools
 *     description: Retrieve a list of schools.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: A list of groups.
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
 */
groupRouter.get('/schools', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupEntity[]> = await groupService.getAllSchools();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/filter:
 *   get:
 *     summary: Retrieve a list of groups by filter.
 *     description: Retrieve a list of groups by filter.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: parentId
 *        in: query
 *        required: false
 *        description: Id of the parent group.
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: A list of groups.
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
 */
groupRouter.get('/filter', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel[]> = await groupService.getByParentId(req.query.parentId as string);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/find/my:
 *   get:
 *     summary: Retrieve a list of groups in which the user is registered.
 *     description: Retrieve a list of groups in which the user is registered.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: A list of groups.
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
 */
groupRouter.get('/find/my', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel[]> = await groupService.getByUserId(req.userId!);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/{id}:
 *   get:
 *     summary: Retrieve a group from an id.
 *     description: Retrieve a group from an id.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved group.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupEntityResponse'
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
groupRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel> = await groupService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/{id}:
 *   put:
 *     summary: Update a group from an id.
 *     description: Update a group from an id.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group to update.
 *        schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupModelRequest'
 *     responses:
 *       200:
 *         description: The group has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
groupRouter.put('/:id', checkGroupRole(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel> = await groupService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group:
 *   post:
 *     summary: Create a new group.
 *     description: Create a group in the database.
 *     tags: [Group]
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
 *             $ref: '#/components/schemas/GroupModelRequest'
 *     responses:
 *       201:
 *         description: The group has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupRouter.post('/', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel> = await groupService.createGroup(req.body, req.userId!);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/{id}:
 *   delete:
 *     summary: Delete a group from an id.
 *     description: Delete a group from an id.
 *     tags: [Group]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group to delete.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The group has been deleted.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupRouter.delete('/:id', checkGroupRole(GroupRoleEnum.OWNER), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupModel> = await groupService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export { groupRouter };
