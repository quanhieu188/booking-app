import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DaySchedule } from "@/lib/week-schedule";
import { DayRow } from "./day-row";

const makeDay = (overrides: Partial<DaySchedule> = {}): DaySchedule => ({
  weekday: 1,
  label: "Monday",
  enabled: true,
  ranges: [{ start: "09:00", end: "12:00" }],
  ...overrides,
});

const noop = () => {};

function setup(day: DaySchedule, handlers: Partial<Parameters<typeof DayRow>[0]> = {}) {
  render(
    <ul>
      <DayRow
        day={day}
        onToggle={noop}
        onChangeRange={noop}
        onAddRange={noop}
        onRemoveRange={noop}
        {...handlers}
      />
    </ul>,
  );
}

describe("DayRow", () => {
  it("shows 'Unavailable' for a disabled day", () => {
    setup(makeDay({ enabled: false }));
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  it("shows an error on both ranges when they overlap", () => {
    setup(
      makeDay({
        ranges: [
          { start: "09:00", end: "12:00" },
          { start: "11:00", end: "14:00" },
        ],
      }),
    );
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("calls onAddRange when '+ Add range' is clicked", async () => {
    const onAddRange = vi.fn();
    setup(makeDay(), { onAddRange });

    await userEvent.click(screen.getByRole("button", { name: "+ Add range" }));

    expect(onAddRange).toHaveBeenCalledOnce();
  });

  it("calls onRemoveRange with the index of the range being removed", async () => {
    const onRemoveRange = vi.fn();
    setup(makeDay(), { onRemoveRange });

    await userEvent.click(screen.getByRole("button", { name: "Remove Monday range 1" }));

    expect(onRemoveRange).toHaveBeenCalledWith(0);
  });
});