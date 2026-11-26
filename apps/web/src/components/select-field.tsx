import type { ComponentProps } from "react";

type Props = ComponentProps<"select"> & {
  label: string;
  error?: string;
};

export function SelectField({ label, error, id, children, ...props }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500"
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}