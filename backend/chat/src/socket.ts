import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | undefined;

// Function to initialize Socket.io and store the instance
export const initSocketIO = (server: HttpServer): Server => {
    io = new Server(server, { cors: {
    origin: '*',  // Autorise toutes les origines (à restreindre en production)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'sessionId'],
  }});

    return io;
};

// Function to retrieve the current instance of Socket.io
export const getSocketIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};
