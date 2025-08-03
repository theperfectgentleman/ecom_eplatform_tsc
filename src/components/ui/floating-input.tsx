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
      
      // Remove all non-numeric characters first
      const numericValue = value.replace(/\D/g, '');
      
      switch (maskPattern) {
        case 'bp': // nnn/nnn (blood pressure)
          if (numericValue.length === 0) return '';
          if (numericValue.length <= 3) {
            return numericValue;
          } else if (numericValue.length <= 6) {
            return numericValue.slice(0, 3) + '/' + numericValue.slice(3);
          } else {
            return numericValue.slice(0, 3) + '/' + numericValue.slice(3, 6);
          }
        case 'weight': // nnn (weight in kg)
          return numericValue.slice(0, 3);
        case 'temp': // nn (temperature)
          return numericValue.slice(0, 2);
        case 'pulse': // nnn (pulse rate)
          return numericValue.slice(0, 3);
        case 'year': // nnnn (year of birth)
          return numericValue.slice(0, 4);
        default:
          return value;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const originalValue = e.target.value;
        const maskedValue = applyMask(originalValue, mask);
        
        // Update the input value
        e.target.value = maskedValue;
        
        // Create a new event with the masked value
        const maskedEvent = {
          ...e,
          target: {
            ...e.target,
            value: maskedValue
          }
        };
        
        props.onChange?.(maskedEvent as React.ChangeEvent<HTMLInputElement>);
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
