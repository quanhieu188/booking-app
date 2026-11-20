import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // cửa sổ 15 phút
    limit: 10, // tối đa 10 lần thất bại trong 1 cửa sổ
    skipSuccessfulRequests: true, //chỉ tính các lần thử thất bại
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" }
});