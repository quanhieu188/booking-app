import { Router } from "express";
import { COOKIE_NAME, cookieOptions } from "./auth.cookie.js";
import { requireAuth } from "./auth.middleware.js";
import { authLimiter } from "../../lib/rate-limit.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { login, register, signToken, getUserById } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, async(req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await register(input);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
    res.status(201).json({ user })
});

authRouter.post("/login", authLimiter, async(req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await login(input);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
    res.json({ user });
});

authRouter.get("/me", requireAuth, async(req, res) => {
    const user = await getUserById(req.userId!);
    res.json({ user });
});

authRouter.post("/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(204).end();
});