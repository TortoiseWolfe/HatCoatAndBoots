import React from 'react';

export interface GuidedViewsProps {
  /** Optional children elements */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * GuidedViews component
 *
 * @category architecture
 */
export default function GuidedViews({
  children,
  className = '',
}: GuidedViewsProps) {
  return (
    <div className={`guided-views${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
