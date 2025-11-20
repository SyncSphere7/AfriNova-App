/**
 * Lesson Viewer Page
 * Display lesson content and code challenges
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLesson, completeLesson, startLesson } from '@/lib/services/learning';
import { LessonViewer } from '@/components/learning/lesson-viewer';
import { CodeChallenge } from '@/components/learning/code-challenge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

interface LessonPageProps {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadLesson();
  }, [params.lessonSlug]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      // Get lesson by slug
      const { data: lessons } = await fetch('/api/learn/lessons').then((r) =>
        r.json()
      );
      const lessonData = lessons?.find((l: any) => l.slug === params.lessonSlug);

      if (lessonData) {
        const { lesson: lessonDetails, challenge: challengeData } =
          await getLesson(lessonData.id);
        setLesson(lessonDetails);
        setChallenge(challengeData);

        // Mark as started
        await startLesson(lessonData.id);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (codeSubmitted?: string) => {
    if (!lesson) return;

    try {
      setCompleting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const { xpEarned, newAchievements } = await completeLesson(
        lesson.id,
        timeSpent,
        codeSubmitted
      );

      // Show success toast
      toast({
        title: '🎉 Lesson Complete!',
        description: `You earned ${xpEarned} XP!`,
      });

      // Show achievement toasts
      for (const achievement of newAchievements) {
        setTimeout(() => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.title}`,
          });
        }, 500);
      }

      // Navigate to course page
      setTimeout(() => {
        router.push(`/learn/${params.courseSlug}`);
      }, 2000);
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete lesson. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2 border-foreground p-8 text-center">
          <div className="animate-pulse">
            <div className="font-pixel text-lg uppercase">Loading...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="border-2 border-foreground">
          <AlertDescription>Lesson not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-foreground">
          Learn
        </Link>
        <span>/</span>
        <Link
          href={`/learn/${params.courseSlug}`}
          className="hover:text-foreground"
        >
          {params.courseSlug}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Lesson Content */}
      {lesson.type === 'tutorial' && <LessonViewer lesson={lesson} />}

      {/* Challenge */}
      {lesson.type === 'challenge' && challenge && (
        <CodeChallenge challenge={challenge} onComplete={handleComplete} />
      )}

      {/* Tutorial Complete Button */}
      {lesson.type === 'tutorial' && (
        <div className="mt-6 flex justify-between items-center">
          <Link href={`/learn/${params.courseSlug}`}>
            <Button
              variant="outline"
              className="border-2 uppercase font-pixel text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <Button
            className="border-2 uppercase font-pixel text-sm"
            onClick={() => handleComplete()}
            disabled={completing}
          >
            {completing ? 'Completing...' : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </div>
      )}

      {/* XP Info */}
      <Card className="border-2 border-foreground p-4 mt-6 bg-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-pixel text-sm uppercase">
              Complete this lesson to earn {lesson.xp_reward} XP
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
