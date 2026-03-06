import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-800 shadow-elevation-1 hover:shadow-elevation-2",
        secondary: "border border-primary-500 text-primary-500 bg-white hover:bg-primary-100 hover:text-primary-700 dark:bg-transparent dark:text-primary-300 dark:border-primary-300 dark:hover:bg-primary-900",
        success: "bg-status-approved text-white hover:bg-green-600 active:bg-green-700",
        danger: "bg-status-declined text-white hover:bg-red-600 active:bg-red-700",
        ghost: "text-primary-500 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-900",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
