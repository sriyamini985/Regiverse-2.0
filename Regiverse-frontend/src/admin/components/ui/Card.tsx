import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  noPadding = false,
  className = "",
  children,
  ...props
}) => {
  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-shadow duration-200 ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "p-6"}>{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
