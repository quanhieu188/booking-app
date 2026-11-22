"use client";

import { useCurrentUser } from "@/lib/use-current-user";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Hello, {user?.name}</h1>
      <p className="text-sm text-gray-600">Your public link will be /{user?.slug}</p>
    </div>
  );
};