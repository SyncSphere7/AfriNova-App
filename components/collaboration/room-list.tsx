/**
 * Room List Component
 * 
 * Displays list of collaboration rooms with:
 * - Active participants count
 * - Room creator
 * - Quick join button
 * - Room status indicators
 * 
 * @author AfriNova CTO
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, User, ArrowRight, Plus } from 'lucide-react';
import { listCollaborationRooms } from '@/lib/services/collaboration';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  language: string;
  room_participants: { count: number }[];
}

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await listCollaborationRooms();
      setRooms(data as Room[]);
    } catch (err: any) {
      console.error('[Room List] Failed to load rooms:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
          <Button onClick={loadRooms} className="mt-4 w-full font-pixel">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-pixel text-lg">No Rooms Yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first collaboration room to start coding with others
          </p>
          <Link href="/collab/new">
            <Button className="font-pixel">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => {
        const participantCount = room.room_participants?.[0]?.count || 0;
        const isActive = participantCount > 0;

        return (
          <Card
            key={room.id}
            className={cn(
              'transition-all hover:border-primary',
              isActive && 'border-green-500'
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="font-pixel text-lg">{room.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Created by you</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{getRelativeTime(room.created_at)}</span>
                  </CardDescription>
                </div>

                {isActive && (
                  <Badge variant="default" className="bg-green-500 font-pixel">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-pixel">
                      {participantCount} {participantCount === 1 ? 'User' : 'Users'}
                    </span>
                  </div>

                  <Badge variant="outline" className="font-mono text-xs">
                    {room.language || 'typescript'}
                  </Badge>
                </div>

                <Link href={`/collab/${room.id}`}>
                  <Button size="sm" className="font-pixel">
                    Join Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
