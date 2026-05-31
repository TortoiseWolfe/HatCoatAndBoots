import React from 'react';

export interface LayeredDiagramProps {
  /** Optional children elements */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LayeredDiagram component
 *
 * @category architecture
 */
export default function LayeredDiagram({
  children,
  className = '',
}: LayeredDiagramProps) {
  return (
    <div className={`layered-diagram${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
