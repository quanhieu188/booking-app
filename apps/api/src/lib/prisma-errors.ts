// Mã P2002 của Prisma = vi phạm ràng buộc unique
export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}