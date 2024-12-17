import BugsnagWrapper from "utils/wrapper/BugsnagWrapper";
import { HttpError } from "utils/errors/HttpError";
import { NextFunction, Request, Response } from "express";

const bugsnagInstance = new BugsnagWrapper();

export const handleErrors = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof HttpError) {
        res.status(error.code).json({error: error.message});
        bugsnagInstance.notify(error);
    }
    else {
        res.status(500).json({error: error.message});
        throw new Error(error.message);
    }

    next(error);
};
