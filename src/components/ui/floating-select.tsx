import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FloatingSelectProps {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

const FloatingSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  FloatingSelectProps
>(({ className, label, value, placeholder, children, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const hasValue = !!value;

  return (
    <div className="relative">
      <Select
        value={value}
        onValueChange={props.onValueChange}
        disabled={props.disabled}
        onOpenChange={(open) => setFocused(open)}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            "h-14 pt-8 pb-3 text-gray-900",
            className
          )}
        >
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      <label
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          focused || hasValue
            ? "top-1 text-xs text-gray-400 font-normal"
            : "top-4 text-sm text-gray-400"
        )}
      >
        {label}
      </label>
    </div>
  );
});

FloatingSelect.displayName = "FloatingSelect";

export { FloatingSelect };
