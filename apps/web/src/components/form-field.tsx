import type { ComponentProps } from "react";

type Pros = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, ...props }: Pros) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 aria-invalid:border-red-500"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
