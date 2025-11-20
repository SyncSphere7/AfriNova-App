/**
 * Learning Service
 * 
 * Gamified education system with:
 * - XP calculation and leveling
 * - Achievement unlocking
 * - Progress tracking
 * - Certificate generation
 * - Leaderboard management
 * 
 * @author AfriNova CTO
 */

import { createClient } from '@/lib/supabase/client';

// ==================== TYPES ====================

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  estimated_hours: number;
  xp_reward: number;
  icon: string;
  is_published: boolean;
  order_index: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  content: string;
  type: 'tutorial' | 'challenge' | 'quiz';
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
}

export interface Challenge {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  starter_code: string;
  solution_code: string;
  test_cases: TestCase[];
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestCase {
  input: string;
  expected: string;
  description: string;
}

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  time_spent_seconds: number;
  attempts: number;
  code_submitted?: string;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'mastery' | 'speed' | 'special';
  xp_reward: number;
  criteria: Record<string, any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  achievement: Achievement;
  unlocked_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  completed_in_hours: number;
  final_score: number;
}

export interface LeaderboardEntry {
  user_id: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  courses_completed: number;
  challenges_solved: number;
  rank: number;
}

// ==================== XP & LEVELING ====================

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100))
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) ** 2 * 100;
}

/**
 * Calculate XP progress to next level
 */
export function xpProgress(currentXp: number): {
  currentLevel: number;
  nextLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(currentXp);
  const nextLevel = currentLevel + 1;
  const xpForCurrentLevel = currentLevel ** 2 * 100;
  const xpForNext = xpForNextLevel(currentLevel);
  const xpInLevel = currentXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNext - xpForCurrentLevel;
  const progressPercentage = (xpInLevel / xpNeededForLevel) * 100;

  return {
    currentLevel,
    nextLevel,
    xpForCurrentLevel,
    xpForNextLevel: xpForNext,
    progressPercentage,
  };
}

// ==================== COURSES ====================

/**
 * Get all published courses
 */
export async function getCourses(): Promise<Course[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('order_index');

  if (error) throw error;

  return data as Course[];
}

/**
 * Get course by slug
 */
export async function getCourse(slug: string): Promise<Course> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return data as Course;
}

/**
 * Get course with lessons and progress
 */
export async function getCourseWithProgress(
  courseId: string,
  userId: string
): Promise<{
  course: Course;
  lessons: (Lesson & { progress?: UserProgress })[];
  totalXp: number;
  completedCount: number;
}> {
  const supabase = createClient();

  // Get course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  // Get lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  if (lessonsError) throw lessonsError;

  // Get progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .in(
      'lesson_id',
      lessons.map((l) => l.id)
    );

  // Merge
  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    progress: progress?.find((p) => p.lesson_id === lesson.id),
  }));

  const completedCount = progress?.filter((p) => p.status === 'completed').length || 0;
  const totalXp = lessonsWithProgress
    .filter((l) => l.progress?.status === 'completed')
    .reduce((sum, l) => sum + l.xp_reward, 0);

  return {
    course: course as Course,
    lessons: lessonsWithProgress as (Lesson & { progress?: UserProgress })[],
    totalXp,
    completedCount,
  };
}

// ==================== LESSONS ====================

/**
 * Get lesson with challenge
 */
export async function getLesson(lessonId: string): Promise<{
  lesson: Lesson;
  challenge?: Challenge;
}> {
  const supabase = createClient();

  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError) throw lessonError;

  // Get challenge if lesson is type challenge
  let challenge: Challenge | undefined;
  if (lesson.type === 'challenge') {
    const { data: challengeData } = await supabase
      .from('challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    challenge = challengeData as Challenge;
  }

  return {
    lesson: lesson as Lesson,
    challenge,
  };
}

// ==================== PROGRESS TRACKING ====================

/**
 * Start a lesson
 */
export async function startLesson(lessonId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase.from('user_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    status: 'in_progress',
  });
}

/**
 * Complete a lesson and award XP
 */
export async function completeLesson(
  lessonId: string,
  timeSpentSeconds: number,
  codeSubmitted?: string
): Promise<{ xpEarned: number; newAchievements: Achievement[] }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('xp_reward')
    .eq('id', lessonId)
    .single();

  if (!lesson) throw new Error('Lesson not found');

  // Mark complete
  await supabase.from('user_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    status: 'completed',
    completed_at: new Date().toISOString(),
    time_spent_seconds: timeSpentSeconds,
    code_submitted: codeSubmitted,
  });

  // Award XP
  const xpEarned = lesson.xp_reward;
  await addXp(user.id, xpEarned);

  // Check achievements
  const newAchievements = await checkAchievements(user.id);

  return { xpEarned, newAchievements };
}

/**
 * Add XP to user and update level
 */
export async function addXp(userId: string, xp: number): Promise<void> {
  const supabase = createClient();

  // Get current XP
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('total_xp')
    .eq('user_id', userId)
    .single();

  const currentXp = leaderboard?.total_xp || 0;
  const newXp = currentXp + xp;
  const newLevel = calculateLevel(newXp);

  // Update leaderboard
  await supabase
    .from('leaderboard')
    .upsert({
      user_id: userId,
      total_xp: newXp,
      level: newLevel,
    });
}

// ==================== ACHIEVEMENTS ====================

/**
 * Check and unlock new achievements
 */
export async function checkAchievements(userId: string): Promise<Achievement[]> {
  const supabase = createClient();

  // Get user stats
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!leaderboard) return [];

  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  // Get user's unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(unlockedAchievements?.map((a) => a.achievement_id));

  // Check criteria
  const newUnlocks: Achievement[] = [];

  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    const criteria = achievement.criteria as Record<string, any>;
    let unlocked = false;

    // Check different criteria types
    if (criteria.courses_completed && leaderboard.courses_completed >= criteria.courses_completed) {
      unlocked = true;
    } else if (criteria.challenges_solved && leaderboard.challenges_solved >= criteria.challenges_solved) {
      unlocked = true;
    } else if (criteria.streak && leaderboard.current_streak >= criteria.streak) {
      unlocked = true;
    } else if (criteria.level && leaderboard.level >= criteria.level) {
      unlocked = true;
    } else if (criteria.total_xp && leaderboard.total_xp >= criteria.total_xp) {
      unlocked = true;
    }

    if (unlocked) {
      // Unlock achievement
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // Award XP
      await addXp(userId, achievement.xp_reward);

      newUnlocks.push(achievement as Achievement);
    }
  }

  return newUnlocks;
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;

  return data as any as UserAchievement[];
}

// ==================== CERTIFICATES ====================

/**
 * Generate certificate for completed course
 */
export async function generateCertificate(courseId: string): Promise<Certificate> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if course is completed
  const { lessons, completedCount } = await getCourseWithProgress(courseId, user.id);

  if (completedCount < lessons.length) {
    throw new Error('Course not completed');
  }

  // Calculate stats
  const totalTime = lessons.reduce(
    (sum, l) => sum + (l.progress?.time_spent_seconds || 0),
    0
  );
  const totalTimeHours = Math.round(totalTime / 3600);
  const finalScore = Math.round((completedCount / lessons.length) * 100);

  // Generate certificate number
  const certNumber = `AF-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  // Create certificate
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      user_id: user.id,
      course_id: courseId,
      certificate_number: certNumber,
      completed_in_hours: totalTimeHours,
      final_score: finalScore,
    })
    .select()
    .single();

  if (error) throw error;

  // Update leaderboard
  await supabase.rpc('increment', {
    table_name: 'leaderboard',
    column_name: 'courses_completed',
    user_id: user.id,
  });

  return data as Certificate;
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('certificates')
    .select('*, course:courses(*)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw error;

  return data as any as Certificate[];
}

// ==================== LEADERBOARD ====================

/**
 * Get global leaderboard
 */
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, profile:profiles(full_name, avatar_url)')
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Update ranks
  const ranked = data.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return ranked as any as LeaderboardEntry[];
}

/**
 * Get user's leaderboard stats
 */
export async function getUserStats(userId: string): Promise<LeaderboardEntry> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data as any as LeaderboardEntry;
}

// ==================== STREAKS ====================

/**
 * Update daily streak
 */
export async function updateStreak(userId: string): Promise<void> {
  const supabase = createClient();

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('current_streak, longest_streak, updated_at')
    .eq('user_id', userId)
    .single();

  if (!leaderboard) return;

  const lastUpdate = new Date(leaderboard.updated_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = leaderboard.current_streak;
  let newLongest = leaderboard.longest_streak;

  if (daysDiff === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (daysDiff > 1) {
    // Streak broken
    newStreak = 1;
  }
  // daysDiff === 0 means same day, no change

  if (newStreak > newLongest) {
    newLongest = newStreak;
  }

  await supabase
    .from('leaderboard')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
    })
    .eq('user_id', userId);
}
