export type PublicUser = {
  id: string;
  email: string;
  name: string;
  slug: string;
  timezone: string;
  slotMinutes: number;
};

export function toPublicUser(user: PublicUser): PublicUser {
  const { id, email, name, slug, timezone, slotMinutes } = user;
  return { id, email, name, slug, timezone, slotMinutes };
}