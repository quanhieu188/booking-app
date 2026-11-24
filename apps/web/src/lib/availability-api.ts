import { apiFetch } from "./api";
import { Interval } from "./week-schedule";

export const availabilityApi = {
    get: async () => (await apiFetch<{ intervals: Interval[] }>("/availability")).intervals,
    save: async (intervals: Interval[]) => (
        await apiFetch<{ intervals: Interval[] }>("/availability", {
            method: "PUT",
            body: JSON.stringify({ intervals }),
        })
    ).intervals,
};