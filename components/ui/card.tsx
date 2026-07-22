import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-ink-muted/15 bg-surface p-6", className)}
      {...props}
    />
  );
}
