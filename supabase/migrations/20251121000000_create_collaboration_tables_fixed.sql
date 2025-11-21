/*
  # Create Collaboration Tables for Real-Time Pair Programming
  Fixed version: Create all tables first, then add cross-referencing RLS policies
*/

-- ==================== CREATE ALL TABLES FIRST ====================

CREATE TABLE IF NOT EXISTS public.collaboration_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code text,
  language text DEFAULT 'typescript',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.shared_code (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  operation text NOT NULL CHECK (operation IN ('insert', 'delete', 'replace')),
  position jsonb NOT NULL,
  text text NOT NULL,
  old_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX IF NOT EXISTS collaboration_rooms_created_by_idx ON public.collaboration_rooms(created_by);
CREATE INDEX IF NOT EXISTS room_participants_room_id_idx ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS room_participants_user_id_idx ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS room_participants_last_active_idx ON public.room_participants(last_active);
CREATE INDEX IF NOT EXISTS shared_code_room_id_idx ON public.shared_code(room_id);
CREATE INDEX IF NOT EXISTS shared_code_created_at_idx ON public.shared_code(created_at);
CREATE INDEX IF NOT EXISTS ai_suggestions_room_id_idx ON public.ai_suggestions(room_id);
CREATE INDEX IF NOT EXISTS ai_suggestions_status_idx ON public.ai_suggestions(status);
CREATE INDEX IF NOT EXISTS ai_suggestions_created_at_idx ON public.ai_suggestions(created_at);

-- ==================== ENABLE RLS ====================

ALTER TABLE public.collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES FOR COLLABORATION_ROOMS ====================

CREATE POLICY "Users can create collaboration rooms"
  ON public.collaboration_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update their rooms"
  ON public.collaboration_rooms
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can delete their rooms"
  ON public.collaboration_rooms
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Now room_participants table exists, so we can reference it
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

-- ==================== RLS POLICIES FOR ROOM_PARTICIPANTS ====================

CREATE POLICY "Users can join collaboration rooms"
  ON public.room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants can update their own data"
  ON public.room_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants can leave rooms"
  ON public.room_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

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

-- ==================== RLS POLICIES FOR SHARED_CODE ====================

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

-- ==================== RLS POLICIES FOR AI_SUGGESTIONS ====================

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

-- ==================== TRIGGERS ====================

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
