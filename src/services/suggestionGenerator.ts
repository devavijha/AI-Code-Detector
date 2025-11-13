export interface DeveloperSuggestion {
  suggestionType: 'refactor' | 'security' | 'performance' | 'style';
  title: string;
  description: string;
  codeSnippet: string;
  priority: 'high' | 'medium' | 'low';
}

export class SuggestionGenerator {
  generateSuggestions(code: string, language: string): DeveloperSuggestion[] {
    const suggestions: DeveloperSuggestion[] = [];

    suggestions.push(...this.generateRefactoringSuggestions(code));
    suggestions.push(...this.generateSecuritySuggestions(code));
    suggestions.push(...this.generatePerformanceSuggestions(code));
    suggestions.push(...this.generateStyleSuggestions(code));

    return suggestions;
  }

  private generateRefactoringSuggestions(code: string): DeveloperSuggestion[] {
    const suggestions: DeveloperSuggestion[] = [];

    if (code.includes('function') && code.length > 500) {
      suggestions.push({
        suggestionType: 'refactor',
        title: 'Extract Functions',
        description: 'Consider breaking down large functions into smaller, reusable components for better maintainability.',
        codeSnippet: `// Before:\nfunction largeFunction() {\n  // 100+ lines\n}\n\n// After:\nfunction mainFunction() {\n  validateInput();\n  processData();\n  formatOutput();\n}\n\nfunction validateInput() { ... }\nfunction processData() { ... }`,
        priority: 'medium',
      });
    }

    const duplicatePatterns = code.match(/for\s*\([^)]+\)\s*\{[^}]{50,}\}/g);
    if (duplicatePatterns && duplicatePatterns.length > 2) {
      suggestions.push({
        suggestionType: 'refactor',
        title: 'Extract Repeated Logic',
        description: 'Similar code blocks detected. Consider extracting into a reusable helper function.',
        codeSnippet: `// Extract common logic:\nfunction processItem(item) {\n  // Common processing logic\n  return transformedItem;\n}\n\n// Use in multiple places:\nitems.forEach(item => processItem(item));`,
        priority: 'medium',
      });
    }

    if (code.includes('if') && code.match(/if\s*\(/g)!.length > 5) {
      suggestions.push({
        suggestionType: 'refactor',
        title: 'Simplify Conditional Logic',
        description: 'Multiple conditional statements detected. Consider using strategy pattern or lookup tables.',
        codeSnippet: `// Instead of multiple ifs:\nconst handlers = {\n  'type1': handleType1,\n  'type2': handleType2,\n  'type3': handleType3\n};\n\nhandlers[type]?.();`,
        priority: 'low',
      });
    }

    return suggestions;
  }

  private generateSecuritySuggestions(code: string): DeveloperSuggestion[] {
    const suggestions: DeveloperSuggestion[] = [];

    if (/(?:password|secret|apikey)\s*=\s*['"][^'"]+['"]/gi.test(code)) {
      suggestions.push({
        suggestionType: 'security',
        title: 'Remove Hardcoded Credentials',
        description: 'Credentials should be stored in environment variables, not hardcoded in source code.',
        codeSnippet: `// Instead of:\nconst apiKey = "hardcoded-key";\n\n// Use:\nconst apiKey = import.meta.env.VITE_API_KEY;`,
        priority: 'high',
      });
    }

    if (/eval\s*\(/g.test(code)) {
      suggestions.push({
        suggestionType: 'security',
        title: 'Avoid eval()',
        description: 'Using eval() is dangerous and can lead to code injection attacks. Use safer alternatives.',
        codeSnippet: `// Instead of eval, use:\nconst result = JSON.parse(jsonString);\n// or\nconst fn = new Function('return ' + expression)();`,
        priority: 'high',
      });
    }

    if (/innerHTML\s*=/g.test(code)) {
      suggestions.push({
        suggestionType: 'security',
        title: 'XSS Risk with innerHTML',
        description: 'Using innerHTML with user input can lead to XSS attacks. Use textContent or sanitize input.',
        codeSnippet: `// Safer approach:\nelement.textContent = userInput;\n// Or use a sanitization library:\nelement.innerHTML = DOMPurify.sanitize(userInput);`,
        priority: 'high',
      });
    }

    return suggestions;
  }

  private generatePerformanceSuggestions(code: string): DeveloperSuggestion[] {
    const suggestions: DeveloperSuggestion[] = [];

    if (/for\s*\([^)]+\)\s*\{[^}]*for\s*\(/g.test(code)) {
      suggestions.push({
        suggestionType: 'performance',
        title: 'Optimize Nested Loops',
        description: 'Nested loops can have O(n²) complexity. Consider using hash maps or other data structures.',
        codeSnippet: `// Instead of nested loops:\nconst map = new Map();\narray1.forEach(item => map.set(item.id, item));\narray2.forEach(item => {\n  const match = map.get(item.id);\n});`,
        priority: 'medium',
      });
    }

    if (/\.map\([^)]+\)\.filter\(/g.test(code)) {
      suggestions.push({
        suggestionType: 'performance',
        title: 'Combine Array Operations',
        description: 'Chaining map and filter creates multiple iterations. Combine them for better performance.',
        codeSnippet: `// Instead of:\narray.map(x => x * 2).filter(x => x > 10);\n\n// Use reduce:\narray.reduce((acc, x) => {\n  const doubled = x * 2;\n  if (doubled > 10) acc.push(doubled);\n  return acc;\n}, []);`,
        priority: 'low',
      });
    }

    if (/document\.querySelector|document\.getElementById/g.test(code) &&
        (code.match(/document\.querySelector|document\.getElementById/g) || []).length > 3) {
      suggestions.push({
        suggestionType: 'performance',
        title: 'Cache DOM Queries',
        description: 'Multiple DOM queries detected. Cache references to improve performance.',
        codeSnippet: `// Cache DOM references:\nconst element = document.querySelector('.my-element');\n// Reuse the cached reference\nelement.classList.add('active');`,
        priority: 'medium',
      });
    }

    return suggestions;
  }

  private generateStyleSuggestions(code: string): DeveloperSuggestion[] {
    const suggestions: DeveloperSuggestion[] = [];

    if (/var\s+\w+/.test(code)) {
      suggestions.push({
        suggestionType: 'style',
        title: 'Use const/let Instead of var',
        description: 'Modern JavaScript uses const and let for better scoping and immutability.',
        codeSnippet: `// Instead of:\nvar count = 0;\n\n// Use:\nconst count = 0; // for values that won't change\nlet counter = 0; // for values that will change`,
        priority: 'low',
      });
    }

    if (/function\s+\w+\s*\([^)]*\)\s*\{/.test(code)) {
      const arrowPossible = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]{0,50}\}/g);
      if (arrowPossible && arrowPossible.length > 0) {
        suggestions.push({
          suggestionType: 'style',
          title: 'Consider Arrow Functions',
          description: 'For simple functions, arrow functions provide cleaner syntax.',
          codeSnippet: `// Instead of:\nfunction add(a, b) {\n  return a + b;\n}\n\n// Use:\nconst add = (a, b) => a + b;`,
          priority: 'low',
        });
      }
    }

    if (code.split('\n').some(line => line.length > 120)) {
      suggestions.push({
        suggestionType: 'style',
        title: 'Line Length',
        description: 'Some lines exceed 120 characters. Break them down for better readability.',
        codeSnippet: `// Break long lines:\nconst result = veryLongFunction(\n  parameter1,\n  parameter2,\n  parameter3\n);`,
        priority: 'low',
      });
    }

    return suggestions;
  }
}

export const suggestionGenerator = new SuggestionGenerator();
