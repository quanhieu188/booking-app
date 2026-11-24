import { describe, expect, it } from "vitest";
import { sameIntervals, setDayEnabled, toIntervals, toWeek, type Interval } from "./week-schedule";

const saved: Interval[] = [
  { weekday: 1, start: "09:00", end: "12:00" },
  { weekday: 1, start: "13:00", end: "17:00" },
  { weekday: 2, start: "09:00", end: "17:00" },
];

describe("week-schedule", () => {
  it("marks days that have intervals as enabled and the rest as off with a default range", () => {
    const week = toWeek(saved);

    expect(week).toHaveLength(7);
    expect(week[0]).toMatchObject({ weekday: 1, enabled: true });
    expect(week[0].ranges).toHaveLength(2);
    expect(week[2]).toMatchObject({
      weekday: 3,
      enabled: false,
      ranges: [{ start: "09:00", end: "17:00" }],
    });
  });

  it("returns the same intervals when nothing was changed", () => {
    expect(sameIntervals(toIntervals(toWeek(saved)), saved)).toBe(true);
  });

  it("only sends enabled days, and keeps the ranges when a day is switched off and on again", () => {
    const off = setDayEnabled(toWeek(saved), 1, false);
    expect(toIntervals(off).every((i) => i.weekday !== 1)).toBe(true);

    const backOn = setDayEnabled(off, 1, true);
    expect(sameIntervals(toIntervals(backOn), saved)).toBe(true);
  });

  it("sends an empty list when every day is off", () => {
    let week = toWeek(saved);
    for (const weekday of [1, 2]) week = setDayEnabled(week, weekday, false);
    expect(toIntervals(week)).toEqual([]);
  });
});