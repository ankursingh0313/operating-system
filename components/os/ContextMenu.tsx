'use client'

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  closeContextMenu,
  triggerMenuAction,
} from '@/lib/features/contextMenuSlice';
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages';

export default function ContextMenu() {
  const dispatch = useAppDispatch();
  const { isOpen, x, y, items } = useAppSelector((state) => state.contextMenu);
  const accent = useAppSelector((state) => state.theme.accent);
  const theme = COLOR_PACKAGES[accent];

  useEffect(() => {
    // Runs when right-clicking ANYWHERE that didn't call e.stopPropagation()
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

  // Keep menu within viewport bounds (assuming ~200px width, ~40px per item)
  const menuWidth = 208;
  const menuHeight = items.length * 38;
  const safeX =
    typeof window !== 'undefined' && x + menuWidth > window.innerWidth
      ? window.innerWidth - menuWidth - 8
      : x;
  const safeY =
    typeof window !== 'undefined' && y + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 8
      : y;

  return (
    <div
      style={{ top: safeY, left: safeX }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`fixed z-[9999] w-52 rounded-lg bg-gray-900/95 backdrop-blur-md border border-gray-700/80 p-1.5 shadow-2xl ${theme.glow} select-none`}
    >
      {items.map((item) => (
        <div key={item.id}>
          {item.dividerAbove && (
            <div className="my-1 border-t border-gray-800" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerMenuAction(item.id);
              dispatch(closeContextMenu());
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
              item.danger
                ? 'text-red-400 hover:bg-red-500/20'
                : `text-gray-200 hover:${theme.primaryBg} hover:text-white`
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-gray-400 ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}