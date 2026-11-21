"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi, type User } from "@/lib/auth-api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    await authApi.logout();
    router.replace("/login");
  }

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Hello, {user.name}</h1>
      <p className="text-sm text-gray-600">Your public link will be /{user.slug}</p>
      <button onClick={handleLogout} className="rounded-md border px-4 py-2 text-sm">
        Log out
      </button>
    </main>
  );
}