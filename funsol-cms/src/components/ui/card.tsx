import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-elevation-1 dark:border-gray-700 dark:bg-gray-800", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("border-b border-gray-200 px-6 py-4 dark:border-gray-700", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn("border-t border-gray-200 px-6 py-4 dark:border-gray-700", className)}>
      {children}
    </div>
  );
}
