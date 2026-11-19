import { Router, type CookieOptions } from "express";
import { env } from "../../config/env.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { login, register, signToken } from "./auth.service.js";

export const COOKIE_NAME = "token";

const cookieOptions: CookieOptions = {
    httpOnly: true, // JavaScript trên trình duyệt không đọc được cookie này
    sameSite: "lax",
    secure: env.NODE_ENV == "production", // chỉ gửi qua HTTPS khi lên production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};

export const authRouter = Router();

authRouter.post("/register", async(req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await register(input);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
    res.status(201).json({ user })
});

authRouter.post("/login", async(req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await login(input);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
    res.json({ user });
});