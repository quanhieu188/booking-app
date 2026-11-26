import { apiFetch } from "./api";
import type { User } from "./auth-api";

export type SettingsPatch = Partial<Pick<User, "timezone" | "slotMinutes" | "slug">>;

export const settingsApi = {
  update: async (patch: SettingsPatch) =>
    (
      await apiFetch<{ user: User }>("/settings", {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    ).user,
};