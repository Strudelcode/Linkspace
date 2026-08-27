import React from 'react';
import appIconSvg from '../assets/app_icon/app_icon.svg';

export function Logo({ size = 26, className = '', alt = 'Linkspacee Logo' }) {
  return (
    <img
      src={appIconSvg}
      alt={alt}
      width={size}
      height={size}
      className={`logo-svg-icon rounded-xl object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
    />
  );
}

