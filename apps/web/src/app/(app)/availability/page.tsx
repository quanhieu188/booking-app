"use client";

import { useState } from "react";
import { Switch } from "@/components/switch";
import { ApiError } from "@/lib/api";
import { useAvailability, useSaveAvailability } from "@/lib/use-availability";
import {
  sameIntervals,
  setDayEnabled,
  toIntervals,
  toWeek,
  type Interval,
} from "@/lib/week-schedule";

type EditorProps = {
  initial: Interval[];
  onSave: (intervals: Interval[]) => void;
  saving: boolean;
  saved: boolean;
  error: unknown;
};

function Editor({ initial, onSave, saving, saved, error }: EditorProps) {
  const [week, setWeek] = useState(() => toWeek(initial));
  const current = toIntervals(week);
  const dirty = !sameIntervals(current, initial);

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-md border">
        {week.map((day) => (
          <li key={day.weekday} className="flex items-center gap-4 p-4">
            <Switch
              label={`${day.label} available`}
              checked={day.enabled}
              onChange={(enabled) => setWeek((w) => setDayEnabled(w, day.weekday, enabled))}
            />
            <span className="w-28 text-sm font-medium">{day.label}</span>
            <span className="text-sm text-gray-600">
              {day.enabled
                ? day.ranges.map((r) => `${r.start} – ${r.end}`).join(", ")
                : "Unavailable"}
            </span>
          </li>
        ))}
      </ul>

      {error != null && (
        <p role="alert" className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : "Cannot reach the server"}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSave(current)}
          disabled={!dirty || saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && !dirty && <span className="text-sm text-green-700">Saved</span>}
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  const query = useAvailability();
  const save = useSaveAvailability();

  if (query.isPending) return <p className="text-sm text-gray-600">Loading...</p>;

  if (query.error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">Could not load your availability.</p>
        <button onClick={() => query.refetch()} className="rounded-md border px-3 py-1.5 text-sm">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-gray-600">Choose the days you are available for bookings.</p>
      </div>
      <Editor
        key={JSON.stringify(query.data)}
        initial={query.data}
        onSave={(intervals) => save.mutate(intervals)}
        saving={save.isPending}
        saved={save.isSuccess}
        error={save.error}
      />
    </div>
  );
}