import React from "react";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  context?: string;
  badge?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  context,
  badge,
  isLoading = false,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-slate-300 transition-colors duration-150 flex flex-col justify-between ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium text-[#64748B] block">
            {title}
          </span>
          {isLoading ? (
            <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
          )}
        </div>

        {icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(context || badge) && (
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
          {context && <span>{context}</span>}
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
