/*
  # Create Collaboration Tables for Real-Time Pair Programming

  1. New Tables
    - `collaboration_rooms`
      - `id` (uuid, primary key)
      - `name` (text) - Room name
      - `created_by` (uuid) - User who created room
      - `code` (text) - Optional initial code
      - `language` (text) - Programming language
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `room_participants`
      - `room_id` (uuid, references collaboration_rooms)
      - `user_id` (uuid, references profiles)
      - `user_name` (text) - Cached user name
      - `user_avatar` (text) - Cached avatar URL
      - `user_color` (text) - Assigned color for cursors
      - `joined_at` (timestamptz)
      - `last_active` (timestamptz)
      Primary key: (room_id, user_id)
    
    - `shared_code`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references collaboration_rooms)
      - `user_id` (uuid, references profiles)
      - `operation` (text) - insert, delete, replace
      - `position` (jsonb) - { line, column }
      - `text` (text) - Changed text
      - `old_text` (text) - Previous text (for undo)
      - `created_at` (timestamptz)
    
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references collaboration_rooms)
      - `user_id` (uuid, references profiles)
      - `code` (text) - Suggested code
      - `description` (text) - What it does
      - `language` (text) - Programming language
      - `votes_accept` (text[]) - User IDs who accepted
      - `votes_reject` (text[]) - User IDs who rejected
      - `status` (text) - pending, accepted, rejected
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Room creators can manage rooms
    - Participants can read/write in their rooms
    - Public can view room list (not code)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== COLLABORATION ROOMS ====================

CREATE TABLE IF NOT EXISTS public.collaboration_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code text,
  language text DEFAULT 'typescript',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.collaboration_rooms ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can create rooms
CREATE POLICY "Users can create collaboration rooms"
  ON public.collaboration_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Room creators can update their rooms
CREATE POLICY "Room creators can update their rooms"
  ON public.collaboration_rooms
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Room creators can delete their rooms
CREATE POLICY "Room creators can delete their rooms"
  ON public.collaboration_rooms
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Participants can view rooms they're in
CREATE POLICY "Participants can view their rooms"
  ON public.collaboration_rooms
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_collaboration_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collaboration_rooms_updated_at
  BEFORE UPDATE ON public.collaboration_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_collaboration_rooms_updated_at();

-- ==================== ROOM PARTICIPANTS ====================

CREATE TABLE IF NOT EXISTS public.room_participants (
  room_id uuid REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  user_avatar text,
  user_color text NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  last_active timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Policies: Participants can join rooms
CREATE POLICY "Users can join collaboration rooms"
  ON public.room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Participants can update their own data
CREATE POLICY "Participants can update their own data"
  ON public.room_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Participants can leave rooms
CREATE POLICY "Participants can leave rooms"
  ON public.room_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Participants can view other participants in same room
CREATE POLICY "Participants can view room members"
  ON public.room_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants AS rp
      WHERE rp.room_id = room_id AND rp.user_id = auth.uid()
    )
  );

-- ==================== SHARED CODE ====================

CREATE TABLE IF NOT EXISTS public.shared_code (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  operation text NOT NULL CHECK (operation IN ('insert', 'delete', 'replace')),
  position jsonb NOT NULL,
  text text NOT NULL,
  old_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.shared_code ENABLE ROW LEVEL SECURITY;

-- Policies: Participants can add code changes
CREATE POLICY "Participants can add code changes"
  ON public.shared_code
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = shared_code.room_id AND user_id = auth.uid()
    )
  );

-- Participants can view code changes in their rooms
CREATE POLICY "Participants can view code changes"
  ON public.shared_code
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = shared_code.room_id AND user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS shared_code_room_id_idx ON public.shared_code(room_id);
CREATE INDEX IF NOT EXISTS shared_code_created_at_idx ON public.shared_code(created_at);

-- ==================== AI SUGGESTIONS ====================

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  language text NOT NULL,
  votes_accept text[] DEFAULT ARRAY[]::text[],
  votes_reject text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies: Participants can add AI suggestions
CREATE POLICY "Participants can add AI suggestions"
  ON public.ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = ai_suggestions.room_id AND user_id = auth.uid()
    )
  );

-- Participants can update suggestions (voting)
CREATE POLICY "Participants can vote on AI suggestions"
  ON public.ai_suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = ai_suggestions.room_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = ai_suggestions.room_id AND user_id = auth.uid()
    )
  );

-- Participants can view AI suggestions in their rooms
CREATE POLICY "Participants can view AI suggestions"
  ON public.ai_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = ai_suggestions.room_id AND user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS ai_suggestions_room_id_idx ON public.ai_suggestions(room_id);
CREATE INDEX IF NOT EXISTS ai_suggestions_status_idx ON public.ai_suggestions(status);
CREATE INDEX IF NOT EXISTS ai_suggestions_created_at_idx ON public.ai_suggestions(created_at);

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX IF NOT EXISTS collaboration_rooms_created_by_idx ON public.collaboration_rooms(created_by);
CREATE INDEX IF NOT EXISTS room_participants_room_id_idx ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS room_participants_user_id_idx ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS room_participants_last_active_idx ON public.room_participants(last_active);
