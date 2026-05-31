import React from 'react';

export interface HatViewerProps {
  /** Optional children elements */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * HatViewer component
 *
 * @category architecture
 */
export default function HatViewer({
  children,
  className = '',
}: HatViewerProps) {
  return (
    <div className={`hat-viewer${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
