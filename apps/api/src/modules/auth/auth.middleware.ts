import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { COOKIE_NAME } from "./auth.cookie.js";

// Cho TypeScript biết sau requireAuth thì req có thêm userId.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, "Not authenticated");

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Invalid payload");
    }
    req.userId = payload.sub;
  } catch {
    throw new HttpError(401, "Invalid or expired session");
  }
  next();
};