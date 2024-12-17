import * as http from "node:http";
import connectToMongoDB from 'infrastructure/mongodb';
import express from 'express';
import { initSocketIO } from 'socket';
import messageHandler from "./presentation/handler/MessageHandler";
import messageRoutes from "./presentation/routes/MessageRoutes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const server = http.createServer(app);

connectToMongoDB();

const io = initSocketIO(server);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API STUDY BUDDIES',
    },
    servers: [
      {
        url: 'http://studybuddies-backend.francecentral.azurecontainer.io:4000',
        description: 'Deployed server'
      },
      {
        url: 'http://localhost:4001',
        description: 'Development server',
      },
      {
        url: 'http://10.41.172.239:4001',
        description: 'Epita Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
    },
    security: [
      {
        bearerAuth: []
      },
    ],
  },
  apis: ["**/*.ts"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/messages', messageRoutes);
messageHandler(io);

export { server };
