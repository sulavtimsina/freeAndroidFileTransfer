import { useState, useCallback, useEffect, useRef } from 'react';

export interface DragDropState {
  isDragging: boolean;
  isDropping: boolean;
  droppedFiles: File[];
}

export interface UseDragDropOptions {
  onFilesDropped?: (files: File[]) => void;
  enabled?: boolean;
}

export function useDragDrop(options: UseDragDropOptions = {}): DragDropState & {
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  reset: () => void;
} {
  const { onFilesDropped, enabled = true } = options;
  const [isDragging, setIsDragging] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!enabled) return;
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [enabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!enabled) return;
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, [enabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!enabled) return;

    setIsDragging(false);
    setIsDropping(true);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    setDroppedFiles(files);

    if (onFilesDropped && files.length > 0) {
      onFilesDropped(files);
    }

    // Reset dropping state after animation
    setTimeout(() => setIsDropping(false), 1500);
  }, [enabled, onFilesDropped]);

  const reset = useCallback(() => {
    setIsDragging(false);
    setIsDropping(false);
    setDroppedFiles([]);
    dragCounter.current = 0;
  }, []);

  // Prevent default browser behavior for drag events on window
  useEffect(() => {
    if (!enabled) return;
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, [enabled]);

  return {
    isDragging,
    isDropping,
    droppedFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    reset,
  };
}
