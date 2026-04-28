import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <label className="relative inline-flex h-5 w-5 items-center justify-center">
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded border border-input bg-background/70 transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring",
        className,
      )}
    >
      <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 transition peer-checked:opacity-100" />
    </span>
  </label>
));
Checkbox.displayName = "Checkbox";
