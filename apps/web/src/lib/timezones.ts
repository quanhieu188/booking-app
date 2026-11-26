// Danh sách múi giờ IANA của trình duyệt, cộng thêm các giá trị bắt buộc phải có
// trong danh sách (múi giờ hiện tại của người dùng, UTC) để ô chọn không bao giờ trống.
export function getTimeZones(...extra: (string | undefined)[]): string[] {
  const zones = new Set<string>([...Intl.supportedValuesOf("timeZone"), "UTC"]);
  for (const tz of extra) if (tz) zones.add(tz);
  return [...zones].sort();
}

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}