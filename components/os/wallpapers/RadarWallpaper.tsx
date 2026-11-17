'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function RadarWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <>
      <style>{`
        .radar-pattern {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: #09090b;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
        .radar-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(${theme.rawPrimary} 0.1em, transparent 0.1em),
                            linear-gradient(90deg, ${theme.rawPrimary} 0.1em, transparent 0.1em);
          background-size: 3em 3em;
          opacity: 0.25; 
          z-index: 0;
        }
        .radar-pattern::before {
          content: "";
          position: absolute;
          top: 50%; left: 50%;
          width: 150vw; height: 150vh;
          transform: translate(-50%, -50%);
          background: repeating-radial-gradient(circle, transparent 0, transparent 2.9em, ${theme.rawPrimary} 3em);
          opacity: 0.25;
          z-index: 1;
        }
        .radar-pattern::after {
          content: "";
          position: absolute;
          top: 50%; left: 50%;
          width: 40em; height: 40em;
          margin-top: -20em; margin-left: -20em;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 75%, ${theme.rawPrimary} 100%);
          animation: radar-spin 4s linear infinite;
          will-change: transform;
          z-index: 2;
        }
        .radar-center {
          position: absolute;
          top: 50%; left: 50%;
          width: 1em; height: 1em;
          transform: translate(-50%, -50%);
          background-color: ${theme.rawSecondary};
          border-radius: 50%;
          z-index: 3;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0.8em 0.2em ${theme.rawPrimary}; }
          50% { box-shadow: 0 0 2em 0.5em ${theme.rawSecondary}; }
        }
      `}</style>
      <div className="radar-pattern">
        <div className="radar-grid"></div>
        <div className="radar-center"></div>
      </div>
    </>
  )
}