import { useEffect } from 'react';

export const useShortcuts = (actions: {
  onUndo: () => void;
  onToggleMode: () => void;
  onHelp: () => void;
  onCancelDraw?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when the user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Ctrl+Z or Cmd+Z — Undo last point
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        actions.onUndo();
        return;
      }

      if (isTyping) return; // No single-key shortcuts while typing

      // 'M' — Toggle Box/Polygon draw mode
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        actions.onToggleMode();
        return;
      }

      // 'Escape' — Cancel current drawing
      if (e.key === 'Escape') {
        actions.onCancelDraw?.();
        return;
      }

      // 'Shift+?' — Open keyboard shortcut help modal
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        actions.onHelp();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};
