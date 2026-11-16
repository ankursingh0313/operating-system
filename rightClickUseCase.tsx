'use client'

import { useContextMenu } from '@/lib/hooks/useContextMenu';
import { useAppDispatch } from '@/lib/hooks';
import { toggleMode } from '@/lib/features/themeSlice';

export default function DesktopArea() {
  const dispatch = useAppDispatch();

  // 1. Desktop background right-click options
  const desktopMenu = useContextMenu([
    {
      id: 'refresh',
      label: 'Refresh Desktop',
      shortcut: 'F5',
      onClick: () => window.location.reload(),
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Dark/Light Mode',
      dividerAbove: true,
      onClick: () => dispatch(toggleMode()),
    },
  ]);

  // 2. Folder icon overrides the desktop right-click with its own options
  const folderMenu = useContextMenu([
    {
      id: 'open',
      label: 'Open Folder',
      onClick: () => console.log('Opening folder...'),
    },
    {
      id: 'delete',
      label: 'Delete',
      danger: true,
      dividerAbove: true,
      onClick: () => console.log('Deleting folder...'),
    },
  ]);

  return (
    <main
      {...desktopMenu}
      className="w-screen h-screen bg-gray-950 p-6 select-none"
    >
      {/* Right-clicking this icon overrides the desktop menu */}
      <div
        {...folderMenu}
        className="w-24 p-3 rounded hover:bg-white/10 text-white text-center cursor-pointer"
      >
        📁 Projects
      </div>

      {/* Right-clicking this element has no options — shows nothing */}
      <div className="mt-8 text-gray-400">
        Right-click anywhere on the desktop, or on the Projects folder.
      </div>
    </main>
  );
}