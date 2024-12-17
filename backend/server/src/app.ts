import "utils/ExtensionMethod";
import * as process from "node:process";
import BugsnagWrapper from "./utils/wrapper/BugsnagWrapper";
import Prometheus from 'prom-client';
import { Redis } from "./database/Redis";
import { appRoleRouter } from "presentation/routes/AppRoleRoutes";
import { eventRouter } from "presentation/routes/EventRoutes";
import { eventUserRouter } from "presentation/routes/EventUserRoutes";
import { eventWaitingListRouter } from "presentation/routes/EventWaitingListRoutes";
import { examRouter } from "./presentation/routes/ExamRoutes";
import express from "express";
import { groupRoleRouter } from "presentation/routes/GroupRoleRoutes";
import { groupRouter } from "presentation/routes/GroupRoutes";
import { groupUserRouter } from "presentation/routes/GroupUserRoutes";
import { groupWaitingListRouter } from "presentation/routes/GroupWaitingListRoutes";
import { handleErrors } from "presentation/middlewares/error-handler";
import metricsRouter from "./presentation/routes/MetricsRoute";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { userRouter } from "presentation/routes/UserRoutes";

const register = new Prometheus.Registry();
register.setDefaultLabels({ app: "study-buddies-backend" });
Prometheus.collectDefaultMetrics({ register });

const app = express();
const environment = process.env.NODE_ENV;
app.use(express.json());

const loadRouter = () => {
  /**
   * @swagger
   * components:
   *   responses:
   *     BadRequest:
   *       description: Bad Request.
   *       headers:
   *         $ref: '#/components/headers/ratelimits'
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ErrorResponse'
   */
  app.use('/metrics', metricsRouter);
  app.use('/approle', appRoleRouter);
  app.use('/user', userRouter);
  app.use('/group', groupRouter);
  app.use('/group/role', groupRoleRouter);
  app.use('/group/user', groupUserRouter);
  app.use('/group/waitinglist', groupWaitingListRouter);
  app.use('/group/event', eventRouter);
  app.use('/group/event/user', eventUserRouter);
  app.use('/group/event/waitinglist', eventWaitingListRouter);
  app.use('/exam', examRouter);
  app.use(handleErrors);
};

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
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'http://studybuddies-backend.francecentral.azurecontainer.io:4000',
        description: 'Deployed server'
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

const redis = new Redis();

if (environment !== "test") {
  const bugsnagInstance = new BugsnagWrapper();
  bugsnagInstance.start();
  const middleware = bugsnagInstance.getPlugin()!;
  app.use(middleware.requestHandler);
  loadRouter();
  app.use(middleware.errorHandler);
}
else {
  loadRouter();
}

export {
  app,
  redis
};
