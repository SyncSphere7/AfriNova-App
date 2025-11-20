/**
 * Live Cursors Component
 * 
 * Displays real-time cursor positions of all participants
 * with color-coded indicators and user names.
 * 
 * Overlays on Monaco Editor to show where others are editing.
 * 
 * @author AfriNova CTO
 */

'use client';

import { useEffect, useState } from 'react';
import type { CollaborationUser, CursorPosition } from '@/lib/services/collaboration';
import { cn } from '@/lib/utils';

interface LiveCursorsProps {
  participants: CollaborationUser[];
  currentUserId: string;
  editorRef?: React.RefObject<any>; // Monaco editor ref
}

interface CursorDisplay extends CollaborationUser {
  pixelPosition: { x: number; y: number };
}

export function LiveCursors({ participants, currentUserId, editorRef }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<CursorDisplay[]>([]);

  useEffect(() => {
    if (!editorRef?.current) return;

    const editor = editorRef.current;

    // Convert line/column positions to pixel coordinates
    const updatedCursors = participants
      .filter((p) => p.id !== currentUserId && p.cursor)
      .map((p) => {
        const position = editor.getTargetAtClientPoint(
          p.cursor!.line,
          p.cursor!.column
        );

        return {
          ...p,
          pixelPosition: position || { x: 0, y: 0 },
        };
      });

    setCursors(updatedCursors);
  }, [participants, currentUserId, editorRef]);

  if (!cursors.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${cursor.pixelPosition.x}px`,
            top: `${cursor.pixelPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {/* Cursor indicator */}
          <div
            className="relative h-5 w-0.5"
            style={{ backgroundColor: cursor.color }}
          >
            {/* User label */}
            <div
              className="absolute -top-6 left-1 whitespace-nowrap rounded px-2 py-1 text-xs font-pixel text-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
              {cursor.isTyping && (
                <span className="ml-1 inline-block animate-pulse">✎</span>
              )}
            </div>

            {/* Selection highlight (if any) */}
            {cursor.cursor?.selection && (
              <div
                className="absolute top-0 left-0 opacity-30"
                style={{
                  backgroundColor: cursor.color,
                  width: '200px', // Approximate, would need proper calculation
                  height: '20px',
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Simplified version for non-editor views
 */
export function SimpleLiveCursors({
  participants,
  currentUserId,
}: Omit<LiveCursorsProps, 'editorRef'>) {
  const activeCursors = participants.filter(
    (p) => p.id !== currentUserId && p.cursor
  );

  if (!activeCursors.length) return null;

  return (
    <div className="flex items-center gap-2">
      {activeCursors.map((cursor) => (
        <div
          key={cursor.id}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-pixel text-white"
          style={{ backgroundColor: cursor.color }}
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {cursor.name}
          {cursor.isTyping && ' ✎'}
        </div>
      ))}
    </div>
  );
}
