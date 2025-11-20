-- Seed Learning Content
-- 4 courses with lessons and challenges

-- ==================== COURSES ====================

INSERT INTO courses (slug, title, description, difficulty, language, estimated_hours, xp_reward, icon, is_published, order_index) VALUES
-- 1. React Fundamentals
('react-fundamentals', 'React Fundamentals', 'Master the basics of React including components, hooks, state management, and props. Build real-world projects from scratch.', 'beginner', 'en', 12, 1200, '⚛️', true, 1),

-- 2. TypeScript Basics
('typescript-basics', 'TypeScript Basics', 'Learn TypeScript from the ground up. Understand types, interfaces, generics, and how to write type-safe code.', 'beginner', 'en', 8, 800, '📘', true, 2),

-- 3. Next.js Mastery
('nextjs-mastery', 'Next.js Mastery', 'Build production-ready applications with Next.js. Learn App Router, Server Components, API routes, and deployment.', 'intermediate', 'en', 15, 1500, '▲', true, 3),

-- 4. Python for Beginners
('python-beginners', 'Python for Beginners', 'Start your coding journey with Python. Learn variables, functions, loops, and build practical projects.', 'beginner', 'en', 10, 1000, '🐍', true, 4);

-- ==================== REACT FUNDAMENTALS LESSONS ====================

INSERT INTO lessons (course_id, title, slug, content, type, order_index, xp_reward, estimated_minutes) VALUES
-- Lesson 1: Introduction to React
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'Introduction to React', 'intro-to-react', 
'# Introduction to React

React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Meta and the open-source community.

## Why React?

- **Component-Based**: Build encapsulated components that manage their own state
- **Declarative**: Design simple views for each state in your application
- **Learn Once, Write Anywhere**: Use React on the server, mobile, or web

## Your First Component

```jsx
function Welcome() {
  return <h1>Hello, React!</h1>;
}
```

This is a simple React component that returns JSX (JavaScript XML).

## Key Concepts

1. **Components**: Reusable building blocks
2. **JSX**: HTML-like syntax in JavaScript
3. **Props**: Pass data to components
4. **State**: Manage component data

Let''s dive deeper in the next lessons!', 
'tutorial', 1, 50, 15),

-- Lesson 2: JSX Challenge
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'JSX Syntax Challenge', 'jsx-challenge',
'# JSX Challenge

Now that you understand JSX, let''s practice! Create a component that renders a greeting.',
'challenge', 2, 100, 30),

-- Lesson 3: Components and Props
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'Components and Props', 'components-props',
'# Components and Props

Components let you split the UI into independent, reusable pieces.

## Functional Components

```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

## Using Components

```jsx
<Greeting name="Alice" />
<Greeting name="Bob" />
```

## Props Are Read-Only

Props are immutable. Never modify props inside a component.

## Destructuring Props

```jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
    </div>
  );
}
```',
'tutorial', 3, 50, 20),

-- Lesson 4: Props Challenge
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'Props Challenge', 'props-challenge',
'# Props Challenge

Create a UserCard component that accepts name, email, and role props.',
'challenge', 4, 100, 30),

-- Lesson 5: State with useState
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'State with useState', 'state-usestate',
'# State with useState

State allows components to remember information between renders.

## The useState Hook

```jsx
import { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Rules of Hooks

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use the same order every render',
'tutorial', 5, 50, 25),

-- Lesson 6: Counter Challenge
((SELECT id FROM courses WHERE slug = 'react-fundamentals'), 'Counter Challenge', 'counter-challenge',
'# Counter Challenge

Build a counter with increment, decrement, and reset buttons.',
'challenge', 6, 100, 35);

-- ==================== TYPESCRIPT BASICS LESSONS ====================

INSERT INTO lessons (course_id, title, slug, content, type, order_index, xp_reward, estimated_minutes) VALUES
-- Lesson 1: TypeScript Introduction
((SELECT id FROM courses WHERE slug = 'typescript-basics'), 'TypeScript Introduction', 'typescript-intro',
'# Welcome to TypeScript

TypeScript is JavaScript with syntax for types. It adds type safety to your code.

## Why TypeScript?

- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

## Basic Types

```typescript
let name: string = "Alice";
let age: number = 25;
let isStudent: boolean = true;
```

## Type Inference

TypeScript can infer types automatically:

```typescript
let message = "Hello"; // inferred as string
```',
'tutorial', 1, 50, 15),

-- Lesson 2: Types Challenge
((SELECT id FROM courses WHERE slug = 'typescript-basics'), 'Basic Types Challenge', 'types-challenge',
'# Types Challenge

Write a function that accepts a number and returns its square, with proper type annotations.',
'challenge', 2, 100, 25),

-- Lesson 3: Interfaces
((SELECT id FROM courses WHERE slug = 'typescript-basics'), 'Interfaces', 'interfaces',
'# Interfaces

Interfaces define the shape of an object.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // optional property
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
```',
'tutorial', 3, 50, 20),

-- Lesson 4: Interface Challenge
((SELECT id FROM courses WHERE slug = 'typescript-basics'), 'Interface Challenge', 'interface-challenge',
'# Interface Challenge

Create an interface for a Product with required and optional properties.',
'challenge', 4, 100, 30);

-- ==================== CHALLENGES ====================

-- React: JSX Challenge
INSERT INTO challenges (lesson_id, title, description, starter_code, solution_code, test_cases, hints, difficulty) VALUES
((SELECT id FROM lessons WHERE slug = 'jsx-challenge'),
'Create Greeting Component',
'Build a function component that returns a greeting message in JSX',
'function Greeting() {
  // Your code here
}',
'function Greeting() {
  return <h1>Hello, World!</h1>;
}',
'[
  {"input": "[]", "expected": "\"<h1>Hello, World!</h1>\"", "description": "Should return greeting JSX"}
]',
'["Start with a function that returns JSX", "Use the <h1> tag for the heading", "Remember JSX must be wrapped in parentheses if multi-line"]',
'easy'),

-- React: Props Challenge
((SELECT id FROM lessons WHERE slug = 'props-challenge'),
'UserCard Component',
'Create a component that displays user information using props',
'function UserCard(props) {
  // Your code here
}',
'function UserCard({ name, email, role }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <span>{role}</span>
    </div>
  );
}',
'[
  {"input": "[{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"role\":\"Developer\"}]", "expected": "\"<div><h2>Alice</h2><p>alice@example.com</p><span>Developer</span></div>\"", "description": "Should display user information"}
]',
'["Destructure props in the function parameters", "Use curly braces to display prop values in JSX", "Wrap everything in a div"]',
'easy'),

-- React: Counter Challenge
((SELECT id FROM lessons WHERE slug = 'counter-challenge'),
'Build a Counter',
'Create a counter with increment, decrement, and reset functionality',
'import { useState } from "react";

function Counter() {
  // Your code here
}',
'import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}',
'[
  {"input": "[]", "expected": "\"Counter with 3 buttons\"", "description": "Should have increment, decrement, and reset buttons"}
]',
'["Use useState to track the count", "Create three button elements with onClick handlers", "Use setCount to update the state"]',
'medium'),

-- TypeScript: Types Challenge
((SELECT id FROM lessons WHERE slug = 'types-challenge'),
'Square Number Function',
'Write a typed function that squares a number',
'function square() {
  // Your code here
}',
'function square(num: number): number {
  return num * num;
}',
'[
  {"input": "[5]", "expected": "25", "description": "square(5) should return 25"},
  {"input": "[10]", "expected": "100", "description": "square(10) should return 100"}
]',
'["Add a parameter with type annotation", "Specify the return type after the parentheses", "Return num multiplied by itself"]',
'easy'),

-- TypeScript: Interface Challenge
((SELECT id FROM lessons WHERE slug = 'interface-challenge'),
'Product Interface',
'Define an interface for a product with required and optional properties',
'interface Product {
  // Your code here
}',
'interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  inStock?: boolean;
}',
'[
  {"input": "[]", "expected": "\"Interface with 3 required and 2 optional properties\"", "description": "Should have id, name, price (required) and description, inStock (optional)"}
]',
'["Required properties: id (number), name (string), price (number)", "Optional properties use the ? syntax", "Add description and inStock as optional"]',
'easy');

-- ==================== ACHIEVEMENTS ====================

INSERT INTO achievements (slug, title, description, icon, category, xp_reward, criteria, rarity) VALUES
-- Completion Achievements
('first-lesson', 'First Steps', 'Complete your first lesson', '🎯', 'completion', 50, '{"lessons_completed": 1}', 'common'),
('course-complete', 'Course Master', 'Complete your first course', '🎓', 'completion', 500, '{"courses_completed": 1}', 'rare'),
('polyglot', 'Polyglot', 'Complete courses in 3 different languages', '🌍', 'completion', 1000, '{"courses_completed": 3}', 'epic'),

-- Streak Achievements
('week-streak', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 200, '{"streak": 7}', 'common'),
('month-streak', 'Month Master', 'Maintain a 30-day streak', '💪', 'streak', 1000, '{"streak": 30}', 'epic'),
('year-streak', 'Year Legend', 'Maintain a 365-day streak', '👑', 'streak', 5000, '{"streak": 365}', 'legendary'),

-- Mastery Achievements
('challenge-ace', 'Challenge Ace', 'Complete 10 challenges', '💻', 'mastery', 300, '{"challenges_solved": 10}', 'rare'),
('code-ninja', 'Code Ninja', 'Complete 50 challenges', '🥷', 'mastery', 1500, '{"challenges_solved": 50}', 'epic'),
('code-legend', 'Code Legend', 'Complete 100 challenges', '⚡', 'mastery', 3000, '{"challenges_solved": 100}', 'legendary'),

-- Speed Achievements
('speed-demon', 'Speed Demon', 'Complete a lesson in under 10 minutes', '⚡', 'speed', 100, '{"fast_completion": true}', 'rare'),

-- Level Achievements
('level-10', 'Level 10', 'Reach level 10', '🏆', 'mastery', 500, '{"level": 10}', 'rare'),
('level-25', 'Level 25', 'Reach level 25', '💎', 'mastery', 1500, '{"level": 25}', 'epic'),
('level-50', 'Level 50', 'Reach level 50', '👑', 'mastery', 5000, '{"level": 50}', 'legendary'),

-- XP Achievements
('xp-1000', 'XP Novice', 'Earn 1,000 XP', '⭐', 'mastery', 100, '{"total_xp": 1000}', 'common'),
('xp-10000', 'XP Expert', 'Earn 10,000 XP', '🌟', 'mastery', 1000, '{"total_xp": 10000}', 'rare'),
('xp-50000', 'XP Master', 'Earn 50,000 XP', '✨', 'mastery', 5000, '{"total_xp": 50000}', 'epic'),

-- Special Achievements
('early-bird', 'Early Bird', 'Complete a lesson before 8 AM', '🌅', 'special', 150, '{"early_completion": true}', 'rare'),
('night-owl', 'Night Owl', 'Complete a lesson after midnight', '🦉', 'special', 150, '{"late_completion": true}', 'rare'),
('perfect-score', 'Perfect Score', 'Complete a challenge with 100% first try', '💯', 'special', 200, '{"perfect_challenge": true}', 'rare');
