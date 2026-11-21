"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/auth-api";
import { loginSchema, type LoginForm } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    try {
      await authApi.login(values);
      router.push("/dashboard");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Cannot reach the server";
      setError("root.serverError", { type: "server", message });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {errors.root?.serverError && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.serverError.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        No account yet?{" "}
        <Link href="/register" className="text-blue-600 underline">
          Register
        </Link>
      </p>
    </main>
  );
}