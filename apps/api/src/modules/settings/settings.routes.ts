import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { updateSettingsSchema } from "./settings.schemas.js";
import { updateSettings } from "./settings.service.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.patch("/", async (req, res) => {
  const input = updateSettingsSchema.parse(req.body);
  const user = await updateSettings(req.userId!, input);
  res.json({ user });
});