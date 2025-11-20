/**
 * XP Progress Bar Component
 * Shows XP progress to next level
 */

'use client';

import { xpProgress } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, TrendingUp } from 'lucide-react';

interface XpProgressBarProps {
  currentXp: number;
  showDetails?: boolean;
}

export function XpProgressBar({ currentXp, showDetails = true }: XpProgressBarProps) {
  const progress = xpProgress(currentXp);

  return (
    <Card className="border-2 border-foreground">
      <div className="p-4">
        {/* Level Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-pixel text-sm uppercase">
              Level {progress.currentLevel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span className="font-mono">{currentXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          value={progress.progressPercentage}
          className="h-4 border-2 border-foreground mb-2"
        />

        {/* Details */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {(progress.xpForNextLevel - currentXp).toLocaleString()} XP to Level{' '}
            {progress.nextLevel}
          </span>
          <span className="font-pixel">
            {Math.round(progress.progressPercentage)}%
          </span>
        </div>

        {/* Detailed Stats */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t-2 border-foreground grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Trophy className="w-3 h-3" />
                <span>Level</span>
              </div>
              <div className="font-pixel text-lg">{progress.currentLevel}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Zap className="w-3 h-3" />
                <span>Total XP</span>
              </div>
              <div className="font-pixel text-lg">
                {currentXp.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Next</span>
              </div>
              <div className="font-pixel text-lg">{progress.nextLevel}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
