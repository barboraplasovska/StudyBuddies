import {IMessage} from "infrastructure/models/message";
import {getSocketIO} from "socket";

const broadcast = (message: IMessage) => {
    const io = getSocketIO();
    io.in(message.roomId).emit('receiveMessage', message);
};

export { broadcast };