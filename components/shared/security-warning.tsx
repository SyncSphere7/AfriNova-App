'use client';

import { AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SecretScanResult } from '@/lib/utils/secret-scanner';

interface SecurityWarningProps {
  scanResult?: {
    hasSecrets: boolean;
    warnings: SecretScanResult['warnings'];
    score: SecretScanResult['score'];
    message: string;
  };
}

export function SecurityWarning({ scanResult }: SecurityWarningProps) {
  if (!scanResult) return null;

  // Safe - no warnings
  if (!scanResult.hasSecrets) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Security Check Passed</AlertTitle>
        <AlertDescription className="text-gray-400">
          No API keys or secrets detected in generated code.
        </AlertDescription>
      </Alert>
    );
  }

  // Dangerous - critical issues
  if (scanResult.score === 'dangerous') {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <AlertTitle className="text-red-500 font-semibold">
          🚨 Critical Security Warning
        </AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-gray-300">
            Potential API keys or secrets detected in generated code! 
            <strong className="text-red-400"> DO NOT commit this code to git.</strong>
          </p>
          
          <div className="space-y-2">
            <p className="font-semibold text-sm text-gray-200">Issues Found:</p>
            {scanResult.warnings.slice(0, 3).map((warning, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-['Press_Start_2P'] text-red-400">
                      {warning.pattern}
                    </CardTitle>
                    <Badge variant={warning.severity === 'critical' ? 'destructive' : 'outline'}>
                      {warning.severity}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Line {warning.line}, Column {warning.column}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-gray-950 p-2 rounded text-xs font-mono overflow-x-auto">
                    <pre className="text-gray-400">{warning.snippet}</pre>
                  </div>
                  <p className="text-xs text-blue-400">{warning.suggestion}</p>
                </CardContent>
              </Card>
            ))}
            
            {scanResult.warnings.length > 3 && (
              <p className="text-sm text-gray-400">
                + {scanResult.warnings.length - 3} more issue(s)
              </p>
            )}
          </div>

          <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-3 space-y-2">
            <p className="font-semibold text-sm text-yellow-500 flex items-center gap-2">
              <Info className="h-4 w-4" />
              How to Fix:
            </p>
            <ul className="text-xs text-gray-300 space-y-1 ml-6 list-disc">
              <li>Move all secrets to <code className="bg-gray-800 px-1 rounded">.env.local</code></li>
              <li>Access via <code className="bg-gray-800 px-1 rounded">process.env.YOUR_KEY</code></li>
              <li>Add <code className="bg-gray-800 px-1 rounded">.env.local</code> to <code className="bg-gray-800 px-1 rounded">.gitignore</code></li>
              <li>Never commit credentials to git repositories</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Suspicious - medium issues
  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500">Security Review Needed</AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-gray-300">
          {scanResult.warnings.length} potential security issue(s) detected. 
          Please review before deployment.
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
            View Details
          </summary>
          <div className="mt-2 space-y-1 text-gray-400">
            {scanResult.warnings.map((warning, index) => (
              <div key={index} className="border-l-2 border-yellow-500/30 pl-2">
                • {warning.pattern} at line {warning.line}
              </div>
            ))}
          </div>
        </details>
      </AlertDescription>
    </Alert>
  );
}
