import { HttpError } from "../../lib/http-error.js";
import { isUniqueViolation } from "../../lib/prisma-errors.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUser, type PublicUser } from "../../lib/public-user.js";
import type { UpdateSettingsInput } from "./settings.schemas.js";

export async function updateSettings(
  userId: string,
  input: UpdateSettingsInput,
): Promise<PublicUser> {
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: input });
    return toPublicUser(user);
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError(409, "This link is already taken");
    throw e;
  }
}