import { describe, expect, it } from "vitest";
import {
  addRange,
  getRangeError,
  hasErrors,
  removeRange,
  toIntervals,
  toWeek,
  updateRange,
  type Interval,
} from "./week-schedule";

const r = (start: string, end: string) => ({ start, end });

describe("getRangeError", () => {
  it("accepts a valid range", () => {
    expect(getRangeError([r("09:00", "12:00")], 0)).toBeUndefined();
  });

  it("rejects an end time that is not after the start time", () => {
    expect(getRangeError([r("17:00", "09:00")], 0)).toBe("End time must be after start time");
    expect(getRangeError([r("09:00", "09:00")], 0)).toBe("End time must be after start time");
  });

  it("flags both ranges when they overlap", () => {
    const ranges = [r("09:00", "12:00"), r("11:00", "14:00")];
    expect(getRangeError(ranges, 0)).toBe("Overlaps with another range");
    expect(getRangeError(ranges, 1)).toBe("Overlaps with another range");
  });

  it("allows ranges that only touch", () => {
    const ranges = [r("09:00", "12:00"), r("12:00", "14:00")];
    expect(getRangeError(ranges, 0)).toBeUndefined();
    expect(getRangeError(ranges, 1)).toBeUndefined();
  });

  it("requires both times to be filled in", () => {
    expect(getRangeError([r("", "12:00")], 0)).toBe("Enter both start and end time");
  });
});

describe("editing ranges", () => {
  const saved: Interval[] = [{ weekday: 1, start: "09:00", end: "12:00" }];

  it("adds a one-hour range right after the last one", () => {
    const week = addRange(toWeek(saved), 1);
    expect(week[0].ranges).toEqual([r("09:00", "12:00"), r("12:00", "13:00")]);
  });

  it("updates one field of one range", () => {
    const week = updateRange(toWeek(saved), 1, 0, { end: "11:30" });
    expect(week[0].ranges[0]).toEqual(r("09:00", "11:30"));
  });

  it("turns the day off when its only range is removed", () => {
    const week = removeRange(toWeek(saved), 1, 0);
    expect(week[0].enabled).toBe(false);
    expect(toIntervals(week)).toEqual([]);
  });

  it("sends ranges sorted by start time", () => {
    let week = addRange(toWeek(saved), 1); // 09-12, 12-13
    week = updateRange(week, 1, 0, { start: "14:00", end: "15:00" }); // 14-15, 12-13
    expect(toIntervals(week).map((i) => i.start)).toEqual(["12:00", "14:00"]);
  });

  it("blocks saving for an invalid enabled day but ignores disabled days", () => {
    let week = updateRange(toWeek(saved), 1, 0, { end: "08:00" });
    expect(hasErrors(week)).toBe(true);

    week = week.map((d) => (d.weekday === 1 ? { ...d, enabled: false } : d));
    expect(hasErrors(week)).toBe(false);
  });
});