import { useEffect } from 'react';

export const useShortcuts = (actions: {
  onUndo: () => void;
  onToggleMode: () => void;
  onHelp: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        actions.onUndo();
      }
      // 'M' to toggle Box/Polygon mode (only if not typing in an input)
      if (e.key.toLowerCase() === 'm' && e.target instanceof HTMLBodyElement) {
        actions.onToggleMode();
      }
      // 'Shift + ?' for help modal
      if (e.key === '?' && e.shiftKey && e.target instanceof HTMLBodyElement) {
        actions.onHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};
