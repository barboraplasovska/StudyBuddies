// DO NOT FUCKING DELETE THIS LINE
import * as express from 'express';

export {}

declare global {
    namespace Express {
        interface Request {
            jwt: string;
            userId: string;
            appRoleId: string;
        }
    }
}
