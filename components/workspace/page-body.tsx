import { cn } from "@/lib/utils";

interface PageBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PageBody({ children, className }: PageBodyProps) {
  return <div className={cn("flex-1 overflow-auto p-4 md:p-6", className)}>{children}</div>;
}
