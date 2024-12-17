import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { GroupRoleModel } from "database/model/GroupRoleModel";
import { HttpResponse } from "presentation/HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { groupRoleService } from "domain/service/GroupRoleService";
import setMetricsByRoute from "presentation/middlewares/metrics";
import { checkGroupRole, checkJWT, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const groupRoleRouter = express.Router();


groupRoleRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * tags:
 *   name: GroupRole
 *   description: Group roles handling
 */

/**
 * @swagger
 * /group/role/all:
 *   get:
 *     summary: Retrieve a list of group role
 *     description: Retrieve a list of group roles.
 *     tags: [GroupRole]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of group roles.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupRoleRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupRoleModel> = await groupRoleService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/role/{id}:
 *   get:
 *     summary: Retrieve a group role from an id.
 *     description: Retrieve a group role from an id.
 *     tags: [GroupRole]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group role to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved group role.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group role cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupRoleRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupRoleModel> = await groupRoleService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/role/{id}:
 *   put:
 *     summary: Update a group role from an id.
 *     description: Update a group role from an id.
 *     tags: [GroupRole]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group role to update.
 *        schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupRoleModelRequest'
 *     responses:
 *       200:
 *         description: The group role has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group role cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupRoleRouter.put('/:id', checkGroupRole(GroupRoleEnum.OWNER), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupRoleModel> = await groupRoleService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/role:
 *   post:
 *     summary: Create a new group role.
 *     description: Create a group role in the database.
 *     tags: [GroupRole]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupRoleModelRequest'
 *     responses:
 *       201:
 *         description: The group role has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
groupRoleRouter.post('/', checkGroupRole(GroupRoleEnum.OWNER), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupRoleModel> = await groupRoleService.insert(req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/role/{id}:
 *   delete:
 *     summary: Delete a group role from an id.
 *     description: Delete a group role from an id.
 *     tags: [GroupRole]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the group role to delete.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The group role has been deleted.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The group role cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
groupRoleRouter.delete('/:id', checkGroupRole(GroupRoleEnum.OWNER), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<GroupRoleModel> = await groupRoleService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export { groupRoleRouter };
