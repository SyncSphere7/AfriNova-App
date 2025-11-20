/**
 * Course Overview Page
 * View course details, lessons, and progress
 */

import { getCourse, getCourseWithProgress } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import {
  Clock,
  Zap,
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CoursePageProps {
  params: {
    courseSlug: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get course
  let course;
  try {
    course = await getCourse(params.courseSlug);
  } catch (error) {
    notFound();
  }

  // Get lessons with progress
  const { lessons, totalXp, completedCount } = user
    ? await getCourseWithProgress(course.id, user.id)
    : {
        lessons: await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .order('order_index')
          .then((r) => r.data || []),
        totalXp: 0,
        completedCount: 0,
      };

  const completionPercentage =
    lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const difficultyColors = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Course Header */}
      <Card className="border-2 border-foreground p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{course.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={`border-2 ${difficultyColors[course.difficulty]} text-white uppercase font-pixel text-xs`}
              >
                {course.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className="border-2 uppercase font-pixel text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                {course.estimated_hours}h
              </Badge>
              <Badge
                variant="outline"
                className="border-2 uppercase font-pixel text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                {course.xp_reward} XP
              </Badge>
            </div>

            <h1 className="font-pixel text-3xl uppercase mb-3">
              {course.title}
            </h1>
            <p className="text-muted-foreground mb-4">{course.description}</p>

            {/* Progress */}
            {user && completedCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-pixel text-xs uppercase">
                    {completedCount}/{lessons.length} Lessons Complete
                  </span>
                  <span className="font-pixel text-xs">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <Progress
                  value={completionPercentage}
                  className="h-3 border-2 border-foreground"
                />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="w-3 h-3" />
                  <span>{totalXp} XP Earned</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Course Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-foreground p-4 text-center">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="font-pixel text-xl mb-1">{lessons.length}</div>
          <div className="text-xs text-muted-foreground uppercase">Lessons</div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <div className="font-pixel text-xl mb-1">{course.xp_reward}</div>
          <div className="text-xs text-muted-foreground uppercase">Total XP</div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="font-pixel text-xl mb-1">{completedCount}</div>
          <div className="text-xs text-muted-foreground uppercase">Done</div>
        </Card>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="font-pixel text-2xl uppercase mb-4">📖 Lessons</h2>

        {lessons.map((lesson, index) => {
          const isCompleted = lesson.progress?.status === 'completed';
          const isInProgress = lesson.progress?.status === 'in_progress';
          const isLocked = !user && index > 0; // Lock lessons 2+ for non-users

          return (
            <Card
              key={lesson.id}
              className={`border-2 border-foreground ${
                isCompleted ? 'bg-green-500/10' : ''
              } ${isInProgress ? 'bg-yellow-500/10' : ''}`}
            >
              <Link
                href={
                  isLocked
                    ? '#'
                    : `/learn/${params.courseSlug}/${lesson.slug}`
                }
                className={isLocked ? 'pointer-events-none' : ''}
              >
                <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    )}
                    {isInProgress && !isCompleted && (
                      <PlayCircle className="w-8 h-8 text-yellow-500" />
                    )}
                    {!isCompleted && !isInProgress && !isLocked && (
                      <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center font-pixel text-sm">
                        {index + 1}
                      </div>
                    )}
                    {isLocked && <Lock className="w-8 h-8 text-muted" />}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-pixel text-sm uppercase">
                        {lesson.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border uppercase font-pixel text-xs"
                      >
                        {lesson.type === 'tutorial' && '📖 Tutorial'}
                        {lesson.type === 'challenge' && '💻 Challenge'}
                        {lesson.type === 'quiz' && '❓ Quiz'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimated_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {lesson.xp_reward} XP
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!isLocked && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 uppercase font-pixel text-xs"
                    >
                      {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                    </Button>
                  )}
                  {isLocked && (
                    <Link href="/auth/signup">
                      <Button
                        size="sm"
                        className="border-2 uppercase font-pixel text-xs"
                      >
                        Sign Up to Unlock
                      </Button>
                    </Link>
                  )}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
