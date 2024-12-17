import { register } from 'prom-client';
import express, {Request, Response} from "express";

const metricsRouter = express.Router();

metricsRouter.get('/', async(req: Request, res: Response) => {
    res.contentType(register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
});

export default metricsRouter;