/**
 * Lesson Viewer Component
 * Renders markdown content with syntax highlighting
 */

'use client';

import { Lesson } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface LessonViewerProps {
  lesson: Lesson;
}

export function LessonViewer({ lesson }: LessonViewerProps) {
  return (
    <Card className="border-2 border-foreground">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="border-2 uppercase font-pixel text-xs"
            >
              {lesson.type === 'tutorial' && (
                <>
                  <BookOpen className="w-3 h-3 mr-1" />
                  Tutorial
                </>
              )}
              {lesson.type === 'challenge' && '💻 Challenge'}
              {lesson.type === 'quiz' && '❓ Quiz'}
            </Badge>
            <Badge
              variant="outline"
              className="border-2 uppercase font-pixel text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              {lesson.estimated_minutes} min
            </Badge>
          </div>

          <h1 className="font-pixel text-2xl uppercase mb-2">
            {lesson.title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="border-2 border-foreground rounded-none"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-muted px-1 py-0.5 border border-foreground font-mono text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <h1 className="font-pixel text-xl uppercase mt-6 mb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-pixel text-lg uppercase mt-5 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-pixel text-base uppercase mt-4 mb-2">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 space-y-2">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic bg-muted p-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      </div>
    </Card>
  );
}
