import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./lib/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
