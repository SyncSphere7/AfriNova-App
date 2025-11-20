/**
 * Learning Hub - Course Catalog
 * Browse all available courses with progress tracking
 */

import { getCourses, getUserStats } from '@/lib/services/learning';
import { CourseCard } from '@/components/learning/course-card';
import { XpProgressBar } from '@/components/learning/xp-progress-bar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function LearnPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get courses
  const courses = await getCourses();

  // Get user stats if logged in
  let userStats = null;
  if (user) {
    try {
      userStats = await getUserStats(user.id);
    } catch (error) {
      // User might not have leaderboard entry yet
      console.log('No user stats yet');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-4xl uppercase mb-4">
          🎓 Learn to Code
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Master modern programming with interactive lessons, code challenges, and
          AI-powered hints. Earn XP, unlock achievements, and compete on the
          leaderboard!
        </p>
      </div>

      {/* User Stats */}
      {user && userStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <XpProgressBar currentXp={userStats.total_xp} showDetails />
          </div>
          <Card className="border-2 border-foreground p-4">
            <div className="space-y-3">
              <Link href="/learn/leaderboard">
                <Button
                  variant="outline"
                  className="w-full border-2 uppercase font-pixel text-xs"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard #{userStats.rank}
                </Button>
              </Link>
              <Link href="/learn/certificates">
                <Button
                  variant="outline"
                  className="w-full border-2 uppercase font-pixel text-xs"
                >
                  <Target className="w-4 h-4 mr-2" />
                  My Certificates
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Not Logged In CTA */}
      {!user && (
        <Card className="border-2 border-foreground p-6 mb-8 bg-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-lg uppercase mb-2">
                Sign Up to Track Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a free account to save your progress, earn XP, and unlock
                achievements!
              </p>
            </div>
            <Link href="/auth/signup">
              <Button className="border-2 uppercase font-pixel">
                <TrendingUp className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-foreground p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="font-pixel text-2xl mb-1">{courses.length}</div>
          <div className="text-xs text-muted-foreground uppercase">Courses</div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="font-pixel text-2xl mb-1">20+</div>
          <div className="text-xs text-muted-foreground uppercase">
            Achievements
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="font-pixel text-2xl mb-1">50+</div>
          <div className="text-xs text-muted-foreground uppercase">
            Challenges
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="font-pixel text-2xl mb-1">Free</div>
          <div className="text-xs text-muted-foreground uppercase">
            Full Access
          </div>
        </Card>
      </div>

      {/* Course Catalog */}
      <div className="mb-6">
        <h2 className="font-pixel text-2xl uppercase mb-4">📚 All Courses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Coming Soon */}
      <Card className="border-2 border-foreground p-6 mt-8 border-dashed">
        <div className="text-center">
          <h3 className="font-pixel text-lg uppercase mb-2">🚀 More Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            We're constantly adding new courses and challenges. Stay tuned!
          </p>
        </div>
      </Card>
    </div>
  );
}
