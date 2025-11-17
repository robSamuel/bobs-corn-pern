import rateLimit from "express-rate-limit";

export const cornLimiter = rateLimit({
        windowMs: 60 * 1000,
        limit: 1,
        statusCode: 429,
        message: "You have bought too much corn, is everything ok at home? We will allow you to buy more in 1 minute.",
        standardHeaders: true,
        legacyHeaders: false
    }
);

