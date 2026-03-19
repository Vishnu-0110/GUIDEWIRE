import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-accent text-accent-foreground",
    success: "bg-emerald-100 text-emerald-900",
    danger: "bg-red-100 text-red-900",
    warning: "bg-amber-100 text-amber-900"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
