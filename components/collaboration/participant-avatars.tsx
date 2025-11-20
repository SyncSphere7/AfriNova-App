/**
 * Participant Avatars Component
 * 
 * Displays avatars of all active participants with:
 * - Live presence indicators
 * - Typing indicators
 * - Color-coded borders
 * - Hover tooltips with user info
 * 
 * @author AfriNova CTO
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CollaborationUser } from '@/lib/services/collaboration';
import { cn } from '@/lib/utils';

interface ParticipantAvatarsProps {
  participants: CollaborationUser[];
  currentUserId: string;
  maxVisible?: number;
}

export function ParticipantAvatars({
  participants,
  currentUserId,
  maxVisible = 5,
}: ParticipantAvatarsProps) {
  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {visible.map((participant) => {
            const isCurrentUser = participant.id === currentUserId;
            const initials = participant.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Tooltip key={participant.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar
                      className={cn(
                        'border-2 transition-all hover:z-10 hover:scale-110',
                        isCurrentUser && 'ring-2 ring-primary ring-offset-2'
                      )}
                      style={{ borderColor: participant.color }}
                    >
                      <AvatarImage src={participant.avatar_url} alt={participant.name} />
                      <AvatarFallback
                        className="text-xs font-pixel"
                        style={{
                          backgroundColor: `${participant.color}20`,
                          color: participant.color,
                        }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Typing indicator */}
                    {participant.isTyping && (
                      <div
                        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background"
                        style={{ backgroundColor: participant.color }}
                      >
                        <div className="flex gap-0.5">
                          <div
                            className="h-1 w-1 animate-bounce rounded-full bg-background"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="h-1 w-1 animate-bounce rounded-full bg-background"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="h-1 w-1 animate-bounce rounded-full bg-background"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Online indicator */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-pixel">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">
                      {participant.name}
                      {isCurrentUser && ' (You)'}
                    </div>
                    {participant.isTyping && (
                      <div className="text-xs text-muted-foreground">Typing...</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Active {getRelativeTime(participant.lastActive)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {overflow > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-muted-foreground">
                  <AvatarFallback className="bg-muted font-pixel text-xs">
                    +{overflow}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-pixel">
                {overflow} more {overflow === 1 ? 'participant' : 'participants'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Badge variant="secondary" className="font-pixel text-xs">
          {participants.length} {participants.length === 1 ? 'User' : 'Users'} Online
        </Badge>
      </div>
    </TooltipProvider>
  );
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
