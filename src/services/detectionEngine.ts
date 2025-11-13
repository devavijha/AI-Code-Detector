interface DetectionResult {
  aiProbability: number;
  detectionMethod: string;
  confidenceScore: number;
  analysisDetails: {
    commentDensity: number;
    codeStructureScore: number;
    namingPatternScore: number;
    complexityScore: number;
    uniformityScore: number;
  };
}

export class DetectionEngine {
  analyzeCode(code: string, language: string): DetectionResult {
    const commentDensity = this.calculateCommentDensity(code);
    const codeStructureScore = this.analyzeCodeStructure(code);
    const namingPatternScore = this.analyzeNamingPatterns(code);
    const complexityScore = this.analyzeComplexity(code);
    const uniformityScore = this.analyzeUniformity(code);

    const aiProbability = this.calculateAIProbability({
      commentDensity,
      codeStructureScore,
      namingPatternScore,
      complexityScore,
      uniformityScore,
    });

    const confidenceScore = this.calculateConfidence({
      commentDensity,
      codeStructureScore,
      namingPatternScore,
      complexityScore,
      uniformityScore,
    });

    return {
      aiProbability: Math.round(aiProbability * 100) / 100,
      detectionMethod: 'hybrid-analysis',
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      analysisDetails: {
        commentDensity: Math.round(commentDensity * 100) / 100,
        codeStructureScore: Math.round(codeStructureScore * 100) / 100,
        namingPatternScore: Math.round(namingPatternScore * 100) / 100,
        complexityScore: Math.round(complexityScore * 100) / 100,
        uniformityScore: Math.round(uniformityScore * 100) / 100,
      },
    };
  }

  private calculateCommentDensity(code: string): number {
    const lines = code.split('\n');
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('#');
    }).length;

    const totalLines = lines.filter(line => line.trim().length > 0).length;
    if (totalLines === 0) return 0;

    const density = (commentLines / totalLines) * 100;
    return density > 30 ? 75 : density < 5 ? 20 : 50;
  }

  private analyzeCodeStructure(code: string): number {
    const hasConsistentIndentation = this.checkIndentation(code);
    const hasProperSpacing = this.checkSpacing(code);
    const hasLogicalBlocks = this.checkLogicalBlocks(code);

    const structureScore = (
      (hasConsistentIndentation ? 33 : 0) +
      (hasProperSpacing ? 33 : 0) +
      (hasLogicalBlocks ? 34 : 0)
    );

    return structureScore > 80 ? 70 : structureScore < 40 ? 30 : 50;
  }

  private checkIndentation(code: string): boolean {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const indentationPattern = /^(\s*)/;
    const indents = lines.map(line => {
      const match = line.match(indentationPattern);
      return match ? match[1].length : 0;
    });

    const uniqueIndents = new Set(indents.filter(i => i > 0));
    return uniqueIndents.size <= 6;
  }

  private checkSpacing(code: string): boolean {
    const properSpacingPatterns = [
      /\s*=\s*/,
      /\s*\+\s*/,
      /\s*-\s*/,
      /\s*\*\s*/,
      /\{\s*$/,
      /\}\s*$/,
    ];

    let matchCount = 0;
    properSpacingPatterns.forEach(pattern => {
      if (pattern.test(code)) matchCount++;
    });

    return matchCount >= 3;
  }

  private checkLogicalBlocks(code: string): boolean {
    const functionPattern = /function\s+\w+|const\s+\w+\s*=\s*\(|class\s+\w+/g;
    const matches = code.match(functionPattern);
    return matches ? matches.length >= 1 : false;
  }

  private analyzeNamingPatterns(code: string): number {
    const camelCasePattern = /\b[a-z][a-zA-Z0-9]*\b/g;
    const descriptiveNamePattern = /\b[a-z]{4,}[A-Z][a-z]+\b/g;

    const camelCaseMatches = code.match(camelCasePattern) || [];
    const descriptiveMatches = code.match(descriptiveNamePattern) || [];

    const namingScore = Math.min(
      ((descriptiveMatches.length / Math.max(camelCaseMatches.length, 1)) * 100),
      100
    );

    return namingScore > 40 ? 65 : namingScore < 10 ? 35 : 50;
  }

  private analyzeComplexity(code: string): number {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

    const controlFlowKeywords = ['if', 'else', 'for', 'while', 'switch', 'case'];
    let controlFlowCount = 0;
    controlFlowKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) controlFlowCount += matches.length;
    });

    const complexityRatio = controlFlowCount / lines.length;

    if (avgLineLength > 80 && complexityRatio > 0.2) return 70;
    if (avgLineLength < 30 && complexityRatio < 0.1) return 40;
    return 55;
  }

  private analyzeUniformity(code: string): number {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const lineLengths = lines.map(line => line.length);

    const avg = lineLengths.reduce((sum, len) => sum + len, 0) / lineLengths.length;
    const variance = lineLengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lineLengths.length;
    const stdDev = Math.sqrt(variance);

    const uniformityScore = stdDev < 20 ? 75 : stdDev > 50 ? 40 : 55;
    return uniformityScore;
  }

  private calculateAIProbability(scores: {
    commentDensity: number;
    codeStructureScore: number;
    namingPatternScore: number;
    complexityScore: number;
    uniformityScore: number;
  }): number {
    const weights = {
      commentDensity: 0.15,
      codeStructureScore: 0.25,
      namingPatternScore: 0.20,
      complexityScore: 0.20,
      uniformityScore: 0.20,
    };

    const probability = (
      scores.commentDensity * weights.commentDensity +
      scores.codeStructureScore * weights.codeStructureScore +
      scores.namingPatternScore * weights.namingPatternScore +
      scores.complexityScore * weights.complexityScore +
      scores.uniformityScore * weights.uniformityScore
    );

    return Math.max(0, Math.min(100, probability));
  }

  private calculateConfidence(scores: {
    commentDensity: number;
    codeStructureScore: number;
    namingPatternScore: number;
    complexityScore: number;
    uniformityScore: number;
  }): number {
    const values = Object.values(scores);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const confidence = 100 - (stdDev * 1.5);
    return Math.max(50, Math.min(100, confidence));
  }
}

export const detectionEngine = new DetectionEngine();
