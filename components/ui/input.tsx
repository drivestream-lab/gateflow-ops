import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-ink-muted/30 bg-surface px-3 py-2 text-sm",
        "focus:border-brand focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
