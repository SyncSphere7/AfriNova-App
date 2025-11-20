/**
 * Code Challenge Component
 * Interactive coding challenges with test runner
 */

'use client';

import { useState, useEffect } from 'react';
import { Challenge, TestCase } from '@/lib/services/learning';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Editor from '@monaco-editor/react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code,
  Trophy,
} from 'lucide-react';

interface CodeChallengeProps {
  challenge: Challenge;
  onComplete: (code: string, timeSpent: number) => Promise<void>;
}

export function CodeChallenge({ challenge, onComplete }: CodeChallengeProps) {
  const [code, setCode] = useState(challenge.starter_code);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<
    { passed: boolean; description: string; error?: string }[]
  >([]);
  const [allPassed, setAllPassed] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [startTime] = useState(Date.now());

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  // Run tests
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Simulate test execution
      // In production, this would send code to a sandboxed runner
      const results = challenge.test_cases.map((testCase) => {
        try {
          // Create function from code
          const func = new Function('return ' + code)();

          // Parse input and run
          const input = JSON.parse(testCase.input);
          const result = typeof input === 'object' && Array.isArray(input)
            ? func(...input)
            : func(input);

          // Compare with expected
          const expected = JSON.parse(testCase.expected);
          const passed = JSON.stringify(result) === JSON.stringify(expected);

          return {
            passed,
            description: testCase.description,
            error: passed ? undefined : `Expected ${testCase.expected}, got ${JSON.stringify(result)}`,
          };
        } catch (error) {
          return {
            passed: false,
            description: testCase.description,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      setTestResults(results);
      const allTestsPassed = results.every((r) => r.passed);
      setAllPassed(allTestsPassed);

      // If all passed, complete challenge
      if (allTestsPassed) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await onComplete(code, timeSpent);
      }
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Show next hint
  const showNextHint = () => {
    if (currentHint < challenge.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
    setShowHints(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-2 border-foreground p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-pixel text-xl uppercase mb-2">
              {challenge.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`border-2 ${difficultyColors[challenge.difficulty]} text-white uppercase font-pixel text-xs`}
          >
            {challenge.difficulty}
          </Badge>
        </div>

        {/* Test Cases Preview */}
        <div className="space-y-2">
          <h3 className="font-pixel text-sm uppercase">Test Cases:</h3>
          {challenge.test_cases.slice(0, 2).map((testCase, i) => (
            <div
              key={i}
              className="bg-muted p-2 border border-foreground font-mono text-xs"
            >
              <div className="text-muted-foreground mb-1">
                {testCase.description}
              </div>
              <div>
                Input: <span className="text-primary">{testCase.input}</span>
              </div>
              <div>
                Expected: <span className="text-primary">{testCase.expected}</span>
              </div>
            </div>
          ))}
          {challenge.test_cases.length > 2 && (
            <div className="text-xs text-muted-foreground">
              + {challenge.test_cases.length - 2} more test cases
            </div>
          )}
        </div>
      </Card>

      {/* Code Editor */}
      <Card className="border-2 border-foreground overflow-hidden">
        <div className="bg-primary border-b-2 border-foreground p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="font-pixel text-xs uppercase">Code Editor</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-2 uppercase font-pixel text-xs"
              onClick={showNextHint}
              disabled={currentHint >= challenge.hints.length - 1}
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Hint {currentHint + 1}/{challenge.hints.length}
            </Button>
            <Button
              size="sm"
              className="border-2 uppercase font-pixel text-xs"
              onClick={runTests}
              disabled={isRunning}
            >
              <Play className="w-3 h-3 mr-1" />
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>
        </div>
        <Editor
          height="400px"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Card>

      {/* Hints */}
      {showHints && challenge.hints.length > 0 && (
        <Alert className="border-2 border-yellow-500">
          <Lightbulb className="w-4 h-4" />
          <AlertDescription>
            <div className="font-pixel text-xs uppercase mb-2">
              Hint {currentHint + 1}:
            </div>
            <div className="text-sm">{challenge.hints[currentHint]}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="border-2 border-foreground p-4">
          <h3 className="font-pixel text-sm uppercase mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Test Results
          </h3>
          <div className="space-y-2">
            {testResults.map((result, i) => (
              <div
                key={i}
                className={`p-3 border-2 ${
                  result.passed
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {result.description}
                    </div>
                    {result.error && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Success Message */}
          {allPassed && (
            <Alert className="border-2 border-green-500 mt-4">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                <div className="font-pixel text-sm uppercase">
                  🎉 Challenge Complete!
                </div>
                <div className="text-sm mt-1">
                  All tests passed! You've earned XP and can proceed to the next
                  lesson.
                </div>
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}
    </div>
  );
}
