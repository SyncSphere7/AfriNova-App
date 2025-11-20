/**
 * Course Card Component
 * Displays course with progress, XP, and difficulty
 */

import { Course } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Trophy, Clock, Zap } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  progress?: {
    completed: number;
    total: number;
    xpEarned: number;
  };
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const completionPercentage = progress
    ? (progress.completed / progress.total) * 100
    : 0;

  const difficultyColors = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500',
  };

  return (
    <Link href={`/learn/${course.slug}`}>
      <Card className="border-2 border-foreground hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer h-full">
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{course.icon}</div>
            <div className="flex-1">
              <h3 className="font-pixel text-lg uppercase mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="outline"
              className={`border-2 ${difficultyColors[course.difficulty]} text-white uppercase font-pixel text-xs`}
            >
              {course.difficulty}
            </Badge>
            <Badge variant="outline" className="border-2 uppercase font-pixel text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {course.estimated_hours}h
            </Badge>
            <Badge variant="outline" className="border-2 uppercase font-pixel text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {course.xp_reward} XP
            </Badge>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-pixel text-xs uppercase">
                  {progress.completed}/{progress.total} Lessons
                </span>
                <span className="font-pixel text-xs">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <Progress
                value={completionPercentage}
                className="h-3 border-2 border-foreground"
              />
              {progress.xpEarned > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="w-3 h-3" />
                  <span>{progress.xpEarned} XP Earned</span>
                </div>
              )}
            </div>
          )}

          {!progress && (
            <button className="w-full mt-2 px-4 py-2 bg-primary border-2 border-foreground uppercase font-pixel text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Start Course
            </button>
          )}
        </div>
      </Card>
    </Link>
  );
}
