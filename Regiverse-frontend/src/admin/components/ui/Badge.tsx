import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "neutral"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "purple"
    | "cyan";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  ...props
}) => {
  const variantStyles = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200",
  };

  const dotColors = {
    neutral: "bg-slate-500",
    primary: "bg-blue-600",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-semibold",
    md: "text-xs px-2.5 py-1 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
