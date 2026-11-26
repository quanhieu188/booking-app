import { describe, expect, it } from "vitest";
import { settingsSchema } from "./schemas";

const base = { timezone: "Asia/Ho_Chi_Minh", slotMinutes: 30, slug: "quan-hieu" };

describe("settingsSchema", () => {
  it("accepts valid settings", () => {
    expect(settingsSchema.safeParse(base).success).toBe(true);
  });

  it("trims and lowercases the slug", () => {
    const parsed = settingsSchema.parse({ ...base, slug: "  Quan-Hieu " });
    expect(parsed.slug).toBe("quan-hieu");
  });

  it.each(["ab", "-abc", "abc-", "a--b", "a b", "héllo", "a".repeat(31)])(
    "rejects the slug %s",
    (slug) => {
      expect(settingsSchema.safeParse({ ...base, slug }).success).toBe(false);
    },
  );
});