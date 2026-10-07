import React from "react";
import { Loader2 } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
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
  iconBg = "bg-blue-50 border-blue-100",
  iconColor = "text-blue-600",
  context,
  badge,
  isLoading = false,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
              </h3>
            )}
            {badge}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      {context && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{context}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
