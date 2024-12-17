import mongoose, { Document, Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the message.
 *           example: "64bfa7eebc0345285d5a7a49"
 *         senderId:
 *           type: string
 *           description: The sender's user Id.
 *           example: "1"
 *         roomId:
 *           type: string
 *           description: The room's Id.
 *           example: "1"
 *         content:
 *           type: string
 *           description: The message's content.
 *           example: "Salut tout le monde !"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date of the message.
 *           example: "2025-07-23T15:19:36"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update date of the message.
 *           example: "2025-07-24T15:00:00"
 */

export interface IMessage extends Document {
    senderId: string,
    roomId: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
}

const MessageSchema: Schema = new Schema({
    senderId: { type: String, required: true },
    roomId: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);