import { prisma } from "../../lib/prisma.js";
import type { Interval } from "./availability.schemas.js";
import { toMinutes, toTime } from "./availability.time.js";

export async function getAvailability(userId: string): Promise<Interval[]> {
  const rows = await prisma.availability.findMany({
    where: { userId },
    orderBy: [{ weekday: "asc"}, {startMin: "asc" }],
  });
  return rows.map((r) => ({
    weekday: r.weekday,
    start: toTime(r.startMin),
    end: toTime(r.endMin),
  }));
};

export async function replaceAvailability(userId: string, intervals: Interval[]): Promise<Interval[]> {
    await prisma.$transaction([
        prisma.availability.deleteMany({ where: { userId } }),
        prisma.availability.createMany({
            data: intervals.map((i) => ({
                userId,
                weekday: i.weekday,
                startMin: toMinutes(i.start),
                endMin: toMinutes(i.end),
            })),
        }),
    ]);
    return getAvailability(userId);
};