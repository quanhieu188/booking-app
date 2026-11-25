import {
  MAX_RANGES_PER_DAY,
  getRangeError,
  type DaySchedule,
  type Range,
} from "@/lib/week-schedule";
import { Switch } from "./switch";

type Props = {
  day: DaySchedule;
  onToggle: (enabled: boolean) => void;
  onChangeRange: (index: number, patch: Partial<Range>) => void;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
};

const timeInput =
  "rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500";

export function DayRow({ day, onToggle, onChangeRange, onAddRange, onRemoveRange }: Props) {
  return (
    <li className="flex items-start gap-4 p-4">
      <div className="flex w-44 shrink-0 items-center gap-4 pt-1">
        <Switch label={`${day.label} available`} checked={day.enabled} onChange={onToggle} />
        <span className="text-sm font-medium">{day.label}</span>
      </div>

      {day.enabled ? (
        <div className="space-y-2">
          {day.ranges.map((range, i) => {
            const error = getRangeError(day.ranges, i);
            const errorId = `${day.weekday}-${i}-error`;
            return (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label={`${day.label} range ${i + 1} start`}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    value={range.start}
                    onChange={(e) => onChangeRange(i, { start: e.target.value })}
                    className={timeInput}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="time"
                    aria-label={`${day.label} range ${i + 1} end`}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    value={range.end}
                    onChange={(e) => onChangeRange(i, { end: e.target.value })}
                    className={timeInput}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${day.label} range ${i + 1}`}
                    onClick={() => onRemoveRange(i)}
                    className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                {error && (
                  <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {day.ranges.length < MAX_RANGES_PER_DAY && (
            <button
              type="button"
              onClick={onAddRange}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add range
            </button>
          )}
        </div>
      ) : (
        <span className="pt-1 text-sm text-gray-600">Unavailable</span>
      )}
    </li>
  );
}