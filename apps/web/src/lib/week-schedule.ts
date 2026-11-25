export type Range = { start: string; end: string };
export type Interval = Range & { weekday: number };
export type DaySchedule = {
  weekday: number; // 1 = Monday ... 7 = Sunday (khớp với API)
  label: string;
  enabled: boolean;
  ranges: Range[];
};

export const MAX_RANGES_PER_DAY = 5;

export function toMinutes(time: string): number {
  if (!time) return NaN;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

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
    .flatMap((d) =>
      [...d.ranges]
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .map((r) => ({ weekday: d.weekday, start: r.start, end: r.end })),
    );
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
    a.every((x, i) => x.weekday === b[i].weekday && x.start === b[i].start && x.end === b[i].end)
  );
}

export function getRangeError(ranges: Range[], index: number): string | undefined {
  const range = ranges[index];
  if (!range.start || !range.end) return "Enter both start and end time";

  const start = toMinutes(range.start);
  const end = toMinutes(range.end);
  if (start >= end) return "End time must be after start time";

  // Hai khoảng [s, e) và [os, oe) chồng nhau khi s < oe và os < e.
  // Chạm đầu nhau (e == os) thì không tính là chồng.
  const overlaps = ranges.some(
    (other, i) =>
      i !== index &&
      other.start &&
      other.end &&
      start < toMinutes(other.end) &&
      toMinutes(other.start) < end,
  );
  return overlaps ? "Overlaps with another range" : undefined;
}

// Chỉ tính các ngày đang bật, ngày tắt không được gửi đi nên không cần hợp lệ.
export function hasErrors(week: DaySchedule[]): boolean {
  return week.some(
    (d) => d.enabled && d.ranges.some((_, i) => getRangeError(d.ranges, i) !== undefined),
  );
}

export function updateRange(
  week: DaySchedule[],
  weekday: number,
  index: number,
  patch: Partial<Range>,
): DaySchedule[] {
  return week.map((d) =>
    d.weekday !== weekday
      ? d
      : { ...d, ranges: d.ranges.map((r, i) => (i === index ? { ...r, ...patch } : r)) },
  );
}

// Khoảng mới bắt đầu ngay khi khoảng cuối kết thúc, dài 1 giờ (không vượt 23:59).
export function nextRange(ranges: Range[]): Range {
  const last = ranges[ranges.length - 1];
  if (!last || !last.end) return { ...DEFAULT_RANGE };
  const end = Math.min(toMinutes(last.end) + 60, 23 * 60 + 59);
  return { start: last.end, end: toTime(end) };
}

export function addRange(week: DaySchedule[], weekday: number): DaySchedule[] {
  return week.map((d) =>
    d.weekday === weekday ? { ...d, ranges: [...d.ranges, nextRange(d.ranges)] } : d,
  );
}

// Xoá khoảng duy nhất của một ngày thì tắt ngày đó (và nhớ lại khoảng mặc định).
export function removeRange(week: DaySchedule[], weekday: number, index: number): DaySchedule[] {
  return week.map((d) => {
    if (d.weekday !== weekday) return d;
    if (d.ranges.length <= 1) return { ...d, enabled: false, ranges: [{ ...DEFAULT_RANGE }] };
    return { ...d, ranges: d.ranges.filter((_, i) => i !== index) };
  });
}