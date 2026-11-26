import { z } from "zod";

export const SLOT_OPTIONS = [15, 30, 45, 60] as const;

// Những đường dẫn thuộc về chính app, người dùng không được lấy làm slug.
export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "logout",
  "dashboard",
  "availability",
  "settings",
  "bookings",
  "booking",
  "cancel",
  "api",
  "auth",
  "admin",
  "health",
  "help",
  "about",
  "privacy",
  "terms",
  "support",
  "app",
  "www",
]);

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(30, "Use at most 30 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens only")
  .refine((s) => !RESERVED_SLUGS.has(s), "This link is reserved, please choose another");

export const updateSettingsSchema = z
  .object({
    timezone: z.string().refine(isValidTimeZone, "Unknown time zone").optional(),
    slotMinutes: z
      .number()
      .refine(
        (v) => (SLOT_OPTIONS as readonly number[]).includes(v),
        "Choose 15, 30, 45 or 60 minutes",
      )
      .optional(),
    slug: slugSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Nothing to update" });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;