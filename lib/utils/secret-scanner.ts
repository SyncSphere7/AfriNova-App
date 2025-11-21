/**
 * Secret Scanner Utility
 * Scans generated code for potential API keys, secrets, and credentials
 * Part of AfriNova's security layer to prevent credential leaks
 */

export interface SecretScanResult {
  hasSecrets: boolean;
  warnings: SecretWarning[];
  score: 'safe' | 'suspicious' | 'dangerous';
}

export interface SecretWarning {
  type: 'api_key' | 'password' | 'token' | 'connection_string' | 'private_key' | 'certificate';
  pattern: string;
  line: number;
  column: number;
  snippet: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

/**
 * Patterns to detect potential secrets
 * These are common patterns found in leaked credentials
 */
const SECRET_PATTERNS = [
  // API Keys
  { regex: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'api_key' as const, severity: 'critical' as const, name: 'API Key' },
  { regex: /['"]?apikey['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'api_key' as const, severity: 'critical' as const, name: 'API Key' },
  { regex: /sk[-_][a-zA-Z0-9]{20,}/g, type: 'api_key' as const, severity: 'critical' as const, name: 'Secret Key (sk-)' },
  { regex: /pk[-_][a-zA-Z0-9]{20,}/g, type: 'api_key' as const, severity: 'high' as const, name: 'Public Key (pk-)' },
  
  // Passwords
  { regex: /['"]?password['"]?\s*[:=]\s*['"][^'"]{3,}['"]/gi, type: 'password' as const, severity: 'critical' as const, name: 'Password' },
  { regex: /['"]?passwd['"]?\s*[:=]\s*['"][^'"]{3,}['"]/gi, type: 'password' as const, severity: 'critical' as const, name: 'Password' },
  { regex: /['"]?pwd['"]?\s*[:=]\s*['"][^'"]{3,}['"]/gi, type: 'password' as const, severity: 'critical' as const, name: 'Password' },
  
  // Tokens
  { regex: /['"]?token['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'token' as const, severity: 'critical' as const, name: 'Token' },
  { regex: /['"]?access[_-]?token['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'token' as const, severity: 'critical' as const, name: 'Access Token' },
  { regex: /['"]?refresh[_-]?token['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'token' as const, severity: 'critical' as const, name: 'Refresh Token' },
  { regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, type: 'token' as const, severity: 'critical' as const, name: 'Bearer Token' },
  
  // Secret Keys
  { regex: /['"]?secret[_-]?key['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'api_key' as const, severity: 'critical' as const, name: 'Secret Key' },
  { regex: /['"]?client[_-]?secret['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'api_key' as const, severity: 'critical' as const, name: 'Client Secret' },
  { regex: /['"]?consumer[_-]?secret['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'api_key' as const, severity: 'critical' as const, name: 'Consumer Secret' },
  
  // Connection Strings
  { regex: /postgresql:\/\/[^'";\s]+/gi, type: 'connection_string' as const, severity: 'critical' as const, name: 'PostgreSQL Connection' },
  { regex: /mysql:\/\/[^'";\s]+/gi, type: 'connection_string' as const, severity: 'critical' as const, name: 'MySQL Connection' },
  { regex: /mongodb(\+srv)?:\/\/[^'";\s]+/gi, type: 'connection_string' as const, severity: 'critical' as const, name: 'MongoDB Connection' },
  { regex: /redis:\/\/[^'";\s]+/gi, type: 'connection_string' as const, severity: 'critical' as const, name: 'Redis Connection' },
  
  // Database URLs
  { regex: /['"]?database[_-]?url['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'connection_string' as const, severity: 'critical' as const, name: 'Database URL' },
  
  // Private Keys (PEM format)
  { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi, type: 'private_key' as const, severity: 'critical' as const, name: 'Private Key' },
  { regex: /-----BEGIN\s+CERTIFICATE-----/gi, type: 'certificate' as const, severity: 'high' as const, name: 'Certificate' },
  
  // AWS
  { regex: /AKIA[0-9A-Z]{16}/g, type: 'api_key' as const, severity: 'critical' as const, name: 'AWS Access Key' },
  
  // Stripe
  { regex: /sk_live_[0-9a-zA-Z]{24,}/g, type: 'api_key' as const, severity: 'critical' as const, name: 'Stripe Live Secret Key' },
  { regex: /sk_test_[0-9a-zA-Z]{24,}/g, type: 'api_key' as const, severity: 'high' as const, name: 'Stripe Test Secret Key' },
  { regex: /rk_live_[0-9a-zA-Z]{24,}/g, type: 'api_key' as const, severity: 'critical' as const, name: 'Stripe Restricted Key' },
  
  // GitHub
  { regex: /ghp_[a-zA-Z0-9]{36,}/g, type: 'token' as const, severity: 'critical' as const, name: 'GitHub Personal Access Token' },
  { regex: /gho_[a-zA-Z0-9]{36,}/g, type: 'token' as const, severity: 'critical' as const, name: 'GitHub OAuth Token' },
  { regex: /ghs_[a-zA-Z0-9]{36,}/g, type: 'token' as const, severity: 'critical' as const, name: 'GitHub Server Token' },
  
  // SendGrid
  { regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, type: 'api_key' as const, severity: 'critical' as const, name: 'SendGrid API Key' },
  
  // JWT (only if looks like real token, not example)
  { regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, type: 'token' as const, severity: 'high' as const, name: 'JWT Token' },
];

/**
 * Safe patterns that should NOT trigger warnings
 * These are common placeholder patterns used in documentation
 */
const SAFE_PATTERNS = [
  /process\.env\./gi,
  /env\./gi,
  /your[_-]?key[_-]?here/gi,
  /your[_-]?secret[_-]?here/gi,
  /your[_-]?password[_-]?here/gi,
  /your[_-]?token[_-]?here/gi,
  /xxx+/gi,
  /\*\*\*+/gi,
  /\.\.\.+/gi,
  /example\.com/gi,
  /localhost/gi,
  /127\.0\.0\.1/gi,
  /test[_-]?(key|secret|token)/gi,
  /fake[_-]?(key|secret|token)/gi,
  /mock[_-]?(key|secret|token)/gi,
  /placeholder/gi,
  /CHANGE[_-]?ME/gi,
  /TODO/gi,
  /FIXME/gi,
];

/**
 * Check if a matched pattern is actually a safe placeholder
 */
function isSafePlaceholder(match: string): boolean {
  return SAFE_PATTERNS.some(pattern => pattern.test(match));
}

/**
 * Scan code for potential secrets
 * @param code - The code to scan
 * @param filename - Optional filename for context
 * @returns Scan results with warnings and severity score
 */
export function scanForSecrets(code: string, filename?: string): SecretScanResult {
  const warnings: SecretWarning[] = [];
  const lines = code.split('\n');

  SECRET_PATTERNS.forEach(({ regex, type, severity, name }) => {
    let match;
    const globalRegex = new RegExp(regex.source, regex.flags);
    
    while ((match = globalRegex.exec(code)) !== null) {
      const matchText = match[0];
      
      // Skip if it's a safe placeholder
      if (isSafePlaceholder(matchText)) {
        continue;
      }

      // Find line and column
      const beforeMatch = code.substring(0, match.index);
      const line = beforeMatch.split('\n').length;
      const column = match.index - beforeMatch.lastIndexOf('\n');
      
      // Get surrounding context (3 lines)
      const contextStart = Math.max(0, line - 2);
      const contextEnd = Math.min(lines.length, line + 1);
      const snippet = lines.slice(contextStart, contextEnd).join('\n');

      warnings.push({
        type,
        pattern: name,
        line,
        column,
        snippet,
        severity,
        suggestion: getSuggestion(type, matchText),
      });
    }
  });

  // Determine overall score
  let score: 'safe' | 'suspicious' | 'dangerous' = 'safe';
  if (warnings.length > 0) {
    const hasCritical = warnings.some(w => w.severity === 'critical');
    const hasHigh = warnings.some(w => w.severity === 'high');
    
    if (hasCritical) {
      score = 'dangerous';
    } else if (hasHigh || warnings.length >= 3) {
      score = 'suspicious';
    } else {
      score = 'suspicious';
    }
  }

  return {
    hasSecrets: warnings.length > 0,
    warnings,
    score,
  };
}

/**
 * Get remediation suggestion for detected secret
 */
function getSuggestion(type: SecretWarning['type'], match: string): string {
  const suggestions: Record<SecretWarning['type'], string> = {
    api_key: '🔒 Move to .env.local: API_KEY=your_key_here\nAccess via: process.env.API_KEY',
    password: '🔒 Move to .env.local: PASSWORD=your_password\nNever hardcode passwords!',
    token: '🔒 Move to .env.local: TOKEN=your_token\nAccess via: process.env.TOKEN',
    connection_string: '🔒 Move to .env.local: DATABASE_URL=your_connection_string\nNever expose database credentials!',
    private_key: '🔒 Store private keys in secure key management service (AWS KMS, Azure Key Vault, etc.)\nNever commit private keys to git!',
    certificate: '🔒 Store certificates securely, not in code. Use environment variables or secret management.',
  };

  return suggestions[type];
}

/**
 * Format scan results for display to user
 */
export function formatScanResults(results: SecretScanResult): string {
  if (!results.hasSecrets) {
    return '✅ No secrets detected. Code is safe!';
  }

  const emoji = {
    safe: '✅',
    suspicious: '⚠️',
    dangerous: '🚨',
  };

  let output = `${emoji[results.score]} Security Scan: ${results.warnings.length} potential secret(s) detected!\n\n`;

  results.warnings.forEach((warning, index) => {
    const severityEmoji = {
      low: '📝',
      medium: '⚠️',
      high: '🔶',
      critical: '🚨',
    };

    output += `${index + 1}. ${severityEmoji[warning.severity]} ${warning.pattern} (${warning.severity.toUpperCase()})\n`;
    output += `   Line ${warning.line}, Column ${warning.column}\n`;
    output += `   ${warning.suggestion}\n\n`;
  });

  output += '\n🔒 SECURITY REMINDER:\n';
  output += '- Add .env.local to .gitignore\n';
  output += '- Use environment variables for ALL secrets\n';
  output += '- Never commit credentials to git\n';
  output += '- Rotate any exposed credentials immediately\n';

  return output;
}

/**
 * Quick check if code contains obvious secrets (for fast validation)
 */
export function hasObviousSecrets(code: string): boolean {
  const quickPatterns = [
    /sk[-_][a-zA-Z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /ghp_[a-zA-Z0-9]{36,}/,
    /SG\.[a-zA-Z0-9_-]{22}\./,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
  ];

  return quickPatterns.some(pattern => {
    const match = code.match(pattern);
    return match && !isSafePlaceholder(match[0]);
  });
}
