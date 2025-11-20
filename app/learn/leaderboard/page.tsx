/**
 * Leaderboard Page
 * Global rankings and user stats
 */

import { getLeaderboard, getUserStats } from '@/lib/services/learning';
import {
  LeaderboardTable,
  LeaderboardStats,
} from '@/components/learning/leaderboard-table';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get leaderboard
  const leaderboard = await getLeaderboard(100);

  // Get user stats
  let userStats = null;
  let totalUsers = leaderboard.length;
  if (user) {
    try {
      userStats = await getUserStats(user.id);
      // Get total users count
      const { count } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true });
      totalUsers = count || leaderboard.length;
    } catch (error) {
      console.log('No user stats yet');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h1 className="font-pixel text-4xl uppercase">Leaderboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Compete with learners worldwide. Complete courses, earn XP, and climb the
          ranks!
        </p>
      </div>

      {/* User Stats */}
      {user && userStats && (
        <div className="mb-8">
          <LeaderboardStats userStats={userStats} totalUsers={totalUsers} />
        </div>
      )}

      {/* Not Logged In */}
      {!user && (
        <Card className="border-2 border-foreground p-6 mb-8 bg-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-lg uppercase mb-2">
                Join the Competition!
              </h3>
              <p className="text-sm text-muted-foreground">
                Sign up to track your progress and compete on the leaderboard.
              </p>
            </div>
            <Link href="/auth/signup">
              <Button className="border-2 uppercase font-pixel">
                <Trophy className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      <div className="mb-6">
        <h2 className="font-pixel text-2xl uppercase mb-4">🏆 Top 100</h2>
      </div>

      <LeaderboardTable
        entries={leaderboard}
        currentUserId={user?.id}
        showStats
      />

      {/* Info */}
      <Card className="border-2 border-foreground p-6 mt-8">
        <h3 className="font-pixel text-lg uppercase mb-3">How Rankings Work</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>XP:</strong> Earn XP by completing lessons and challenges
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Level:</strong> Your level is calculated from total XP (level
              = √(XP/100))
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Streaks:</strong> Complete at least one lesson per day to
              maintain your streak
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Courses:</strong> Finish all lessons in a course to mark it
              complete
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
