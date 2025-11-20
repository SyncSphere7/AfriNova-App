# 🎓 AfriNova Learning System - Complete Guide

## Overview

The **Learn-to-Code Mode** is a gamified education platform that rivals industry leaders like Codecademy, Pluralsight, and freeCodeCamp. Built with Next.js 13+, Supabase, and Monaco Editor, it features:

- ✅ **Interactive Lessons** - Tutorials, code challenges, and quizzes
- ✅ **XP & Leveling** - Earn experience points and level up
- ✅ **Achievements** - Unlock badges across 5 categories (4 rarity tiers)
- ✅ **Certificates** - Shareable course completion certificates
- ✅ **Global Leaderboard** - Compete with learners worldwide
- ✅ **Streak Tracking** - Daily learning streaks
- ✅ **AI Hints** - 20-language hint system (coming soon)
- ✅ **Retro Windows 95 UI** - Press Start 2P font, pixel-perfect design

---

## 📊 Database Schema

### Tables (8 Total)

#### 1. `courses`
Course catalog with metadata.

```sql
- id (uuid, PK)
- slug (text, unique)
- title (text)
- description (text)
- difficulty (enum: beginner, intermediate, advanced)
- language (text, default 'en')
- estimated_hours (int)
- xp_reward (int)
- icon (text) - Emoji icon
- is_published (boolean)
- order_index (int)
```

#### 2. `lessons`
Individual lessons within courses.

```sql
- id (uuid, PK)
- course_id (uuid, FK → courses)
- title (text)
- slug (text, unique)
- content (text) - Markdown content
- type (enum: tutorial, challenge, quiz)
- order_index (int)
- xp_reward (int)
- estimated_minutes (int)
```

#### 3. `challenges`
Code challenges for lesson type = 'challenge'.

```sql
- id (uuid, PK)
- lesson_id (uuid, FK → lessons)
- title (text)
- description (text)
- starter_code (text)
- solution_code (text)
- test_cases (jsonb) - Array of test cases
- hints (jsonb) - Array of hint strings
- difficulty (enum: easy, medium, hard)
```

**Test Case Format:**
```json
{
  "input": "[5]",
  "expected": "25",
  "description": "square(5) should return 25"
}
```

#### 4. `user_progress`
Track user progress per lesson.

```sql
- user_id (uuid, FK → auth.users)
- lesson_id (uuid, FK → lessons)
- status (enum: not_started, in_progress, completed)
- completed_at (timestamp)
- time_spent_seconds (int)
- attempts (int)
- code_submitted (text)
- PRIMARY KEY (user_id, lesson_id)
```

#### 5. `achievements`
Badge definitions with unlock criteria.

```sql
- id (uuid, PK)
- slug (text, unique)
- title (text)
- description (text)
- icon (text) - Emoji
- category (enum: completion, streak, mastery, speed, special)
- xp_reward (int)
- criteria (jsonb) - Unlock conditions
- rarity (enum: common, rare, epic, legendary)
```

**Criteria Format:**
```json
{
  "courses_completed": 1,
  "challenges_solved": 10,
  "streak": 7,
  "level": 10,
  "total_xp": 1000
}
```

#### 6. `user_achievements`
Unlocked achievements per user.

```sql
- user_id (uuid, FK → auth.users)
- achievement_id (uuid, FK → achievements)
- unlocked_at (timestamp)
- PRIMARY KEY (user_id, achievement_id)
```

#### 7. `certificates`
Course completion certificates.

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- course_id (uuid, FK → courses)
- certificate_number (text, unique) - Format: AF-XXXX-YYYY
- issued_at (timestamp)
- completed_in_hours (int)
- final_score (int, 0-100)
```

#### 8. `leaderboard`
Global rankings and user stats.

```sql
- user_id (uuid, PK, FK → auth.users)
- total_xp (int, default 0)
- level (int, default 1)
- current_streak (int, default 0)
- longest_streak (int, default 0)
- courses_completed (int, default 0)
- challenges_solved (int, default 0)
- rank (int, generated)
```

---

## 🎮 XP & Leveling System

### XP Calculation

**Formula:**  
`level = floor(sqrt(xp / 100))`

**Examples:**
- 100 XP → Level 1
- 400 XP → Level 2
- 900 XP → Level 3
- 10,000 XP → Level 10
- 25,000 XP → Level 15

### XP Sources

| Action | XP Earned |
|--------|-----------|
| Complete tutorial lesson | 50 XP |
| Complete code challenge | 100 XP |
| Complete quiz | 75 XP |
| Complete course | Course XP reward (800-1500 XP) |
| Unlock achievement | Achievement XP reward (50-5000 XP) |

### Functions

```typescript
// Calculate level from XP
calculateLevel(xp: number): number

// Calculate XP needed for next level
xpForNextLevel(currentLevel: number): number

// Get progress to next level
xpProgress(currentXp: number): {
  currentLevel: number,
  nextLevel: number,
  xpForCurrentLevel: number,
  xpForNextLevel: number,
  progressPercentage: number
}
```

---

## 🏆 Achievement System

### Categories (5 Total)

1. **Completion** 🎯 - Complete lessons, courses, certificates
2. **Streak** 🔥 - Maintain daily learning streaks
3. **Mastery** 💪 - Solve challenges, reach levels
4. **Speed** ⚡ - Complete content quickly
5. **Special** ✨ - Unique achievements (early bird, night owl)

### Rarity Tiers

| Rarity | Color | Glow Effect | Examples |
|--------|-------|-------------|----------|
| Common | Gray | None | First lesson, 1K XP |
| Rare | Blue | Blue glow | Course complete, 7-day streak |
| Epic | Purple | Purple glow | 3 courses, 30-day streak, Level 25 |
| Legendary | Gold | Gold glow | 100 challenges, 365-day streak, Level 50 |

### Unlock Logic

Achievements auto-unlock when criteria are met:

```typescript
// Check achievements after XP changes
const newAchievements = await checkAchievements(userId);

// Criteria examples:
{ "courses_completed": 1 }      // Unlock when 1 course done
{ "streak": 7 }                  // Unlock at 7-day streak
{ "challenges_solved": 10 }      // Unlock at 10 challenges
{ "level": 10 }                  // Unlock at level 10
{ "total_xp": 1000 }             // Unlock at 1000 XP
```

---

## 📜 Certificate System

### Certificate Number Format

`AF-{TIMESTAMP}-{RANDOM}`

**Example:** `AF-LM3QZ-9K7X`

### Generation

Certificates auto-generate when all lessons in a course are completed:

```typescript
const certificate = await generateCertificate(courseId);
```

**Certificate Data:**
- Certificate number (unique)
- Issue date
- Time spent (hours)
- Final score (percentage)
- User name
- Course title

---

## 📈 Leaderboard System

### Ranking Logic

Users ranked by **total XP** (descending).

### Displayed Stats

- Rank (1, 2, 3 get medals 🥇🥈🥉)
- Total XP
- Level
- Current streak (🔥 if active)
- Courses completed
- Challenges solved

### Streak Tracking

**Rules:**
- Streak increments when user completes a lesson on a new day
- Streak resets if >1 day gap between completions
- Longest streak is permanently tracked

```typescript
// Update streak after lesson completion
await updateStreak(userId);
```

---

## 🎨 UI Components

All components follow the **Retro Windows 95** design system.

### 1. CourseCard
Displays course with progress bar, XP, difficulty badge.

```tsx
<CourseCard 
  course={course} 
  progress={{ completed: 5, total: 10, xpEarned: 500 }} 
/>
```

### 2. LessonViewer
Renders markdown content with syntax-highlighted code blocks.

```tsx
<LessonViewer lesson={lesson} />
```

### 3. CodeChallenge
Monaco editor with test runner, hints, and validation.

```tsx
<CodeChallenge 
  challenge={challenge} 
  onComplete={(code, time) => handleComplete(code, time)} 
/>
```

### 4. AchievementBadge
Display badge with rarity styling and glow effects.

```tsx
<AchievementBadge 
  achievement={achievement} 
  unlockedAt="2025-11-21" 
  size="md" 
  showDetails 
/>
```

### 5. XpProgressBar
Shows XP progress to next level with detailed stats.

```tsx
<XpProgressBar currentXp={5000} showDetails />
```

### 6. LeaderboardTable
Global rankings with medals, streaks, and user highlighting.

```tsx
<LeaderboardTable 
  entries={leaderboard} 
  currentUserId={user.id} 
  showStats 
/>
```

---

## 📄 Pages

### 1. `/learn` - Course Catalog
- Browse all courses
- View XP progress
- Quick links to leaderboard/certificates

### 2. `/learn/[courseSlug]` - Course Overview
- Course details (difficulty, hours, XP)
- Lesson list with status (locked, in-progress, completed)
- Progress bar
- Sign-up CTA for locked lessons

### 3. `/learn/[courseSlug]/[lessonSlug]` - Lesson Viewer
- Tutorial: Markdown content with complete button
- Challenge: Monaco editor with test runner
- XP info
- Breadcrumb navigation

### 4. `/learn/leaderboard` - Global Rankings
- Top 100 users
- User stats (rank, XP, streak, courses)
- Rankings explanation

### 5. `/learn/certificates` - Achievements Hub
- Earned certificates with download/share
- Achievement grid (locked + unlocked)
- Achievement categories

---

## 🔧 API Functions

### Course Management

```typescript
// Get all published courses
getCourses(): Promise<Course[]>

// Get course by slug
getCourse(slug: string): Promise<Course>

// Get course with user progress
getCourseWithProgress(courseId: string, userId: string): Promise<{
  course: Course,
  lessons: (Lesson & { progress?: UserProgress })[],
  totalXp: number,
  completedCount: number
}>
```

### Lesson Management

```typescript
// Get lesson with challenge
getLesson(lessonId: string): Promise<{
  lesson: Lesson,
  challenge?: Challenge
}>

// Start lesson (mark in-progress)
startLesson(lessonId: string): Promise<void>

// Complete lesson (award XP)
completeLesson(
  lessonId: string, 
  timeSpentSeconds: number, 
  codeSubmitted?: string
): Promise<{ xpEarned: number, newAchievements: Achievement[] }>
```

### XP Management

```typescript
// Add XP to user
addXp(userId: string, xp: number): Promise<void>
```

### Achievement Management

```typescript
// Check and unlock new achievements
checkAchievements(userId: string): Promise<Achievement[]>

// Get user's achievements
getUserAchievements(userId: string): Promise<UserAchievement[]>
```

### Certificate Management

```typescript
// Generate certificate for completed course
generateCertificate(courseId: string): Promise<Certificate>

// Get user's certificates
getUserCertificates(userId: string): Promise<Certificate[]>
```

### Leaderboard Management

```typescript
// Get global leaderboard
getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>

// Get user stats
getUserStats(userId: string): Promise<LeaderboardEntry>

// Update daily streak
updateStreak(userId: string): Promise<void>
```

---

## 🌍 Multilingual Support (Coming Soon)

### AI Tutor Integration

The learning system will integrate with OpenRouter agents to provide:

1. **AI Hints** - Context-aware hints in 20 languages
2. **Error Explanations** - Explain syntax errors in user's language
3. **Concept Explanations** - Explain concepts interactively
4. **Solution Reviews** - Review submitted code and suggest improvements

**Supported Languages:**  
en, fr, sw, ar, pt, es, zh, hi, de, ja, ko, ru, id, th, vi, tl, it, nl, pl, tr

---

## 🎯 Competitive Advantages

### vs Codecademy ($47.99/mo)
✅ AI-powered hints in 20 languages  
✅ Gamification with XP, levels, achievements  
✅ **FREE** full access  

### vs Pluralsight ($29/mo)
✅ Interactive code challenges (not just videos)  
✅ Real-time test validation  
✅ **FREE** full access  

### vs LinkedIn Learning ($39.99/mo)
✅ Shareable certificates with verification  
✅ Competitive leaderboard  
✅ **FREE** full access  

### vs freeCodeCamp (free)
✅ AI tutor assistance  
✅ Gamified progression  
✅ Achievement system  

### vs LeetCode ($35/mo)
✅ Full courses (not just challenges)  
✅ Beginner-friendly tutorials  
✅ **FREE** full access  

---

## 🚀 Course Content (Seeded)

### 1. React Fundamentals (⚛️)
- **Difficulty:** Beginner
- **Duration:** 12 hours
- **XP Reward:** 1200 XP
- **Lessons:** 6 (3 tutorials, 3 challenges)
- **Topics:** Components, props, useState, JSX

### 2. TypeScript Basics (📘)
- **Difficulty:** Beginner
- **Duration:** 8 hours
- **XP Reward:** 800 XP
- **Lessons:** 4 (2 tutorials, 2 challenges)
- **Topics:** Types, interfaces, generics

### 3. Next.js Mastery (▲)
- **Difficulty:** Intermediate
- **Duration:** 15 hours
- **XP Reward:** 1500 XP
- **Topics:** App Router, Server Components, API routes

### 4. Python for Beginners (🐍)
- **Difficulty:** Beginner
- **Duration:** 10 hours
- **XP Reward:** 1000 XP
- **Topics:** Variables, functions, loops

---

## 🔐 Security (RLS Policies)

### Public Read Access
- ✅ Anyone can view courses, lessons, challenges, achievements

### Protected Write Access
- ✅ Users can only update **their own** progress
- ✅ Users can only view **their own** certificates
- ✅ Leaderboard is public read, private write

---

## 📦 Installation

### 1. Database Migration

```bash
# Apply main learning tables
psql -U postgres -d afrinova -f supabase/migrations/20251121010000_create_learning_tables.sql

# Seed course content
psql -U postgres -d afrinova -f supabase/migrations/20251121020000_seed_courses.sql
```

### 2. Dependencies

```bash
npm install @monaco-editor/react react-markdown react-syntax-highlighter @types/react-syntax-highlighter
```

### 3. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🧪 Testing Checklist

- [ ] Create account and view course catalog
- [ ] Start a course and view lesson
- [ ] Complete a tutorial lesson
- [ ] Complete a code challenge
- [ ] Unlock an achievement
- [ ] View leaderboard ranking
- [ ] Complete a full course
- [ ] Generate a certificate
- [ ] Test XP calculation and leveling
- [ ] Test streak tracking (daily completions)

---

## 🎨 Design System Compliance

All learning components use the **Retro Windows 95** design:

- ✅ **Font:** Press Start 2P (`font-pixel`)
- ✅ **Colors:** #D4C5A8 beige (`bg-primary`), #0a0a0a dark
- ✅ **Borders:** Thick 2px borders (`border-2 border-foreground`)
- ✅ **Shadows:** Pixel-perfect box shadows
- ✅ **Typography:** Uppercase headings
- ✅ **Icons:** Emoji + Lucide React

**Verified:** 59+ instances of `font-pixel` across all features.

---

## 🔮 Future Enhancements

1. **AI Tutor** - OpenRouter integration for hints in 20 languages
2. **Course-Specific Leaderboards** - Compete per course
3. **Multiplayer Challenges** - Race to solve challenges
4. **Video Lessons** - Embed tutorials
5. **Discussion Forums** - Per-lesson Q&A
6. **Mobile App** - React Native version
7. **Offline Mode** - PWA with offline lessons
8. **More Languages** - Expand to 50+ languages

---

## 📞 Support

For questions or issues:
- **Docs:** `/docs/LEARNING_GUIDE.md`
- **GitHub:** SyncSphere7/AfriNova-App
- **Email:** support@afrinova.com

---

**Built with ❤️ by AfriNova CTO**  
**Version:** 1.0.0  
**Last Updated:** November 21, 2025
