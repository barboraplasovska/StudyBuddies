import {ExamModel} from "database/model/ExamModel";
import {HttpResponse} from "../HttpResponse";
import {LimitByEndpoints} from "utils/enumerations/LimitByEndpoints";
import {createLimiter} from "presentation/middlewares/ratelimits";
import { examService } from "domain/service/ExamService";
import { notificationService } from "domain/service/NotificationService";
import setMetricsByRoute from "presentation/middlewares/metrics";
import {checkJWT, verifySession} from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const examRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exam
 *   description: Exams role handling
 */

examRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * /exam/all:
 *   get:
 *     summary: Retrieve a list of exam
 *     description: Retrieve a list of exam.
 *     tags: [Exam]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of exams.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
examRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel> = await examService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /exam/my:
 *   get:
 *     summary: Retrieve the list of exam of the authenticated user
 *     description: Retrieve a list of exam.
 *     tags: [Exam]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of exams.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
examRouter.get('/my', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel[]> = await examService.getByUserId(req.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /exam/{id}:
 *   get:
 *     summary: Retrieve an exam from an id.
 *     description: Retrieve an exam from an id.
 *     tags: [Exam]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the exam to retrieve.
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
 *               $ref: '#/components/schemas/ExamModelResponse'
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
examRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel> = await examService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /exam/{id}:
 *   put:
 *     summary: Update an exam from an id.
 *     description: Update an exam from an id.
 *     tags: [Exam]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the exam to update.
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
 *             $ref: '#/components/schemas/ExamModelRequest'
 *     responses:
 *       200:
 *         description: The role has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamModelResponse'
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
examRouter.put('/:id', createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel> = await examService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /exam:
 *   post:
 *     summary: Create a new exam.
 *     description: Create an exam from an id.
 *     tags: [Exam]
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
 *             $ref: '#/components/schemas/ExamModelRequest'
 *     responses:
 *       201:
 *         description: The role has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
examRouter.post('/', createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel> = await examService.insert(req.body);
        if (result.body as ExamModel) {
            const exam = result.body as ExamModel;
            notificationService.addExam(exam.id, new Date(Date.parse(exam.date!)));
        }
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /exam/{id}:
 *   delete:
 *     summary: Delete an exam from an id.
 *     description: Delete an exam from an id.
 *     tags: [Exam]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the exam to delete.
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
 *               $ref: '#/components/schemas/ExamModelResponse'
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
examRouter.delete('/:id', createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<ExamModel> = await examService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (err) {
        next(err);
    }
});

export { examRouter };


