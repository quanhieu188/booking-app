"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/auth-api";
import { registerSchema, type RegisterForm } from "@/lib/schemas";

const fields: (keyof RegisterForm)[] = ["name", "email", "password"];

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    try {
      await authApi.register(values);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setError("email", { message: "This email is already registered" });
          return;
        }
        const fieldIssues = (e.issues ?? []).filter((i) =>
          fields.includes(i.path as keyof RegisterForm),
        );
        if (fieldIssues.length > 0) {
          fieldIssues.forEach((i) =>
            setError(i.path as keyof RegisterForm, { message: i.message }),
          );
          return;
        }
        setError("root.serverError", { type: "server", message: e.message });
        return;
      }
      setError("root.serverError", { type: "server", message: "Cannot reach the server" });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="name"
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Log in
        </Link>
      </p>
    </main>
  );
}