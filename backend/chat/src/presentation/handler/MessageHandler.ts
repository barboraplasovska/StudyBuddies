import { IMessage } from "infrastructure/models/message";
import MessageService from "domain/MessageService";
import { Server } from "socket.io";
import {
  socketCheckJWT,
  socketVerifySession,
} from "../middlewares/authorization";

const messageService = new MessageService();

const messageHandler = (io: Server) => {
  io.use(socketCheckJWT);
  io.use(socketVerifySession);

  io.on("connection", (socket) => {
    const roomId = socket.handshake?.headers.groupid as string | undefined;
    if (!roomId) return;

    socket.join(roomId);

    socket.on("sendMessage", async (message: IMessage) => {
      await messageService.saveMessage(message);
    });
  });
};

export default messageHandler;
