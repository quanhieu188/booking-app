"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { SelectField } from "@/components/select-field";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/auth-api";
import { settingsSchema, type SettingsForm } from "@/lib/schemas";
import type { SettingsPatch } from "@/lib/settings-api";
import { deviceTimeZone, getTimeZones } from "@/lib/timezones";
import { useCurrentUser } from "@/lib/use-current-user";
import { useUpdateSettings } from "@/lib/use-settings";

const SLOT_OPTIONS = [15, 30, 45, 60];
const FIELDS: readonly string[] = ["timezone", "slotMinutes", "slug"];

function SettingsFormView({ user }: { user: User }) {
  const update = useUpdateSettings();
  const [saved, setSaved] = useState(false);
  const device = deviceTimeZone();
  const zones = useMemo(() => getTimeZones(user.timezone, device), [user.timezone, device]);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { timezone: user.timezone, slotMinutes: user.slotMinutes, slug: user.slug },
  });

  const slugPreview = watch("slug");

  async function onSubmit(values: SettingsForm) {
    // Chỉ gửi những trường người dùng đã đổi
    const patch: SettingsPatch = {};
    if (dirtyFields.timezone) patch.timezone = values.timezone;
    if (dirtyFields.slotMinutes) patch.slotMinutes = values.slotMinutes;
    if (dirtyFields.slug) patch.slug = values.slug;

    try {
      const updated = await update.mutateAsync(patch);
      // Đặt lại "giá trị gốc" của form theo dữ liệu server vừa trả về
      reset({
        timezone: updated.timezone,
        slotMinutes: updated.slotMinutes,
        slug: updated.slug,
      });
      setSaved(true);
    } catch (e) {
      setSaved(false);
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setError("slug", { message: e.message });
          return;
        }
        const issues = (e.issues ?? []).filter((i) => FIELDS.includes(i.path));
        if (issues.length > 0) {
          issues.forEach((i) => setError(i.path as keyof SettingsForm, { message: i.message }));
          return;
        }
        setError("root.serverError", { type: "server", message: e.message });
        return;
      }
      setError("root.serverError", { type: "server", message: "Cannot reach the server" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <SelectField
        id="slotMinutes"
        label="Meeting length"
        error={errors.slotMinutes?.message}
        {...register("slotMinutes", { valueAsNumber: true })}
      >
        {SLOT_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m} minutes
          </option>
        ))}
      </SelectField>

      <div className="space-y-2">
        <SelectField
          id="timezone"
          label="Time zone"
          error={errors.timezone?.message}
          {...register("timezone")}
        >
          {zones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </SelectField>
        <p className="text-sm text-gray-600">
          Your availability hours are in this time zone.{" "}
          {device !== watch("timezone") && (
            <button
              type="button"
              onClick={() => setValue("timezone", device, { shouldDirty: true })}
              className="text-blue-600 underline"
            >
              Use my device time zone ({device})
            </button>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <FormField id="slug" label="Your public link" error={errors.slug?.message} {...register("slug")} />
        <p className="text-sm text-gray-600">
          {window.location.origin}/<strong>{slugPreview}</strong>. Changing it breaks links you have
          already shared.
        </p>
      </div>

      {errors.root?.serverError && (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.serverError.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        {saved && !isDirty && <span className="text-sm text-green-700">Saved</span>}
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600">How guests see and book your calendar.</p>
      </div>
      <SettingsFormView key={user.id} user={user} />
    </div>
  );
}