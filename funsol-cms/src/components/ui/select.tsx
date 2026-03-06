import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors appearance-none",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
            error && "border-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
