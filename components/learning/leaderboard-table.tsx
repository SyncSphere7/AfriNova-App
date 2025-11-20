/**
 * Leaderboard Table Component
 * Display global rankings
 */

import { LeaderboardEntry } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flame, Target, Zap } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showStats?: boolean;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  showStats = true,
}: LeaderboardTableProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <Card className="border-2 border-foreground">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary border-b-2 border-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-pixel text-xs uppercase">
                Rank
              </th>
              <th className="px-4 py-3 text-left font-pixel text-xs uppercase">
                Player
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs uppercase">
                <div className="flex items-center justify-end gap-1">
                  <Trophy className="w-3 h-3" />
                  Level
                </div>
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs uppercase">
                <div className="flex items-center justify-end gap-1">
                  <Zap className="w-3 h-3" />
                  XP
                </div>
              </th>
              {showStats && (
                <>
                  <th className="px-4 py-3 text-right font-pixel text-xs uppercase">
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3" />
                      Streak
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-pixel text-xs uppercase">
                    <div className="flex items-center justify-end gap-1">
                      <Target className="w-3 h-3" />
                      Courses
                    </div>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const medal = getMedalEmoji(entry.rank);

              return (
                <tr
                  key={entry.user_id}
                  className={`border-b border-foreground ${
                    isCurrentUser ? 'bg-primary/20' : 'hover:bg-muted/50'
                  } transition-colors`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="font-pixel text-sm w-8 text-center">
                          {entry.rank}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-foreground">
                        <AvatarImage src={entry.profile?.avatar_url} />
                        <AvatarFallback className="font-pixel text-xs">
                          {entry.profile?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {entry.profile?.full_name || 'Anonymous'}
                        </div>
                        {isCurrentUser && (
                          <Badge
                            variant="outline"
                            className="border uppercase font-pixel text-xs mt-1"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className="border-2 border-yellow-500 bg-yellow-500/20 font-pixel"
                    >
                      {entry.level}
                    </Badge>
                  </td>

                  {/* XP */}
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {entry.total_xp.toLocaleString()}
                  </td>

                  {/* Streak */}
                  {showStats && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Flame
                          className={`w-4 h-4 ${
                            entry.current_streak > 0
                              ? 'text-orange-500'
                              : 'text-muted'
                          }`}
                        />
                        <span className="font-mono text-sm">
                          {entry.current_streak}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Courses */}
                  {showStats && (
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {entry.courses_completed}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * Leaderboard Stats Summary
 */
interface LeaderboardStatsProps {
  userStats: LeaderboardEntry;
  totalUsers: number;
}

export function LeaderboardStats({
  userStats,
  totalUsers,
}: LeaderboardStatsProps) {
  const topPercentage = ((userStats.rank / totalUsers) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-2 border-foreground p-4 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
          <Trophy className="w-3 h-3" />
          <span>Your Rank</span>
        </div>
        <div className="font-pixel text-2xl">#{userStats.rank}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Top {topPercentage}%
        </div>
      </Card>

      <Card className="border-2 border-foreground p-4 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
          <Zap className="w-3 h-3" />
          <span>Total XP</span>
        </div>
        <div className="font-pixel text-2xl">
          {userStats.total_xp.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Level {userStats.level}
        </div>
      </Card>

      <Card className="border-2 border-foreground p-4 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
          <Flame className="w-3 h-3" />
          <span>Current Streak</span>
        </div>
        <div className="font-pixel text-2xl">{userStats.current_streak}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Best: {userStats.longest_streak}
        </div>
      </Card>

      <Card className="border-2 border-foreground p-4 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
          <Target className="w-3 h-3" />
          <span>Completed</span>
        </div>
        <div className="font-pixel text-2xl">{userStats.courses_completed}</div>
        <div className="text-xs text-muted-foreground mt-1">Courses</div>
      </Card>
    </div>
  );
}
