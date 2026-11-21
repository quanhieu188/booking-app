const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiIssue = { path: string; message: string };

export class ApiError extends Error {
  status: number;
  issues?: ApiIssue[];

  constructor(status: number, message: string, issues?: ApiIssue[]) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include", // bắt buộc để trình duyệt gửi và nhận cookie
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? "Something went wrong", data?.issues);
  }
  return data as T;
};