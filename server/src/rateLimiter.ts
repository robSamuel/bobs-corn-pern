import rateLimit from "express-rate-limit";

export const cornLimiter = rateLimit({
        windowMs: 60 * 1000, //rate limiter for 1 minute
        limit: 1, //max amount of actions per window
        statusCode: 429, // status code return in case max limit is reached
        message: "You have bought too much corn, is everything ok at home? We will allow you to buy more in 1 minute.",
        standardHeaders: true,
        legacyHeaders: false
    }
);

