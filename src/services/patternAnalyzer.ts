export interface CodePattern {
  patternType: string;
  patternName: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  lineNumbers: number[];
}

export class PatternAnalyzer {
  detectPatterns(code: string, language: string): CodePattern[] {
    const patterns: CodePattern[] = [];

    patterns.push(...this.detectAIPatterns(code));
    patterns.push(...this.detectStylePatterns(code));
    patterns.push(...this.detectComplexityPatterns(code));
    patterns.push(...this.detectSecurityPatterns(code));

    return patterns;
  }

  private detectAIPatterns(code: string): CodePattern[] {
    const patterns: CodePattern[] = [];
    const lines = code.split('\n');

    const excessiveCommenting = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*');
    });

    if (excessiveCommenting.length > lines.length * 0.3) {
      patterns.push({
        patternType: 'ai-indicator',
        patternName: 'Excessive Comments',
        severity: 'medium',
        description: 'High comment density may indicate AI-generated code',
        lineNumbers: excessiveCommenting.map((_, idx) => idx + 1),
      });
    }

    const perfectIndentation = lines.every(line => {
      if (line.trim().length === 0) return true;
      const spaces = line.match(/^\s*/)?.[0].length || 0;
      return spaces % 2 === 0;
    });

    if (perfectIndentation && lines.length > 10) {
      patterns.push({
        patternType: 'ai-indicator',
        patternName: 'Perfect Formatting',
        severity: 'low',
        description: 'Consistently perfect formatting across all lines',
        lineNumbers: [],
      });
    }

    const descriptiveVarPattern = /(?:const|let|var)\s+([a-z][a-zA-Z]{8,})/g;
    const matches = Array.from(code.matchAll(descriptiveVarPattern));

    if (matches.length > 5) {
      patterns.push({
        patternType: 'ai-indicator',
        patternName: 'Overly Descriptive Names',
        severity: 'low',
        description: 'Variable names are unusually descriptive and verbose',
        lineNumbers: [],
      });
    }

    return patterns;
  }

  private detectStylePatterns(code: string): CodePattern[] {
    const patterns: CodePattern[] = [];
    const lines = code.split('\n');

    const longLines = lines
      .map((line, idx) => ({ line, idx: idx + 1 }))
      .filter(({ line }) => line.length > 120);

    if (longLines.length > 0) {
      patterns.push({
        patternType: 'style',
        patternName: 'Long Lines',
        severity: 'low',
        description: 'Lines exceed recommended length of 120 characters',
        lineNumbers: longLines.map(({ idx }) => idx),
      });
    }

    const inconsistentSpacing = /\w+\+\w+|\w+\-\w+|\w+=\w+/g;
    if (inconsistentSpacing.test(code)) {
      patterns.push({
        patternType: 'style',
        patternName: 'Inconsistent Spacing',
        severity: 'low',
        description: 'Operators lack proper spacing',
        lineNumbers: [],
      });
    }

    return patterns;
  }

  private detectComplexityPatterns(code: string): CodePattern[] {
    const patterns: CodePattern[] = [];
    const lines = code.split('\n');

    const nestedBlocks = code.match(/\{\s*if|if.*\{\s*if|for.*\{\s*for/g);
    if (nestedBlocks && nestedBlocks.length > 3) {
      patterns.push({
        patternType: 'complexity',
        patternName: 'Deep Nesting',
        severity: 'high',
        description: 'Multiple levels of nested blocks increase complexity',
        lineNumbers: [],
      });
    }

    const functionPattern = /function\s+\w+|const\s+\w+\s*=\s*\(/g;
    const functions = code.match(functionPattern);

    if (functions && functions.length > 10) {
      patterns.push({
        patternType: 'complexity',
        patternName: 'Many Functions',
        severity: 'medium',
        description: 'File contains many functions, consider splitting into modules',
        lineNumbers: [],
      });
    }

    const longFunction = this.findLongFunctions(lines);
    if (longFunction.length > 0) {
      patterns.push({
        patternType: 'complexity',
        patternName: 'Long Function',
        severity: 'medium',
        description: 'Function exceeds 50 lines, consider refactoring',
        lineNumbers: longFunction,
      });
    }

    return patterns;
  }

  private detectSecurityPatterns(code: string): CodePattern[] {
    const patterns: CodePattern[] = [];

    const hardcodedSecrets = /(?:password|secret|apikey|token)\s*=\s*['"][^'"]+['"]/gi;
    if (hardcodedSecrets.test(code)) {
      patterns.push({
        patternType: 'security',
        patternName: 'Hardcoded Credentials',
        severity: 'high',
        description: 'Potential hardcoded credentials detected',
        lineNumbers: [],
      });
    }

    const sqlInjection = /['"]\s*\+\s*\w+\s*\+\s*['"].*(?:SELECT|INSERT|UPDATE|DELETE)/gi;
    if (sqlInjection.test(code)) {
      patterns.push({
        patternType: 'security',
        patternName: 'SQL Injection Risk',
        severity: 'high',
        description: 'String concatenation in SQL queries detected',
        lineNumbers: [],
      });
    }

    const evalUsage = /eval\s*\(/g;
    if (evalUsage.test(code)) {
      patterns.push({
        patternType: 'security',
        patternName: 'Eval Usage',
        severity: 'high',
        description: 'Use of eval() is a security risk',
        lineNumbers: [],
      });
    }

    return patterns;
  }

  private findLongFunctions(lines: string[]): number[] {
    const lineNumbers: number[] = [];
    let inFunction = false;
    let functionStart = 0;
    let braceCount = 0;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (/function\s+\w+|const\s+\w+\s*=\s*\(/.test(trimmed)) {
        inFunction = true;
        functionStart = idx + 1;
        braceCount = 0;
      }

      if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && trimmed.includes('}')) {
          const functionLength = idx - functionStart + 2;
          if (functionLength > 50) {
            for (let i = functionStart; i <= idx + 1; i++) {
              lineNumbers.push(i);
            }
          }
          inFunction = false;
        }
      }
    });

    return lineNumbers;
  }
}

export const patternAnalyzer = new PatternAnalyzer();
