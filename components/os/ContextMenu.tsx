'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  closeContextMenu,
  triggerMenuAction,
} from '@/lib/features/contextMenuSlice';
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages';

export default function ContextMenu() {
  const dispatch = useAppDispatch();
  const { isOpen, x, y, items } = useAppSelector((state) => state.contextMenu);
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme);

  const activeAccent = hydrated ? accent : 'blue';
  const activeMode = hydrated ? mode : 'dark';
  const isLight = activeMode === 'light';

  const theme = COLOR_PACKAGES[activeAccent];
  const surface = getSurfacePackage(activeMode);

  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      dispatch(closeContextMenu());
    };

    const handleGlobalClick = () => {
      dispatch(closeContextMenu());
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('scroll', handleGlobalClick, true);

    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('scroll', handleGlobalClick, true);
    };
  }, [dispatch]);

  if (!isOpen || items.length === 0) return null;

  const menuWidth = 208;
  const menuHeight = items.length * 40;
  const safeX =
    typeof window !== 'undefined' && x + menuWidth > window.innerWidth
      ? window.innerWidth - menuWidth - 8
      : x;
  const safeY =
    typeof window !== 'undefined' && y + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 8
      : y;

  // Convert `bg-<color>-600` to a hover-only class `hover:bg-<color>-600`
  const hoverAccentBg = theme.primaryBg
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => (cls.startsWith('hover:') ? cls : `hover:${cls}`))
    .join(' ');

  return (
    <div
      style={{ top: safeY, left: safeX }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`fixed z-[9999] w-52 rounded-xl backdrop-blur-md border p-1.5 shadow-2xl ${surface.border} ${
        isLight ? 'bg-white/95' : 'bg-gray-900/95'
      } ${theme.glow} select-none`}
    >
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <div key={item.id}>
            {item.dividerAbove && (
              <div className={`my-1 border-t ${surface.borderSubtle}`} />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerMenuAction(item.id);
                dispatch(closeContextMenu());
              }}
              className={`group w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                item.danger
                  ? isLight
                    ? 'text-red-600 hover:bg-red-600 hover:text-white'
                    : 'text-red-400 hover:bg-red-500 hover:text-white'
                  : `${surface.textPrimary} ${hoverAccentBg} hover:text-white`
              }`}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span
                  className={`text-[10px] ml-4 ${surface.textMuted} group-hover:text-white/80`}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}