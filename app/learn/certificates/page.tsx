/**
 * Certificates Page
 * View earned certificates and achievements
 */

import { getUserCertificates, getUserAchievements } from '@/lib/services/learning';
import { AchievementGrid } from '@/components/learning/achievement-badge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Award, Download, Share2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CertificatesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/learn/certificates');
  }

  // Get certificates
  const certificates = await getUserCertificates(user.id);

  // Get achievements
  const achievements = await getUserAchievements(user.id);

  // Get all achievements to show locked ones
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('rarity');

  // Merge with unlocked status
  const achievementsWithStatus = allAchievements?.map((achievement) => {
    const unlocked = achievements.find((a) => a.achievement_id === achievement.id);
    return {
      ...achievement,
      unlocked_at: unlocked?.unlocked_at,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-10 h-10 text-yellow-500" />
          <h1 className="font-pixel text-4xl uppercase">My Achievements</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          View your earned certificates and unlocked achievements.
        </p>
      </div>

      {/* Certificates Section */}
      <div className="mb-12">
        <h2 className="font-pixel text-2xl uppercase mb-4 flex items-center gap-2">
          🎓 Certificates ({certificates.length})
        </h2>

        {certificates.length === 0 ? (
          <Card className="border-2 border-foreground p-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-pixel text-lg uppercase mb-2">
              No Certificates Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete a course to earn your first certificate!
            </p>
            <Link href="/learn">
              <Button className="border-2 uppercase font-pixel">
                Browse Courses
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert: any) => (
              <Card
                key={cert.id}
                className="border-2 border-foreground overflow-hidden"
              >
                {/* Certificate Header */}
                <div className="bg-primary border-b-2 border-foreground p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{cert.course.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-pixel text-sm uppercase">
                        {cert.course.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border mt-1 uppercase font-pixel text-xs"
                      >
                        Certificate
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Certificate #</span>
                      <span className="font-mono">{cert.certificate_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Issued</span>
                      <span>
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Spent</span>
                      <span>{cert.completed_in_hours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-pixel">{cert.final_score}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 uppercase font-pixel text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 uppercase font-pixel text-xs"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="font-pixel text-2xl uppercase mb-4 flex items-center gap-2">
          🏆 Achievements ({achievements.length}/{allAchievements?.length || 0})
        </h2>

        {achievementsWithStatus && achievementsWithStatus.length > 0 ? (
          <AchievementGrid achievements={achievementsWithStatus} />
        ) : (
          <Card className="border-2 border-foreground p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-pixel text-lg uppercase mb-2">
              No Achievements Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start learning to unlock your first achievement!
            </p>
            <Link href="/learn">
              <Button className="border-2 uppercase font-pixel">
                Start Learning
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Achievement Categories */}
      <Card className="border-2 border-foreground p-6 mt-8">
        <h3 className="font-pixel text-lg uppercase mb-3">
          Achievement Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-muted-foreground uppercase">
              Completion
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs text-muted-foreground uppercase">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">💪</div>
            <div className="text-xs text-muted-foreground uppercase">Mastery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-muted-foreground uppercase">Speed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">✨</div>
            <div className="text-xs text-muted-foreground uppercase">Special</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
