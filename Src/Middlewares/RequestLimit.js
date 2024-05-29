import { rateLimit } from "express-rate-limit";

const requestLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    limit: 100,
    message: "Too many requests from this IP address.... Try again later after couple of minutes"
});

const otpLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    standardHeaders: "draft-7",
    message: "Too many request for OTP from this IP address.... try again later after sometimes"
});

export { requestLimit, otpLimit }