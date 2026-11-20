import type { CookieOptions } from "express";
import { env } from "../../config/env.js";

export const COOKIE_NAME = "token";

export const cookieOptions: CookieOptions = {
    httpOnly: true, // JavaScript trên trình duyệt không đọc được cookie này
    sameSite: "lax",
    secure: env.NODE_ENV == "production", // chỉ gửi qua HTTPS khi lên production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};
