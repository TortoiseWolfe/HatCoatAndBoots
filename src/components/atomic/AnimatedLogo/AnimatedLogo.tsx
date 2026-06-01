'use client';

import React from 'react';
import styles from './AnimatedLogo.module.css';

export interface AnimatedLogoProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
  '2xl': 'text-6xl',
  '3xl': 'text-7xl',
};

const speedMultipliers = {
  slow: 1.5,
  normal: 1,
  fast: 0.7,
};

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  text = 'HatCoatAndBoots',
  className = '',
  size = 'xl',
  animationSpeed = 'normal',
}) => {
  const letters = text.split('');
  const speedMultiplier = speedMultipliers[animationSpeed];

  return (
    <span
      // flex-wrap + max-w-full: the per-letter spans are laid out with flex,
      // which by default does NOT wrap — at narrow viewports (≤320px) the
      // (unbreakable) project name forced the whole hero column ~60px wider than
      // its container, causing horizontal page overflow (#17). Allowing the
      // letters to wrap and capping at the container width fixes it without
      // changing the desktop appearance.
      className={`${styles.animatedLogo} ${sizeClasses[size]} ${className} text-primary inline-flex max-w-full cursor-pointer flex-wrap font-bold`}
      style={{
        filter: 'drop-shadow(2px 2px 2px rgb(0 0 0 / 0.8))',
      }}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          className={styles.letter}
          style={{
            animationDelay: `${index * 0.05 * speedMultiplier}s`,
            animationDuration: `${0.6 * speedMultiplier}s`,
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

AnimatedLogo.displayName = 'AnimatedLogo';
