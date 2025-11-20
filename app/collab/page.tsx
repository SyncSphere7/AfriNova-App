/**
 * Collaboration Hub Page
 * 
 * - List all collaboration rooms
 * - Create new rooms
 * - Join existing rooms
 * 
 * @author AfriNova CTO
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { RoomList } from '@/components/collaboration/room-list';
import { createCollaborationRoom } from '@/lib/services/collaboration';
import { Plus, Users, Code, Sparkles } from 'lucide-react';

export default function CollaborationHubPage() {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [roomName, setRoomName] = useState('');
  const [initialCode, setInitialCode] = useState('');
  const [language, setLanguage] = useState('typescript');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      setLoading(true);

      const { roomId } = await createCollaborationRoom(
        roomName,
        initialCode || undefined
      );

      // Navigate to room
      router.push(`/collab/${roomId}`);
    } catch (err: any) {
      console.error('[Create Room] Failed:', err);
      alert('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-pixel text-4xl uppercase">Collaboration Rooms</h1>
        <p className="text-muted-foreground">
          Code together in real-time with AI assistance
        </p>
      </div>

      {/* Features Banner */}
      <Card className="mb-8 border-primary">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-pixel text-sm uppercase">Real-Time Sync</h3>
                <p className="text-xs text-muted-foreground">
                  See everyone's cursors and edits instantly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-pixel text-sm uppercase">AI Assistance</h3>
                <p className="text-xs text-muted-foreground">
                  Generate code together with AI agents
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-pixel text-sm uppercase">Voice Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Talk while you code with built-in voice
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Room Button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-pixel text-2xl uppercase">Your Rooms</h2>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="font-pixel">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-pixel">Create Collaboration Room</DialogTitle>
              <DialogDescription>
                Start a new room to code with others in real-time
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Room Name */}
              <div>
                <Label htmlFor="room-name" className="font-pixel">
                  Room Name *
                </Label>
                <Input
                  id="room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Build React Dashboard"
                  className="mt-1"
                />
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language" className="font-pixel">
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Code */}
              <div>
                <Label htmlFor="initial-code" className="font-pixel">
                  Initial Code (Optional)
                </Label>
                <Textarea
                  id="initial-code"
                  value={initialCode}
                  onChange={(e) => setInitialCode(e.target.value)}
                  placeholder="// Start with some code..."
                  rows={6}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateRoom}
                disabled={loading || !roomName.trim()}
                className="w-full font-pixel"
              >
                {loading ? 'Creating...' : 'Create & Join Room'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room List */}
      <RoomList />

      {/* Competitive Advantage */}
      <Card className="mt-8 border-2 border-dashed">
        <CardHeader>
          <CardTitle className="font-pixel text-lg uppercase">
            🚀 Industry First!
          </CardTitle>
          <CardDescription>
            NO competitor has real-time collaboration with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-pixel">GitHub Copilot</h4>
              <p className="text-muted-foreground">
                ❌ No real-time collaboration<br />
                ❌ No voice chat<br />
                ❌ Single user only
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-pixel">Cursor</h4>
              <p className="text-muted-foreground">
                ❌ No live cursors<br />
                ❌ No presence tracking<br />
                ❌ No shared AI sessions
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-pixel">Replit</h4>
              <p className="text-muted-foreground">
                ⚠️ Limited collaboration<br />
                ❌ No AI in collaboration<br />
                ❌ No voice chat
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-pixel text-primary">AfriNova</h4>
              <p className="font-semibold text-primary">
                ✅ Real-time collaboration<br />
                ✅ AI for all participants<br />
                ✅ Built-in voice chat<br />
                ✅ Live cursors & typing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
