import MessageService from "domain/MessageService";
import {createLimiter} from "presentation/middlewares/ratelimits";
import express from "express";
import {checkJWT, verifySession} from "presentation/middlewares/authorization";

const messageRoutes = express.Router();
const messageService = new MessageService();

messageRoutes.use(checkJWT, verifySession);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get paginated messages for a specific room
 *     description: Retrieve messages from a room with pagination. Requires JWT authentication and an active session.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: header
 *         description: The ID of the current session
 *         required: true
 *         type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: true
 *         description: The number of messages to retrieve per page.
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *           example: "1"
 *         required: true
 *         description: The ID of the room to retrieve messages from.
 *     responses:
 *       200:
 *         description: A list of messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request, invalid parameters.
 *       401:
 *         description: Unauthorized, invalid or missing JWT.
 *       403:
 *         description: Forbidden, session verification failed.
 */
messageRoutes.get("/", createLimiter(150), async (req, res) => {
   const { page, limit, roomId } = req.query;
   const messages = await messageService.getPaginatedMessages(parseInt(page as string), parseInt(limit as string), roomId as string);
   res.json(messages);
});

export default messageRoutes;