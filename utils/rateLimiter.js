import rateLimit from "express-rate-limit"

export const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 login attempts per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts, please try again after 15 minutes."
})