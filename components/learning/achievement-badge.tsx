/**
 * Achievement Badge Component
 * Display badges with rarity styling
 */

import { Achievement } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlockedAt?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({
  achievement,
  unlockedAt,
  showDetails = false,
  size = 'md',
}: AchievementBadgeProps) {
  const rarityConfig = {
    common: {
      bg: 'bg-gray-500',
      border: 'border-gray-500',
      glow: 'shadow-gray-500/50',
    },
    rare: {
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      glow: 'shadow-blue-500/50',
    },
    epic: {
      bg: 'bg-purple-500',
      border: 'border-purple-500',
      glow: 'shadow-purple-500/50',
    },
    legendary: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      glow: 'shadow-yellow-500/50',
    },
  };

  const sizeConfig = {
    sm: { icon: 'text-2xl', card: 'p-3', title: 'text-xs' },
    md: { icon: 'text-4xl', card: 'p-4', title: 'text-sm' },
    lg: { icon: 'text-6xl', card: 'p-6', title: 'text-base' },
  };

  const config = rarityConfig[achievement.rarity];
  const sizeStyle = sizeConfig[size];

  return (
    <Card
      className={`border-2 ${config.border} ${
        unlockedAt ? `${config.glow} shadow-lg` : 'opacity-50 grayscale'
      } transition-all`}
    >
      <div className={`${sizeStyle.card} text-center`}>
        {/* Icon */}
        <div className={`${sizeStyle.icon} mb-2`}>{achievement.icon}</div>

        {/* Title */}
        <h3 className={`font-pixel ${sizeStyle.title} uppercase mb-1`}>
          {achievement.title}
        </h3>

        {/* Rarity */}
        <Badge
          variant="outline"
          className={`border-2 ${config.bg} text-white uppercase font-pixel text-xs mb-2`}
        >
          {achievement.rarity}
        </Badge>

        {/* XP */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          <span>{achievement.xp_reward} XP</span>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t-2 border-foreground">
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            {unlockedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Unlocked: {new Date(unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Achievement Grid
 */
interface AchievementGridProps {
  achievements: (Achievement & { unlocked_at?: string })[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlockedAt={achievement.unlocked_at}
          showDetails
        />
      ))}
    </div>
  );
}
