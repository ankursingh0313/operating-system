'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function GradientWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <div className="absolute inset-0 z-0 bg-gray-950 overflow-hidden pointer-events-none flex items-center justify-center">
      <div className={`absolute w-[700px] h-[700px] rounded-full bg-gradient-to-tr ${theme.gradient} opacity-25 blur-[110px] will-change-transform animate-pulse`} />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[90px]" />
    </div>
  )
}