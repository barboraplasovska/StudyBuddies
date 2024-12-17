import GroupUserRepository from "infrastructure/repositories/GroupUserRepository";
import {Model} from "mongoose";
import {broadcast} from "infrastructure/sockets/broadcasting";
import {IMessage, Message} from "infrastructure/models/message";

class MessageService {
    message: Model<IMessage>;
    groupUserRepository: GroupUserRepository;

    constructor() {
        this.message = Message;
        this.groupUserRepository = new GroupUserRepository();
    }

    async saveMessage(message: IMessage) {
        try {
            const newMessage : IMessage = new this.message({...message});
            await newMessage.save();
            broadcast(newMessage);
        }
        catch (error) {
            console.error(error);
        }
    }

    async getPaginatedMessages(page: number, limit: number, roomId: string): Promise<IMessage[]> {
        const skip = (page - 1) * limit;
        return this.message.find({ roomId })
            .sort({createdAt: -1})
            .skip(skip < 0 ? 0 : skip)
            .limit(limit);
    }
}

export default MessageService;