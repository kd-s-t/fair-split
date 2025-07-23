import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge; 