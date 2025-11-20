/**
 * Collaboration Room Page
 * 
 * Real-time pair programming with:
 * - Monaco code editor
 * - Live cursor tracking
 * - Code synchronization
 * - AI assistance
 * - Voice chat
 * - Activity feed
 * 
 * NO competitor has this!
 * 
 * @author AfriNova CTO
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ParticipantAvatars } from '@/components/collaboration/participant-avatars';
import { LiveCursors, SimpleLiveCursors } from '@/components/collaboration/live-cursors';
import { VoiceChatControls } from '@/components/collaboration/voice-chat-controls';
import { SessionActivityFeed } from '@/components/collaboration/session-activity-feed';
import {
  CollaborationService,
  getCollaborationRoom,
  type CollaborationUser,
  type CodeChange,
  type AISuggestion,
} from '@/lib/services/collaboration';
import { generateWithAgent } from '@/lib/openrouter/client';
import { createClient } from '@/lib/supabase/client';
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  Download,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== MONACO EDITOR (Dynamic Import) ====================
// Monaco is heavy, so we import it dynamically
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
});

// ==================== MAIN COMPONENT ====================

export default function CollaborationRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room state
  const [room, setRoom] = useState<any>(null);
  const [code, setCode] = useState('// Start coding together...\n');
  const [language, setLanguage] = useState('typescript');

  // Collaboration state
  const [collaborationService, setCollaborationService] = useState<CollaborationService | null>(null);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // UI state
  const [copied, setCopied] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);

  // Refs
  const editorRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    initialize();

    return () => {
      // Cleanup
      if (collaborationService) {
        collaborationService.leave();
      }
    };
  }, [params.roomId]);

  const initialize = async () => {
    try {
      setLoading(true);

      // Get current user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser({
        id: user.id,
        name: profile?.full_name || 'Anonymous',
        avatar_url: profile?.avatar_url,
      });

      // Load room
      const roomData = await getCollaborationRoom(params.roomId);
      setRoom(roomData);

      if (roomData.code) {
        setCode(roomData.code);
      }

      if (roomData.language) {
        setLanguage(roomData.language);
      }

      // Initialize collaboration service
      const service = new CollaborationService(params.roomId, {
        id: user.id,
        name: profile?.full_name || 'Anonymous',
        avatar_url: profile?.avatar_url,
      });

      // Setup callbacks
      service.setOnParticipantsChange((updatedParticipants) => {
        setParticipants(updatedParticipants);
      });

      service.setOnCodeChange((change) => {
        handleRemoteCodeChange(change);
      });

      service.setOnAISuggestion((suggestion) => {
        setAiSuggestions((prev) => [suggestion, ...prev]);
        
        // Add to activity feed
        if ((window as any).__addCollaborationActivity) {
          (window as any).__addCollaborationActivity({
            type: 'ai-suggestion',
            userId: suggestion.userId,
            userName: suggestion.userName,
            timestamp: suggestion.timestamp,
            data: { description: suggestion.description },
          });
        }
      });

      service.setOnActivity((activity) => {
        if ((window as any).__addCollaborationActivity) {
          (window as any).__addCollaborationActivity(activity);
        }
      });

      // Join room
      await service.join();

      setCollaborationService(service);
      setLoading(false);
    } catch (err: any) {
      console.error('[Collaboration] Failed to initialize:', err);
      setError(err.message || 'Failed to load collaboration room');
      setLoading(false);
    }
  };

  // ==================== CODE EDITOR ====================

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;

    // Track cursor movements
    editor.onDidChangeCursorPosition((e: any) => {
      if (collaborationService) {
        collaborationService.broadcastCursor({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !collaborationService) return;

    setCode(value);

    // Start typing indicator
    collaborationService.startTyping();

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      collaborationService.stopTyping();
    }, 2000);

    // Broadcast code change
    // In production, you'd implement Operational Transformation or CRDT here
    // For now, we'll do simple full-text sync
    const change: CodeChange = {
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      operation: 'replace',
      position: { line: 0, column: 0 },
      text: value,
    };

    collaborationService.broadcastCodeChange(change);
  };

  const handleRemoteCodeChange = (change: CodeChange) => {
    // Apply remote code change
    // In production, you'd use OT or CRDT to merge changes
    if (change.operation === 'replace') {
      setCode(change.text);
    }
  };

  // ==================== AI ASSISTANCE ====================

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !collaborationService) return;

    try {
      setAiLoading(true);

      // Generate code with AI
      const response = await generateWithAgent({
        agentType: 'FRONTEND', // Default to frontend, could be dynamic
        prompt: aiPrompt,
        userLanguage: 'en',
      });

      if (response.content) {
        // Create AI suggestion
        await collaborationService.broadcastAISuggestion({
          code: response.content,
          description: aiPrompt,
          language,
        });

        setAiPrompt('');
        setShowAIDialog(false);
      }
    } catch (err: any) {
      console.error('[AI] Failed to generate:', err);
      alert('Failed to generate code. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAISuggestion = async (suggestion: AISuggestion) => {
    // Insert AI suggestion into editor
    setCode((prev) => prev + '\n\n' + suggestion.code);

    // Vote accept
    if (collaborationService) {
      await collaborationService.voteOnAISuggestion(suggestion.id, 'accept');
    }

    // Remove from list
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  const handleRejectAISuggestion = async (suggestion: AISuggestion) => {
    // Vote reject
    if (collaborationService) {
      await collaborationService.voteOnAISuggestion(suggestion.id, 'reject');
    }

    // Remove from list
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  // ==================== SHARE ROOM ====================

  const handleCopyShareLink = async () => {
    const shareLink = `${window.location.origin}/collab/${params.roomId}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[Share] Failed to copy:', err);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collaboration-${params.roomId}.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push('/collab')} className="font-pixel">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rooms
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b-2 border-foreground bg-primary px-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/collab')}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="font-pixel text-lg uppercase">{room?.name}</h1>
            <SimpleLiveCursors participants={participants} currentUserId={currentUser?.id} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ParticipantAvatars
            participants={participants}
            currentUserId={currentUser?.id}
          />

          {collaborationService && (
            <VoiceChatControls
              collaborationService={collaborationService}
              participants={participants}
            />
          )}

          <Button
            onClick={handleCopyShareLink}
            variant="secondary"
            size="sm"
            className="font-pixel"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b-2 border-foreground bg-muted p-2">
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40 font-pixel">
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

            <div className="flex items-center gap-2">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="font-pixel">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Assist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-pixel">AI Code Generation</DialogTitle>
                    <DialogDescription>
                      Describe what you want to build, and AI will generate code for everyone
                    </DialogDescription>
                  </DialogHeader>

                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Create a user login form with email and password"
                    rows={4}
                    className="font-mono"
                  />

                  <Button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="font-pixel"
                  >
                    {aiLoading ? (
                      <>
                        <LoadingSpinner />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate for Everyone
                      </>
                    )}
                  </Button>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleDownloadCode}
                variant="secondary"
                size="sm"
                className="font-pixel"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Monaco Editor with Live Cursors */}
          <div className="relative flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
              }}
            />
            
            <LiveCursors
              participants={participants}
              currentUserId={currentUser?.id}
              editorRef={editorRef}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l-2 border-foreground bg-muted">
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="border-b-2 border-foreground p-4">
              <h3 className="mb-3 font-pixel text-sm uppercase">AI Suggestions</h3>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="rounded border-2 border-foreground bg-background p-2"
                  >
                    <div className="mb-2 text-xs text-muted-foreground">
                      {suggestion.userName}
                    </div>
                    <div className="mb-2 text-sm">{suggestion.description}</div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptAISuggestion(suggestion)}
                        size="sm"
                        className="flex-1 font-pixel"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectAISuggestion(suggestion)}
                        size="sm"
                        variant="destructive"
                        className="flex-1 font-pixel"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="h-full">
            <SessionActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== UTILITIES ====================

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    python: 'py',
    java: 'java',
    go: 'go',
    rust: 'rs',
    html: 'html',
    css: 'css',
  };

  return extensions[language] || 'txt';
}
