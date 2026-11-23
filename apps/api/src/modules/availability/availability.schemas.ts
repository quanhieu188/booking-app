import { z } from "zod";
import { toMinutes } from "./availability.time.js";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const intervalSchema = z.object({
    weekday: z.number().int().min(1).max(7), // 1 = Monday ... 7 = Sunday
    start: timeSchema,
    end: timeSchema,
}).refine((i) => toMinutes(i.start) < toMinutes(i.end), {
    message: "End time must be after start time",
    path: ["end"]
});

export type Interval = z.infer<typeof intervalSchema>;

// Hai khoảng giờ cùng một ngày không được chồng lên nhau.
function hasOverlap(intervals: Interval[]): boolean {
    const byDay = new Map<number, Interval[]>();
    for(const i of intervals) {
        byDay.set(i.weekday, [...(byDay.get(i.weekday) ?? []), i]);
    };
    for(const list of byDay.values()) {
        const sorted = [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
        for (let k = 1; k < sorted.length; k++) {
            if(toMinutes(sorted[k].start) < toMinutes(sorted[k - 1].end)) return true;
        }
    };
    return false
};

export const updateAvailabilitySchema = z.object({
    intervals: z.array(intervalSchema).max(50),
}).refine((data) => !hasOverlap(data.intervals), {
    message: "Time ranges on the same day must not overlap",
    path: ["intervals"],
});

export type updateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;