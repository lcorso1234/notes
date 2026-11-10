'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 36, className = '', showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative overflow-hidden rounded-xl shadow-sm border border-blue-100 flex items-center justify-center bg-white shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Practitioner Sanctuary"
          width={size}
          height={size}
          className="object-contain p-0.5"
          priority
        />
      </div>
      {showText && (
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-blue-950 font-serif leading-none">
            Sovereign Mind
          </h1>
          <p className="text-[10px] text-amber-600 font-medium tracking-wide mt-0.5">
            Practitioner Sanctuary
          </p>
        </div>
      )}
    </div>
  );
}
