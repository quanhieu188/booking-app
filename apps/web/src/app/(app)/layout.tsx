"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/auth-api";
import { useCurrentUser } from "@/lib/use-current-user";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending, error, refetch } = useCurrentUser();

  const unauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (unauthorized) router.replace("/login");
  }, [unauthorized, router]);

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear(); // xoá cache để người dùng sau không thấy dữ liệu của người trước
      router.replace("/login");
    },
  });

  if (isPending || unauthorized) {
    return <p className="p-6 text-sm text-gray-600">Loading...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-sm text-red-600">Cannot reach the server.</p>
        <button onClick={() => refetch()} className="rounded-md border px-3 py-1.5 text-sm">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-semibold">
              Booking App
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-md border px-3 py-1.5 disabled:opacity-60"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
};