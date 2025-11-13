import { supabase } from '../lib/supabase';
import { detectionEngine } from './detectionEngine';
import { patternAnalyzer } from './patternAnalyzer';
import { suggestionGenerator } from './suggestionGenerator';

export interface AnalysisResult {
  submissionId: string;
  aiProbability: number;
  confidenceScore: number;
  patterns: Array<{
    type: string;
    name: string;
    severity: string;
    description: string;
  }>;
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
}

export async function analyzeCode(
  code: string,
  language: string,
  fileName: string,
  userId: string
): Promise<AnalysisResult> {
  const { data: submission, error: submissionError } = await supabase
    .from('code_submissions')
    .insert({
      user_id: userId,
      code_content: code,
      language,
      file_name: fileName,
    })
    .select()
    .single();

  if (submissionError || !submission) {
    throw new Error('Failed to create code submission');
  }

  const detectionResult = detectionEngine.analyzeCode(code, language);
  const patterns = patternAnalyzer.detectPatterns(code, language);
  const suggestions = suggestionGenerator.generateSuggestions(code, language);

  await supabase.from('detection_results').insert({
    submission_id: submission.id,
    ai_probability: detectionResult.aiProbability,
    detection_method: detectionResult.detectionMethod,
    confidence_score: detectionResult.confidenceScore,
    analysis_details: detectionResult.analysisDetails,
  });

  if (patterns.length > 0) {
    await supabase.from('code_patterns').insert(
      patterns.map(pattern => ({
        submission_id: submission.id,
        pattern_type: pattern.patternType,
        pattern_name: pattern.patternName,
        severity: pattern.severity,
        description: pattern.description,
        line_numbers: pattern.lineNumbers,
      }))
    );
  }

  if (suggestions.length > 0) {
    await supabase.from('developer_suggestions').insert(
      suggestions.map(suggestion => ({
        submission_id: submission.id,
        suggestion_type: suggestion.suggestionType,
        title: suggestion.title,
        description: suggestion.description,
        code_snippet: suggestion.codeSnippet,
        priority: suggestion.priority,
      }))
    );
  }

  return {
    submissionId: submission.id,
    aiProbability: detectionResult.aiProbability,
    confidenceScore: detectionResult.confidenceScore,
    patterns: patterns.map(p => ({
      type: p.patternType,
      name: p.patternName,
      severity: p.severity,
      description: p.description,
    })),
    suggestions: suggestions.map(s => ({
      type: s.suggestionType,
      title: s.title,
      description: s.description,
      priority: s.priority,
    })),
  };
}

export async function getSubmissionDetails(submissionId: string, userId: string) {
  const { data: submission, error: submissionError } = await supabase
    .from('code_submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (submissionError || !submission) {
    throw new Error('Submission not found');
  }

  const { data: detection } = await supabase
    .from('detection_results')
    .select('*')
    .eq('submission_id', submissionId)
    .maybeSingle();

  const { data: patterns } = await supabase
    .from('code_patterns')
    .select('*')
    .eq('submission_id', submissionId);

  const { data: suggestions } = await supabase
    .from('developer_suggestions')
    .select('*')
    .eq('submission_id', submissionId);

  return {
    submission,
    detection,
    patterns: patterns || [],
    suggestions: suggestions || [],
  };
}

export async function getUserSubmissions(userId: string) {
  const { data, error } = await supabase
    .from('code_submissions')
    .select(`
      *,
      detection_results(ai_probability, confidence_score)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch submissions');
  }

  return data;
}
