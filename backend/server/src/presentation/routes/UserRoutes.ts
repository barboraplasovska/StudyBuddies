import { AppRoleEnum } from "utils/enumerations/AppRoleEnum";
import { HttpResponse } from "presentation/HttpResponse";
import { JWT } from "utils/jwt";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { UserModel } from "database/model/UserModel";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { sessionService } from "domain/service/SessionService";
import setMetricsByRoute from "presentation/middlewares/metrics";
import { userService } from "domain/service/UserService";
import {AuthResponse, authEntity} from "domain/entity/AuthEntity";
import { checkAppRole, checkJWT, checkUser, verifySession } from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const userRouter = express.Router();
const jwt = new JWT();

userRouter.use(setMetricsByRoute(__filename));

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Users handling
 */

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: A list of users.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
userRouter.get('/all', checkJWT, verifySession, createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Retrieve a user from an id.
 *     description: Retrieve a user from an id.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to retrieve.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved user.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserEntityResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
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
userRouter.get('/:id', checkJWT, verifySession, createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user from an id.
 *     description: Update a user from an id.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to update.
 *        schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserModelRequest'
 *     responses:
 *       200:
 *         description: The user has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
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
userRouter.put('/:id', checkJWT, verifySession, checkUser(), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/ban/{id}:
 *   patch:
 *     summary: Ban a user.
 *     description: Ban a user from an id.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to update.
 *        schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The user has been banned.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Not Found.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.patch('/ban/:id', checkJWT, verifySession, checkAppRole(AppRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.banById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/unban/{id}:
 *   patch:
 *     summary: Unban a user.
 *     description: Unban a user from an id.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to update.
 *        schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The user has been unbanned.
 *         headers:
 *          $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Not Found.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.patch('/unban/:id', checkJWT, verifySession, checkAppRole(AppRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.unbanById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user.
 *     description: Register a user in the database.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserModelRequest'
 *     responses:
 *       201:
 *         description: The user has been registered.
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
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *          description: A user is already registered with this email
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ForbiddenResponse'
 */
userRouter.post('/register', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await authEntity.generateValidationCode(req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/verify/{email}/new:
 *   get:
 *     summary: Send a new email to a not verified user.
 *     description: Provide a new validation code to the user by email.
 *     tags: [User]
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: User email to validate
 *        schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The mail has been delivered.
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
 *               $ref: '#/components/schemas/UserModelResponse'
 *       403:
 *          description: A user is already registered with this email
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ForbiddenResponse'
 */
userRouter.get('/verify/:email/new', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction)=> {
    try {
        await authEntity.generateNewValidationCode(req.params.email);
        res.status(204);
        res.json({email: req.params.email});
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /user/verify/{email}/{code}:
 *   post:
 *     summary: Verify user's validation code.
 *     description: Verify user account.
 *     tags: [User]
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: User email to validate
 *        schema:
 *           type: string
 *      - name: code
 *        in: path
 *        required: true
 *        description: User's validation code
 *        schema:
 *           type: string
 *     responses:
 *       201:
 *         description: The user has been verified.
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
 *           Set-Cookie:
 *              schema:
 *                type: array
 *              description: Data about the current session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *          description: A user is already registered with this email
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ForbiddenResponse'
 */
userRouter.post('/verify/:email/:code', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction)=> {
   try {
       const result = await authEntity.verifyRegistrationCode(req.params.email, req.params.code);
       const information = result.body as AuthResponse;
       res.status(result.statusCode);
       jwt.storeJwtInCookie(res, information);
       res.json(result.body);
   }
   catch (err) {
       next(err);
   }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Logs in and returns the authentication cookie.
 *     description: Create a session for a specified user.
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CredentialModelRequest'
 *     responses:
 *       200:
 *         description: The user is now connected.
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
 *           Set-Cookie:
 *              schema:
 *                type: array
 *              description: Data about the current session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       401:
 *          description: Wrong credentials.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/login', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (email && password)
        {
            const userId = await sessionService.checkCredentialValidity(email, password);
            if (userId === null)
            {
                res.status(401);
                res.json({error: "Invalid Credentials or non verified account!"});
            }
            else {
                const authResponse = await authEntity.login(userId!);
                res.status(200);
                jwt.storeJwtInCookie(res, authResponse);
                res.json(authResponse.user);
            }
        }
        else if (req.headers.authorization)
        {
            const authJwt = req.headers.authorization.split(' ')[1];
            const authResponse = await authEntity.loginByJwt(jwt, authJwt);
            res.status(200);
            jwt.storeJwtInCookie(res, authResponse, authJwt);
            res.json(authResponse.user);
        }
        else
        {
            res.status(401);
            res.json({error: "No credentials provided!"});
        }
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user from an id.
 *     description: Delete a user from an id.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the user to delete.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user has been deleted.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
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
userRouter.delete('/:id', checkJWT, verifySession, checkUser(), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<UserModel> = await userService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/password/change/{old}/{new}:
 *   patch:
 *     summary: Change the password of the connected user.
 *     description: Change the password of the connected user.
 *     tags: [User]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *      - name: old
 *        in: path
 *        required: true
 *        description: Current password of the connected user.
 *        schema:
 *           type: string
 *      - name: new
 *        in: path
 *        required: true
 *        description: New password of the connected user.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The password has been changed.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CredentialModelResponse'
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
userRouter.patch('/password/change/:old/:new', checkJWT, verifySession, createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credential = await authEntity.changePassword(req.userId, req.params.old, req.params.new);
        res.status(credential.statusCode);
        res.json(credential.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/password/reset/init/{email}:
 *   post:
 *     summary: Init the reset password process.
 *     description: Init the reset password process.
 *     tags: [User]
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: Email of the user to reset password.
 *        schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The process has been launched.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       404:
 *          description: The user cannot be found.
 *          headers:
 *           $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/password/reset/init/:email', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authEntity.initResetPasswordProcess(req.params.email);
        res.status(204);
        res.json({email: req.params.email});
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/password/reset/validate/{email}/{code}:
 *   post:
 *     summary: Validate the reset password process.
 *     description: Validate the reset password process.
 *     tags: [User]
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: Email of the user to reset password.
 *        schema:
 *           type: string
 *      - name: code
 *        in: path
 *        required: true
 *        description: Validation code to validate the password reset process.
 *        schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The process has been launched.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
userRouter.post('/password/reset/validate/:email/:code', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authEntity.validateResetPasswordCode(req.params.email, req.params.code);
        res.status(204);
        res.json({email: req.params.email});
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/password/reset/edit/{email}/{password}:
 *   post:
 *     summary: Init the reset password process.
 *     description: Init the reset password process.
 *     tags: [User]
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: Email of the user to reset password.
 *        schema:
 *           type: string
 *      - name: password
 *        in: path
 *        required: true
 *        description: New password.
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The process has been launched.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CredentialModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
userRouter.post('/password/reset/edit/:email/:password', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credentials = await authEntity.resetPassword(req.params.email, req.params.password);
        res.status(credentials.statusCode);
        res.json(credentials.body);
    }
    catch (error) {
        next(error);
    }
});

export { userRouter, jwt };
