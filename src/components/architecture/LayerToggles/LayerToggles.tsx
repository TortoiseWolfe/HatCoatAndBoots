import React from 'react';

export interface LayerTogglesProps {
  /** Optional children elements */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LayerToggles component
 *
 * @category architecture
 */
export default function LayerToggles({
  children,
  className = '',
}: LayerTogglesProps) {
  return (
    <div className={`layer-toggles${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
