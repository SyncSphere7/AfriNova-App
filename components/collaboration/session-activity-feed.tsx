/**
 * Session Activity Feed Component
 * 
 * Real-time feed of collaboration room activities:
 * - User joins/leaves
 * - Code changes
 * - AI suggestions
 * - Typing indicators
 * - Voice chat events
 * 
 * @author AfriNova CTO
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  UserMinus,
  Code,
  Sparkles,
  MessageSquare,
  Mic,
  MicOff,
} from 'lucide-react';
import type { RoomActivity } from '@/lib/services/collaboration';
import { cn } from '@/lib/utils';

interface SessionActivityFeedProps {
  maxItems?: number;
}

export function SessionActivityFeed({ maxItems = 50 }: SessionActivityFeedProps) {
  const [activities, setActivities] = useState<RoomActivity[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addActivity = (activity: RoomActivity) => {
    setActivities((prev) => {
      const updated = [activity, ...prev].slice(0, maxItems);
      return updated;
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // Expose method for parent components to add activities
  useEffect(() => {
    // Store reference for external use
    (window as any).__addCollaborationActivity = addActivity;

    return () => {
      delete (window as any).__addCollaborationActivity;
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-foreground bg-muted p-3">
        <h3 className="font-pixel text-sm uppercase">Activity Feed</h3>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No activity yet
            </div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem key={`${activity.timestamp}-${index}`} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RoomActivity }) {
  const icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.type);
  const message = getActivityMessage(activity);

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded border-l-4 bg-muted/50 p-2 text-sm',
        `border-l-${color}-500`
      )}
    >
      <div className={cn('mt-0.5 rounded-full p-1', `bg-${color}-100`)}>
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-pixel text-xs">
            <strong>{activity.userName}</strong> {message}
          </span>
          <Badge variant="outline" className="text-xs">
            {getRelativeTime(activity.timestamp)}
          </Badge>
        </div>

        {activity.data && (
          <div className="mt-1 text-xs text-muted-foreground">
            {renderActivityData(activity)}
          </div>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: RoomActivity['type']) {
  const iconClass = 'h-3 w-3';

  switch (type) {
    case 'join':
      return <UserPlus className={iconClass} />;
    case 'leave':
      return <UserMinus className={iconClass} />;
    case 'code-change':
      return <Code className={iconClass} />;
    case 'ai-suggestion':
      return <Sparkles className={iconClass} />;
    case 'typing':
    case 'stopped-typing':
      return <MessageSquare className={iconClass} />;
    case 'voice-start':
      return <Mic className={iconClass} />;
    case 'voice-end':
      return <MicOff className={iconClass} />;
    default:
      return <Code className={iconClass} />;
  }
}

function getActivityColor(type: RoomActivity['type']): string {
  switch (type) {
    case 'join':
      return 'green';
    case 'leave':
      return 'red';
    case 'code-change':
      return 'blue';
    case 'ai-suggestion':
      return 'purple';
    case 'typing':
      return 'yellow';
    case 'voice-start':
      return 'indigo';
    case 'voice-end':
      return 'gray';
    default:
      return 'gray';
  }
}

function getActivityMessage(activity: RoomActivity): string {
  switch (activity.type) {
    case 'join':
      return 'joined the room';
    case 'leave':
      return 'left the room';
    case 'code-change':
      return `made a code change (${activity.data?.operation})`;
    case 'ai-suggestion':
      return 'suggested AI code';
    case 'typing':
      return 'is typing...';
    case 'stopped-typing':
      return 'stopped typing';
    case 'cursor-move':
      return 'moved cursor';
    case 'voice-start':
      return 'started voice chat';
    case 'voice-end':
      return 'ended voice chat';
    default:
      return 'performed an action';
  }
}

function renderActivityData(activity: RoomActivity) {
  if (!activity.data) return null;

  switch (activity.type) {
    case 'code-change':
      return (
        <code className="rounded bg-background px-1 py-0.5">
          {activity.data.text || '(empty)'}
        </code>
      );
    case 'ai-suggestion':
      return <div>{activity.data.description}</div>;
    default:
      return null;
  }
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
