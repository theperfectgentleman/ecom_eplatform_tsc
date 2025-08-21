import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  mask?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, mask, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value);

    React.useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    const applyMask = (value: string, maskPattern: string) => {
      if (!maskPattern) return value;
      switch (maskPattern) {
        case 'bp': {
          const cleaned = value.replace(/[^\d/]/g, '');
          const numericOnly = cleaned.replace(/\D/g, '');
          if (numericOnly.length === 0) return '';
          if (numericOnly.length <= 3) return numericOnly;
          if (numericOnly.length <= 6) return numericOnly.slice(0, 3) + '/' + numericOnly.slice(3);
          return numericOnly.slice(0, 3) + '/' + numericOnly.slice(3, 6);
        }
        case 'weight': {
          const digits = value.replace(/\D/g, '');
          return digits.slice(0, 3);
        }
        case 'temp': {
          const digits = value.replace(/\D/g, '');
          return digits.slice(0, 2);
        }
        case 'pulse': {
          const digits = value.replace(/\D/g, '');
          return digits.slice(0, 3);
        }
        case 'year': {
          const digits = value.replace(/\D/g, '');
          return digits.slice(0, 4);
        }
        default:
          return value;
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (mask) {
        // Allow control keys (backspace, delete, tab, escape, enter, etc.)
        if (e.ctrlKey || e.altKey || e.metaKey || 
            ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          return;
        }
        
        // For specific masks, only allow certain characters
        switch (mask) {
          case 'bp':
            // Allow digits and slash
            if (!/[\d/]/.test(e.key)) {
              e.preventDefault();
            }
            break;
          case 'weight':
          case 'temp':
          case 'pulse':
          case 'year':
            // Allow digits only (no decimals)
            if (!/\d/.test(e.key)) {
              e.preventDefault();
            }
            break;
        }
      }
      
      // Call the original onKeyDown if provided
      props.onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const originalValue = e.target.value;
        const maskedValue = applyMask(originalValue, mask);
        
        // Only proceed if the value actually changed after masking
        if (maskedValue !== originalValue) {
          // Set the masked value directly on the input element
          e.target.value = maskedValue;
        }
        
        // Always call onChange with the masked value
        if (props.onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: maskedValue,
              name: props.name || e.target.name
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          props.onChange(syntheticEvent);
        }
      } else {
        props.onChange?.(e);
      }
    };

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-14 w-full rounded-md border border-input bg-background px-3 py-3 pt-8 pb-3 text-sm text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
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
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
