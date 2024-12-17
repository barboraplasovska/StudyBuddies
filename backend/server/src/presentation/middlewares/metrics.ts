import Prometheus from "prom-client";
import os from 'node:os';
import {NextFunction, Request, Response} from "express";

const setMetricsByRoute = (api: string) => {
    const separator = os.platform() === "win32" ? '\\' : '/';
    const name = api.split(separator).pop()?.split('Routes').at(0);
    const http_request_counter = new Prometheus.Counter({
        name: `${name}_request_count`,
        help: `Request counter for ${name}`,
        labelNames: ['method', 'route', 'statusCode']
    });

    return (req: Request, res: Response, next: NextFunction) => {
        next();
        http_request_counter.labels({
            method: req.method,
            route: req.originalUrl.replace(/\d+/, "{num}"),
            statusCode: res.statusCode
        }).inc();
    };
};

export default setMetricsByRoute;