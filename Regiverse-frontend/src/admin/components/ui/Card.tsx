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
      className={`bg-white rounded-xl border border-[#E2E8F0] shadow-2xs ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "p-5"}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#F1F5F9] rounded-b-xl flex items-center justify-between text-xs text-[#64748B]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
