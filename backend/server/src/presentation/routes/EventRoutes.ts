import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import { EventEntity } from "domain/entity/EventEntity";
import { EventModel } from "database/model/EventModel";
import { GroupRoleEnum } from "utils/enumerations/GroupRoleEnum";
import { HttpResponse } from "presentation/HttpResponse";
import { LimitByEndpoints } from "utils/enumerations/LimitByEndpoints";
import { createLimiter } from "presentation/middlewares/ratelimits";
import { credentialRepository } from "database/repository/CredentialRepository";
import { emailService } from "domain/service/EmailService";
import { eventService } from "domain/service/EventService";
import {icsCalendarService} from "domain/service/ICSCalendarService";
import { notificationService } from "domain/service/NotificationService";
import setMetricsByRoute from "../middlewares/metrics";
import {
    checkGroupRoleCreateEvent,
    checkGroupRoleWithEvent,
    checkJWT,
    isUserRegisteredInEvent,
    verifySession
} from "presentation/middlewares/authorization";
import express, {NextFunction, Request, Response} from "express";

const eventRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QueryParams {
    day?: string,
    time?: string,
    my?: string
}

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Event handling
 */
eventRouter.use(setMetricsByRoute(__filename), checkJWT, verifySession);

/**
 * @swagger
 * /group/event/all:
 *   get:
 *     summary: Retrieve a list of all the events
 *     description: Retrieve a list of all the events
 *     tags: [Event]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of events.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventEntityResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventRouter.get('/all', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.getAll();
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/my:
 *   get:
 *     summary: Retrieve all events of the current user.
 *     description: Retrieve all events the current user is attending.
 *     tags: [Event]
 *     parameters:
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: The retrieved event.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventEntityResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.get('/my', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: HttpResponse<EventEntity[]> = await eventService.getByUserId(req.userId);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/filter:
 *   get:
 *     summary: Retrieve events based on filters (day, hour).
 *     description: Retrieve events based on day and hour filters. Optionally, filter by user-specific events.
 *     tags: [Event]
 *     parameters:
 *       - name: day
 *         in: query
 *         required: false
 *         description: Day used to filter events.
 *         schema:
 *           type: string
 *           example: 2025-06-09
 *       - name: time
 *         in: query
 *         required: false
 *         description: Time used to filter events.
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *       - name: my
 *         in: query
 *         required: false
 *         description: Whether to filter events specific to the authenticated user.
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: sessionId
 *         in: header
 *         required: true
 *         description: The ID of the current session.
 *         schema:
 *           type: string
 *           example: abc123
 *     responses:
 *       200:
 *         description: The retrieved events based on the filters.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventEntityResponse'
 */
eventRouter.get('/filter', createLimiter(LimitByEndpoints.getAll), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await eventService.getByFilter(
            req.query.day as string,
            req.query.time as string,
            (req.query.my !== undefined) ? req.userId : undefined);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/calendar/{id}:
 *   get:
 *     summary: Get the ics file of an event.
 *     description: This endpoint generates an iCalendar file of an events and sends it as a downloadable `.ics` file.
 *     tags: [Event]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the event we want the calendar.
 *         schema:
 *           type: string
 *       - name: sessionId
 *         in: header
 *         required: true
 *         description: The ID of the current session.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A downloadable iCalendar file containing the event
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *               example: "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nSUMMARY:Sample Event\nDTSTART:20241115T090000Z\nDTEND:20241115T100000Z\nDESCRIPTION:This is a sample event created with ical-generator.\nLOCATION:Sample Location\nEND:VEVENT\nEND:VCALENDAR"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: The event cannot be found.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.get('/calendar/:id', isUserRegisteredInEvent(), createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventResponse = await eventService.getById(req.params.id);
        const event = eventResponse.body as EventModel;
        if (event.name === undefined) {
            res.status(ErrorEnum.BAD_REQUEST).send({error: "Bad Request."});
            return;
        }

        const credential = await credentialRepository.getByUserId(req.userId);
        if (credential === null || credential.email === undefined) {
            res.status(ErrorEnum.NOT_FOUND).send({error: "Not Found."});
            return;
        }

        const calendar = icsCalendarService.generateCalendar(event);

        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="calendar.ics"`);

        res.send(calendar.toString());
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/{id}:
 *   get:
 *     summary: Retrieve an event from an id.
 *     description: Retrieve an event from an id.
 *     tags: [Event]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event to retrieve.
 *        schema:
 *           type: string
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string 
 *     responses:
 *       200:
 *         description: The retrieved event.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.get('/:id', createLimiter(LimitByEndpoints.getById), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.getById(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/{id}:
 *   put:
 *     summary: Update an event from an id.
 *     description: Update an event from an id.
 *     tags: [Event]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event to update.
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
 *             $ref: '#/components/schemas/EventModelRequest'
 *     responses:
 *       200:
 *         description: The event has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.put('/:id', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.put), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.updateById(req.params.id, req.body);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/calendar/share/{id}/{email}:
 *   post:
 *     summary: Request event calendar sending.
 *     description: Request event calendar sending.
 *     tags: [Event]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the event.
 *         schema:
 *            type: string
 *       - name: email
 *         in: path
 *         required: true
 *         description: Email address to send the calendar.
 *         schema:
 *            type: string
 *     responses:
 *       201:
 *         description: The mail has been sent.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.post('/calendar/share/:id/:email', isUserRegisteredInEvent(),createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventResponse = await eventService.getById(req.params.id);
        const event = eventResponse.body as EventModel;
        if (event.name === undefined) {
            res.status(ErrorEnum.BAD_REQUEST).send({error: "Bad Request."});
            return;
        }

        const calendar = icsCalendarService.generateCalendar(event);

        const isSent = await emailService.sendCalendar(req.params.email, event?.name, calendar);
        res.status(isSent.statusCode).send(isSent.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/calendar/export/{id}:
 *   post:
 *     summary: Request event calendar sending.
 *     description: Request event calendar sending.
 *     tags: [Event]
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the event.
 *         schema:
 *            type: string
 *     responses:
 *       201:
 *         description: The mail has been sent.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.post('/calendar/export/:id', isUserRegisteredInEvent(),createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventResponse = await eventService.getById(req.params.id);
        const event = eventResponse.body as EventModel;
        if (event.name === undefined) {
            res.status(ErrorEnum.BAD_REQUEST).send({error: "Bad Request."});
            return;
        }

        const calendar = icsCalendarService.generateCalendar(event);

        const credential = await credentialRepository.getByUserId(req.userId);
        if (credential === null || credential.email === undefined) {
            res.status(ErrorEnum.NOT_FOUND).send({error: "Not Found."});
            return;
        }

        const isSent = await emailService.sendCalendar(credential?.email, event?.name, calendar);
        res.status(isSent.statusCode).send(isSent.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event:
 *   post:
 *     summary: Create a new event.
 *     description: Create an event.
 *     tags: [Event]
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
 *             $ref: '#/components/schemas/EventModelRequest'
 *     responses:
 *       201:
 *         description: The event has been created.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventRouter.post('/', checkGroupRoleCreateEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.post), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.createEvent(req.body, req.userId);
        if (result.body as EventModel) {
            const eventModel = result.body as EventModel;
            notificationService.addEvent(eventModel.id, new Date(Date.parse(eventModel.date!)));
        }
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/{id}:
 *   delete:
 *     summary: Delete an event from an id.
 *     description: Delete an event from an id.
 *     tags: [Event]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event to delete.
 *        schema:
 *           type: string
 *      - name: sessionId
 *        in: header
 *        description: The ID of the current session
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: The event has been deleted.
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
 *               $ref: '#/components/schemas/EventModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *          description: The event cannot be found.
 *          headers:
 *            $ref: '#/components/headers/ratelimits'
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
eventRouter.delete('/:id', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.delete), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.delete(req.params.id);
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /group/event/{id}/location:
 *   patch:
 *     summary: Update the location of an event.
 *     description: Update the location of an event from an id.
 *     tags: [Event]
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: Numeric ID of the event to update.
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
 *             $ref: '#/components/schemas/EventModelLocationRequest'
 *     responses:
 *       200:
 *         description: The event's location has been updated.
 *         headers:
 *           $ref: '#/components/headers/ratelimits'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventModelResponse'
 *       400:
 *          $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
eventRouter.patch('/:id/location', checkGroupRoleWithEvent(GroupRoleEnum.ADMINISTRATOR), createLimiter(LimitByEndpoints.patch), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result : HttpResponse<EventModel> = await eventService.updateLocation(
            req.params.id,
            req.body.location,
            req.body.link,
            req.body.address
        );
        res.status(result.statusCode);
        res.json(result.body);
    }
    catch (error) {
        next(error);
    }
});

export { eventRouter };