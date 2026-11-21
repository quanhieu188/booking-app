import { apiFetch } from "./api";

export type User = {
  id: string;
  email: string;
  name: string;
  slug: string;
  timezone: string;
  slotMinutes: number;
};

type Credentials = { email: string; password: string };
type RegisterBody = Credentials & { name: string };

export const authApi = {
  register: (body: RegisterBody) =>
    apiFetch<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: Credentials) =>
    apiFetch<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch<{ user: User }>("/auth/me"),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
};
