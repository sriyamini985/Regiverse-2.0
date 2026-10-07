import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
