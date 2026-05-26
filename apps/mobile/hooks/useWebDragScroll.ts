import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

interface Scrollable {
  getScrollableNode?: () => unknown;
}

const DRAG_THRESHOLD = 4;

export function useWebDragScroll() {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((instance: Scrollable | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (Platform.OS !== 'web' || !instance) return;

    const node = instance.getScrollableNode?.() as HTMLElement | undefined;
    if (!node) return;

    node.style.cursor = 'grab';
    node.style.userSelect = 'none';

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    function onDown(e: MouseEvent) {
      if (!node) return;
      isDown = true;
      startX = e.pageX;
      startScrollLeft = node.scrollLeft;
      moved = false;
      node.style.cursor = 'grabbing';
    }
    function onMove(e: MouseEvent) {
      if (!isDown || !node) return;
      const delta = e.pageX - startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) {
        moved = true;
        e.preventDefault();
        node.scrollLeft = startScrollLeft - delta;
      }
    }
    function onUp() {
      if (!isDown) return;
      isDown = false;
      if (node) node.style.cursor = 'grab';
      if (moved) {
        const blocker = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
          document.removeEventListener('click', blocker, true);
        };
        document.addEventListener('click', blocker, true);
      }
    }

    node.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    cleanupRef.current = () => {
      node.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);
}
