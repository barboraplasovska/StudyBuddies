import { AppRoleEnum } from "utils/enumerations/AppRoleEnum";
import { AppRoleModel } from "database/model/AppRoleModel";
import { HttpResponse } from "presentation/HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { appRoleService } from "domain/service/AppRoleService";
import { createLimiter } from "presentation/middlewares/ratelimits";
import setMetricsByRoute from "../middlewares/metrics";
import {checkAppRole, checkJWT, verifySession} from "../middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const appRoleRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: AppRole
 *   description: Application role handling
 */

appRoleRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession, checkAppRole(AppRoleEnum.ADMINISTRATOR));

/**
 * @swagger
 * /approle/all:
 *   get:
 *     summary: Retrieve a list of application role
 *     description: Retrieve a list of application role.
 *     tags: [AppRole]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of roles.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
appRoleRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<AppRoleModel> = await appRoleService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /approle/{id}:
 *   get:
 *     summary: Retrieve an application role from an id.
 *     description: Retrieve an application role from an id.
 *     tags: [AppRole]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the application role to retrieve.
 *        schema:
 *           type: string
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: The retrieve role.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The role cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
appRoleRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<AppRoleModel> = await appRoleService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /approle/{id}:
 *   put:
 *     summary: Update an application role from an id.
 *     description: Update an application role from an id.
 *     tags: [AppRole]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the application role to update.
 *        schema:
 *           type: string
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
 *             $ref: '#/components/schemas/AppRoleModelRequest'
 *     responses:
 *       200:
 *         description: The role has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The role cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
appRoleRouter.put('/:id', createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<AppRoleModel> = await appRoleService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /approle:
 *   post:
 *     summary: Create a new application role.
 *     description: Create an application role from an id.
 *     tags: [AppRole]
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
 *             $ref: '#/components/schemas/AppRoleModelRequest'
 *     responses:
 *       201:
 *         description: The role has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
appRoleRouter.post('/', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<AppRoleModel> = await appRoleService.insert(req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /approle/{id}:
 *   delete:
 *     summary: Delete an application role from an id.
 *     description: Delete an application role from an id.
 *     tags: [AppRole]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the application role to delete.
 *        schema:
 *           type: string
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: The role has been deleted.
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *             description: Request limit per hour.
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *             description: The number of requests left for the time window.
 *           X-RateLimit-Reset:
 *             schema:
 *               type: string
 *               format: date-time
 *             description: The UTC date/time at which the current rate limit window resets.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppRoleModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The role cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
appRoleRouter.delete('/:id', createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<AppRoleModel> = await appRoleService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

export { appRoleRouter };
