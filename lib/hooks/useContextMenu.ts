import { MouseEvent } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import {
  openContextMenu,
  closeContextMenu,
  registerMenuActions,
  ContextMenuItem,
} from '@/lib/features/contextMenuSlice';

export interface MenuOption extends ContextMenuItem {
  onClick: () => void;
}

export function useContextMenu(options: MenuOption[]) {
  const dispatch = useAppDispatch();

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents bubbling to parent context menus or window

    if (!options || options.length === 0) {
      dispatch(closeContextMenu());
      return;
    }

    const handlers: Record<string, () => void> = {};
    const serializableItems: ContextMenuItem[] = options.map(
      ({ onClick, ...item }) => {
        handlers[item.id] = onClick;
        return item;
      }
    );

    registerMenuActions(handlers);
    dispatch(
      openContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: serializableItems,
      })
    );
  };

  return { onContextMenu };
}