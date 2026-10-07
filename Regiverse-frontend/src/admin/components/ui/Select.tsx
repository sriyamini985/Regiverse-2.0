import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      helperText,
      error,
      options,
      children,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-11 pl-4 pr-10 text-sm font-medium bg-white text-slate-900 border rounded-xl appearance-none transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500/20"
                : "border-slate-200 hover:border-slate-300"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "AdminSelect";
export default Select;
