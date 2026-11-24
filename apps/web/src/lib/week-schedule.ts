export type Range = { start: string; end: string };
export type Interval = Range & { weekday: number };
export type DaySchedule = {
  weekday: number; // 1 = Monday ... 7 = Sunday (khớp với API)
  label: string;
  enabled: boolean;
  ranges: Range[];
};

export const WEEKDAYS = [
  { weekday: 1, label: "Monday" },
  { weekday: 2, label: "Tuesday" },
  { weekday: 3, label: "Wednesday" },
  { weekday: 4, label: "Thursday" },
  { weekday: 5, label: "Friday" },
  { weekday: 6, label: "Saturday" },
  { weekday: 7, label: "Sunday" },
] as const;

export const DEFAULT_RANGE: Range = { start: "09:00", end: "17:00" };

// Danh sách phẳng từ API -> 7 ngày
export function toWeek(intervals: Interval[]): DaySchedule[] {
  return WEEKDAYS.map(({ weekday, label }) => {
    const ranges = intervals
      .filter((i) => i.weekday === weekday)
      .map(({ start, end }) => ({ start, end }));
    return ranges.length > 0
      ? { weekday, label, enabled: true, ranges }
      : { weekday, label, enabled: false, ranges: [{ ...DEFAULT_RANGE }] };
  });
}

// 7 ngày -> danh sách phẳng để gửi lên API (chỉ lấy ngày đang bật)
export function toIntervals(week: DaySchedule[]): Interval[] {
  return week
    .filter((d) => d.enabled)
    .flatMap((d) => d.ranges.map((r) => ({ weekday: d.weekday, start: r.start, end: r.end })));
}

export function setDayEnabled(
  week: DaySchedule[],
  weekday: number,
  enabled: boolean,
): DaySchedule[] {
  return week.map((d) => (d.weekday === weekday ? { ...d, enabled } : d));
}

export function sameIntervals(a: Interval[], b: Interval[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (x, i) => x.weekday === b[i].weekday && x.start === b[i].start && x.end === b[i].end,
    )
  );
}