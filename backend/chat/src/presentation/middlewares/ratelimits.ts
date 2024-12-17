import { Request } from "express";
import rateLimit from "express-rate-limit";

const bypassRatelimit = (req: Request) : boolean => {
    return req.headers["bypass-ratelimit"] !== undefined && req.headers["bypass-ratelimit"] === 'true';
};

/**
 * @swagger
 * components:
 *   headers:
 *     ratelimits:
 *       X-RateLimit-Limit:
 *         schema:
 *           type: integer
 *         description: Request limit per hour.
 *       X-RateLimit-Remaining:
 *         schema:
 *           type: integer
 *         description: The number of requests left for the time window.
 *       X-RateLimit-Reset:
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The UTC date/time at which the current rate limit window resets.
 */
const createLimiter = (nbRequests : number) => {
    return rateLimit({
        windowMs: 1000 * 60,
        limit: nbRequests,
        standardHeaders: true,
        skip: (req: Request) => bypassRatelimit(req)
    });
};

export { createLimiter };
