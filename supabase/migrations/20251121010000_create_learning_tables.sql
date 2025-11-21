/*
  # Create Learning System Tables - Gamified Education

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text) - Course name
      - `description` (text) - Course overview
      - `difficulty` (text) - beginner, intermediate, advanced
      - `language` (text) - programming language
      - `estimated_hours` (integer) - Time to complete
      - `xp_reward` (integer) - Total XP for completion
      - `icon` (text) - Icon name
      - `is_published` (boolean) - Live or draft
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text) - Lesson name
      - `slug` (text) - URL-friendly identifier
      - `content` (text) - Markdown content
      - `type` (text) - tutorial, challenge, quiz
      - `order_index` (integer) - Order in course
      - `xp_reward` (integer) - XP for completion
      - `estimated_minutes` (integer) - Time to complete
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `challenges`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, references lessons)
      - `title` (text) - Challenge name
      - `description` (text) - What to build
      - `starter_code` (text) - Initial code
      - `solution_code` (text) - Expected solution
      - `test_cases` (jsonb) - Array of test cases
      - `hints` (jsonb) - Array of hints
      - `difficulty` (text) - easy, medium, hard
      - `created_at` (timestamptz)
    
    - `user_progress`
      - `user_id` (uuid, references profiles)
      - `lesson_id` (uuid, references lessons)
      - `status` (text) - not_started, in_progress, completed
      - `completed_at` (timestamptz) - When completed
      - `time_spent_seconds` (integer) - Time tracking
      - `attempts` (integer) - Number of tries
      - `code_submitted` (text) - Last submitted code
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Primary key: (user_id, lesson_id)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - Identifier
      - `title` (text) - Badge name
      - `description` (text) - How to earn it
      - `icon` (text) - Icon name
      - `category` (text) - completion, streak, mastery
      - `xp_reward` (integer) - Bonus XP
      - `criteria` (jsonb) - Unlock conditions
      - `rarity` (text) - common, rare, epic, legendary
      - `created_at` (timestamptz)
    
    - `user_achievements`
      - `user_id` (uuid, references profiles)
      - `achievement_id` (uuid, references achievements)
      - `unlocked_at` (timestamptz)
      - Primary key: (user_id, achievement_id)
    
    - `certificates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `certificate_number` (text, unique) - AF-XXXX-YYYY
      - `issued_at` (timestamptz)
      - `completed_in_hours` (integer) - Time taken
      - `final_score` (integer) - Percentage
      - `created_at` (timestamptz)
    
    - `leaderboard`
      - `user_id` (uuid, references profiles, primary key)
      - `total_xp` (integer) - All-time XP
      - `level` (integer) - User level
      - `current_streak` (integer) - Days in a row
      - `longest_streak` (integer) - Best streak
      - `courses_completed` (integer) - Count
      - `challenges_solved` (integer) - Count
      - `rank` (integer) - Global rank
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read all courses/lessons
    - Users can only update their own progress
    - Leaderboard is public
*/

-- Enable UUID extension

-- ==================== COURSES ====================

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  language text NOT NULL,
  estimated_hours integer NOT NULL DEFAULT 10,
  xp_reward integer NOT NULL DEFAULT 1000,
  icon text NOT NULL DEFAULT 'Book',
  is_published boolean DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE INDEX IF NOT EXISTS courses_slug_idx ON public.courses(slug);
CREATE INDEX IF NOT EXISTS courses_difficulty_idx ON public.courses(difficulty);
CREATE INDEX IF NOT EXISTS courses_order_idx ON public.courses(order_index);

-- ==================== LESSONS ====================

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('tutorial', 'challenge', 'quiz')),
  order_index integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 100,
  estimated_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(course_id, slug)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON public.lessons(order_index);

-- ==================== CHALLENGES ====================

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  starter_code text NOT NULL,
  solution_code text NOT NULL,
  test_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS challenges_lesson_id_idx ON public.challenges(lesson_id);

-- ==================== USER PROGRESS ====================

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  attempts integer DEFAULT 0,
  code_submitted text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS user_progress_status_idx ON public.user_progress(status);

-- ==================== ACHIEVEMENTS ====================

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Award',
  category text NOT NULL CHECK (category IN ('completion', 'streak', 'mastery', 'speed', 'special')),
  xp_reward integer NOT NULL DEFAULT 500,
  criteria jsonb NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS achievements_slug_idx ON public.achievements(slug);
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements(category);

-- ==================== USER ACHIEVEMENTS ====================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view others' achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements(user_id);

-- ==================== CERTIFICATES ====================

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now() NOT NULL,
  completed_in_hours integer NOT NULL,
  final_score integer NOT NULL CHECK (final_score >= 0 AND final_score <= 100),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can verify certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_number_idx ON public.certificates(certificate_number);

-- ==================== LEADERBOARD ====================

CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  courses_completed integer DEFAULT 0,
  challenges_solved integer DEFAULT 0,
  rank integer DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard"
  ON public.leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rank"
  ON public.leaderboard FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS leaderboard_xp_idx ON public.leaderboard(total_xp DESC);
CREATE INDEX IF NOT EXISTS leaderboard_rank_idx ON public.leaderboard(rank);

-- ==================== TRIGGERS ====================

-- Update updated_at on courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

-- Update updated_at on lessons
CREATE OR REPLACE FUNCTION update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_lessons_updated_at();

-- Update updated_at on user_progress
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_updated_at();

-- Auto-create leaderboard entry for new users
CREATE OR REPLACE FUNCTION create_leaderboard_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_leaderboard_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_leaderboard_entry();
