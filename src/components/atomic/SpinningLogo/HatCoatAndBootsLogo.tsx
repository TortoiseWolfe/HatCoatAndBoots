import React from 'react';
import Image from 'next/image';

export interface HatCoatAndBootsLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const HatCoatAndBootsLogo: React.FC<HatCoatAndBootsLogoProps> = ({
  className = 'w-full h-full',
  width = 400,
  height = 400,
}) => {
  return (
    <Image
      src="/hatcoatandboots-logo.svg"
      alt="HatCoatAndBoots Logo"
      width={width}
      height={height}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      priority
    />
  );
};

HatCoatAndBootsLogo.displayName = 'HatCoatAndBootsLogo';
