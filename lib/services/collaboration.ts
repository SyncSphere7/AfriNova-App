/**
 * Collaboration Service
 * 
 * Real-time collaboration using Supabase Realtime for:
 * - Room presence (who's in the room)
 * - Live cursors (where everyone is typing)
 * - Code synchronization (operational transformation)
 * - AI suggestion broadcasting
 * - Voice chat signaling (WebRTC)
 * 
 * @author AfriNova CTO
 * @date 2024-11-21
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ==================== TYPES ====================

export interface CollaborationUser {
  id: string;
  name: string;
  avatar_url?: string;
  color: string;
  cursor?: CursorPosition;
  isTyping: boolean;
  lastActive: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface CodeChange {
  userId: string;
  userName: string;
  timestamp: string;
  operation: 'insert' | 'delete' | 'replace';
  position: { line: number; column: number };
  text: string;
  oldText?: string;
}

export interface AISuggestion {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  code: string;
  description: string;
  language: string;
  votes: {
    accept: string[]; // user IDs
    reject: string[]; // user IDs
  };
  status: 'pending' | 'accepted' | 'rejected';
}

export interface VoiceSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  payload: any;
}

export interface RoomActivity {
  type: 'join' | 'leave' | 'typing' | 'stopped-typing' | 'cursor-move' | 'code-change' | 'ai-suggestion' | 'voice-start' | 'voice-end';
  userId: string;
  userName: string;
  timestamp: string;
  data?: any;
}

// ==================== COLLABORATION SERVICE ====================

export class CollaborationService {
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private currentUser: CollaborationUser;
  private participants: Map<string, CollaborationUser> = new Map();
  
  // Callbacks
  private onParticipantsChange?: (participants: CollaborationUser[]) => void;
  private onCodeChange?: (change: CodeChange) => void;
  private onCursorMove?: (userId: string, cursor: CursorPosition) => void;
  private onAISuggestion?: (suggestion: AISuggestion) => void;
  private onVoiceSignal?: (signal: VoiceSignal) => void;
  private onActivity?: (activity: RoomActivity) => void;

  constructor(
    roomId: string,
    user: { id: string; name: string; avatar_url?: string }
  ) {
    this.roomId = roomId;
    this.currentUser = {
      ...user,
      color: this.generateUserColor(user.id),
      isTyping: false,
      lastActive: new Date().toISOString(),
    };
  }

  // ==================== ROOM MANAGEMENT ====================

  /**
   * Join a collaboration room
   */
  async join(): Promise<void> {
    // Create Supabase Realtime channel for this room
    this.channel = this.supabase.channel(`collaboration:${this.roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: this.currentUser.id },
      },
    });

    // Track presence (who's online)
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel!.presenceState();
        this.updateParticipants(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const user = newPresences[0] as unknown as CollaborationUser;
        this.addActivity({
          type: 'join',
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const user = leftPresences[0] as unknown as CollaborationUser;
        this.addActivity({
          type: 'leave',
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        });
      });

    // Listen to broadcasts (code changes, cursors, AI suggestions)
    this.channel
      .on('broadcast', { event: 'code-change' }, ({ payload }) => {
        this.handleCodeChange(payload as CodeChange);
      })
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        this.handleCursorMove(payload);
      })
      .on('broadcast', { event: 'typing-start' }, ({ payload }) => {
        this.handleTypingStart(payload.userId);
      })
      .on('broadcast', { event: 'typing-stop' }, ({ payload }) => {
        this.handleTypingStop(payload.userId);
      })
      .on('broadcast', { event: 'ai-suggestion' }, ({ payload }) => {
        this.handleAISuggestion(payload as AISuggestion);
      })
      .on('broadcast', { event: 'ai-vote' }, ({ payload }) => {
        this.handleAIVote(payload);
      })
      .on('broadcast', { event: 'voice-signal' }, ({ payload }) => {
        this.handleVoiceSignal(payload as VoiceSignal);
      });

    // Subscribe to channel
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track my presence
        await this.channel!.track(this.currentUser);
        
        // Save room join to database
        await this.saveRoomJoin();
      }
    });
  }

  /**
   * Leave the collaboration room
   */
  async leave(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }

    // Update last_active in database
    await this.saveRoomLeave();
  }

  // ==================== CODE SYNCHRONIZATION ====================

  /**
   * Broadcast code change to all participants
   */
  async broadcastCodeChange(change: CodeChange): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'code-change',
      payload: {
        ...change,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        timestamp: new Date().toISOString(),
      },
    });

    // Save to database for history
    await this.saveCodeChange(change);
  }

  /**
   * Handle incoming code change from another user
   */
  private handleCodeChange(change: CodeChange): void {
    // Don't process own changes
    if (change.userId === this.currentUser.id) return;

    this.onCodeChange?.(change);

    this.addActivity({
      type: 'code-change',
      userId: change.userId,
      userName: change.userName,
      timestamp: change.timestamp,
      data: { operation: change.operation, text: change.text },
    });
  }

  // ==================== CURSOR TRACKING ====================

  /**
   * Broadcast cursor position
   */
  async broadcastCursor(cursor: CursorPosition): Promise<void> {
    if (!this.channel) return;

    this.currentUser.cursor = cursor;

    await this.channel.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: {
        userId: this.currentUser.id,
        cursor,
      },
    });

    // Update presence
    await this.channel.track(this.currentUser);
  }

  /**
   * Handle cursor move from another user
   */
  private handleCursorMove(payload: { userId: string; cursor: CursorPosition }): void {
    if (payload.userId === this.currentUser.id) return;

    const participant = this.participants.get(payload.userId);
    if (participant) {
      participant.cursor = payload.cursor;
      this.participants.set(payload.userId, participant);
      this.notifyParticipantsChange();
    }

    this.onCursorMove?.(payload.userId, payload.cursor);
  }

  // ==================== TYPING INDICATORS ====================

  /**
   * Broadcast typing started
   */
  async startTyping(): Promise<void> {
    if (!this.channel || this.currentUser.isTyping) return;

    this.currentUser.isTyping = true;

    await this.channel.send({
      type: 'broadcast',
      event: 'typing-start',
      payload: { userId: this.currentUser.id },
    });

    await this.channel.track(this.currentUser);
  }

  /**
   * Broadcast typing stopped
   */
  async stopTyping(): Promise<void> {
    if (!this.channel || !this.currentUser.isTyping) return;

    this.currentUser.isTyping = false;

    await this.channel.send({
      type: 'broadcast',
      event: 'typing-stop',
      payload: { userId: this.currentUser.id },
    });

    await this.channel.track(this.currentUser);
  }

  /**
   * Handle typing start from another user
   */
  private handleTypingStart(userId: string): void {
    if (userId === this.currentUser.id) return;

    const participant = this.participants.get(userId);
    if (participant) {
      participant.isTyping = true;
      this.participants.set(userId, participant);
      this.notifyParticipantsChange();

      this.addActivity({
        type: 'typing',
        userId: participant.id,
        userName: participant.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle typing stop from another user
   */
  private handleTypingStop(userId: string): void {
    if (userId === this.currentUser.id) return;

    const participant = this.participants.get(userId);
    if (participant) {
      participant.isTyping = false;
      this.participants.set(userId, participant);
      this.notifyParticipantsChange();

      this.addActivity({
        type: 'stopped-typing',
        userId: participant.id,
        userName: participant.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==================== AI SUGGESTIONS ====================

  /**
   * Broadcast AI suggestion to all participants
   */
  async broadcastAISuggestion(suggestion: Omit<AISuggestion, 'id' | 'userId' | 'userName' | 'timestamp' | 'votes' | 'status'>): Promise<void> {
    if (!this.channel) return;

    const fullSuggestion: AISuggestion = {
      ...suggestion,
      id: crypto.randomUUID(),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      timestamp: new Date().toISOString(),
      votes: { accept: [], reject: [] },
      status: 'pending',
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'ai-suggestion',
      payload: fullSuggestion,
    });

    // Save to database
    await this.saveAISuggestion(fullSuggestion);
  }

  /**
   * Vote on an AI suggestion
   */
  async voteOnAISuggestion(suggestionId: string, vote: 'accept' | 'reject'): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'ai-vote',
      payload: {
        suggestionId,
        userId: this.currentUser.id,
        vote,
      },
    });
  }

  /**
   * Handle AI suggestion from another user
   */
  private handleAISuggestion(suggestion: AISuggestion): void {
    this.onAISuggestion?.(suggestion);

    this.addActivity({
      type: 'ai-suggestion',
      userId: suggestion.userId,
      userName: suggestion.userName,
      timestamp: suggestion.timestamp,
      data: { description: suggestion.description },
    });
  }

  /**
   * Handle AI vote from another user
   */
  private handleAIVote(payload: { suggestionId: string; userId: string; vote: 'accept' | 'reject' }): void {
    // Notify callback to update UI
    // Implementation depends on how suggestions are stored in UI
  }

  // ==================== VOICE CHAT (WebRTC) ====================

  /**
   * Send WebRTC signaling message
   */
  async sendVoiceSignal(signal: Omit<VoiceSignal, 'from'>): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'voice-signal',
      payload: {
        ...signal,
        from: this.currentUser.id,
      },
    });
  }

  /**
   * Handle voice signal from another user
   */
  private handleVoiceSignal(signal: VoiceSignal): void {
    // Only process signals meant for me
    if (signal.to === this.currentUser.id) {
      this.onVoiceSignal?.(signal);
    }
  }

  // ==================== PRESENCE & PARTICIPANTS ====================

  /**
   * Update participants list from presence state
   */
  private updateParticipants(state: Record<string, any[]>): void {
    this.participants.clear();

    Object.values(state).forEach((presences) => {
      presences.forEach((presence) => {
        const user = presence as CollaborationUser;
        if (user.id !== this.currentUser.id) {
          this.participants.set(user.id, user);
        }
      });
    });

    this.notifyParticipantsChange();
  }

  /**
   * Get list of all participants (including self)
   */
  getParticipants(): CollaborationUser[] {
    return [this.currentUser, ...Array.from(this.participants.values())];
  }

  /**
   * Notify listeners of participants change
   */
  private notifyParticipantsChange(): void {
    this.onParticipantsChange?.(this.getParticipants());
  }

  // ==================== ACTIVITY FEED ====================

  /**
   * Add activity to feed
   */
  private addActivity(activity: RoomActivity): void {
    this.onActivity?.(activity);
  }

  // ==================== CALLBACKS ====================

  setOnParticipantsChange(callback: (participants: CollaborationUser[]) => void): void {
    this.onParticipantsChange = callback;
  }

  setOnCodeChange(callback: (change: CodeChange) => void): void {
    this.onCodeChange = callback;
  }

  setOnCursorMove(callback: (userId: string, cursor: CursorPosition) => void): void {
    this.onCursorMove = callback;
  }

  setOnAISuggestion(callback: (suggestion: AISuggestion) => void): void {
    this.onAISuggestion = callback;
  }

  setOnVoiceSignal(callback: (signal: VoiceSignal) => void): void {
    this.onVoiceSignal = callback;
  }

  setOnActivity(callback: (activity: RoomActivity) => void): void {
    this.onActivity = callback;
  }

  // ==================== DATABASE PERSISTENCE ====================

  /**
   * Save room join to database
   */
  private async saveRoomJoin(): Promise<void> {
    try {
      // Check if room exists
      const { data: room } = await this.supabase
        .from('collaboration_rooms')
        .select('id')
        .eq('id', this.roomId)
        .maybeSingle();

      if (!room) {
        // Create room if it doesn't exist
        await this.supabase.from('collaboration_rooms').insert({
          id: this.roomId,
          name: `Collaboration Room ${this.roomId.slice(0, 8)}`,
          created_by: this.currentUser.id,
        });
      }

      // Add participant
      await this.supabase.from('room_participants').upsert({
        room_id: this.roomId,
        user_id: this.currentUser.id,
        user_name: this.currentUser.name,
        user_avatar: this.currentUser.avatar_url,
        user_color: this.currentUser.color,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Collaboration] Failed to save room join:', error);
    }
  }

  /**
   * Save room leave to database
   */
  private async saveRoomLeave(): Promise<void> {
    try {
      await this.supabase
        .from('room_participants')
        .update({ last_active: new Date().toISOString() })
        .eq('room_id', this.roomId)
        .eq('user_id', this.currentUser.id);
    } catch (error) {
      console.error('[Collaboration] Failed to save room leave:', error);
    }
  }

  /**
   * Save code change to database
   */
  private async saveCodeChange(change: CodeChange): Promise<void> {
    try {
      await this.supabase.from('shared_code').insert({
        room_id: this.roomId,
        user_id: this.currentUser.id,
        operation: change.operation,
        position: change.position,
        text: change.text,
        old_text: change.oldText,
      });
    } catch (error) {
      console.error('[Collaboration] Failed to save code change:', error);
    }
  }

  /**
   * Save AI suggestion to database
   */
  private async saveAISuggestion(suggestion: AISuggestion): Promise<void> {
    try {
      await this.supabase.from('ai_suggestions').insert({
        id: suggestion.id,
        room_id: this.roomId,
        user_id: suggestion.userId,
        code: suggestion.code,
        description: suggestion.description,
        language: suggestion.language,
      });
    } catch (error) {
      console.error('[Collaboration] Failed to save AI suggestion:', error);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate consistent color for user based on their ID
   */
  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C1A0',
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a new collaboration room
 */
export async function createCollaborationRoom(
  name: string,
  code?: string
): Promise<{ roomId: string; shareLink: string }> {
  const supabase = createClient();
  const roomId = crypto.randomUUID();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  await supabase.from('collaboration_rooms').insert({
    id: roomId,
    name,
    created_by: user.id,
    code,
  });

  const shareLink = `${window.location.origin}/collab/${roomId}`;

  return { roomId, shareLink };
}

/**
 * Get room details
 */
export async function getCollaborationRoom(roomId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collaboration_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * List user's collaboration rooms
 */
export async function listCollaborationRooms() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('collaboration_rooms')
    .select('*, room_participants(count)')
    .or(`created_by.eq.${user.id},room_participants.user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}
