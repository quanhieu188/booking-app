import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { updateAvailabilitySchema } from "./availability.schemas.js";
import { getAvailability, replaceAvailability } from "./availability.service.js";

export const availabilityRouter = Router();

availabilityRouter.use(requireAuth);

availabilityRouter.get("/", async (req, res) => {
    const intervals = await getAvailability(req.userId!);
    res.json({ intervals });
});

availabilityRouter.put("/", async (req, res) => {
    const input = updateAvailabilitySchema.parse(req.body);
    const intervals = await replaceAvailability(req.userId!, input.intervals);
    res.json({ intervals });
});