import { useState } from 'react';
import { Header } from './Header';
import { CodeEditor } from './CodeEditor';
import { AnalysisResults } from './AnalysisResults';
import { HistoryPanel } from './HistoryPanel';
import { analyzeCode, getSubmissionDetails } from '../services/codeAnalysisService';
import type { AnalysisResult } from '../services/codeAnalysisService';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (code: string, language: string, fileName: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCode(code, language, fileName, user.id);
      setCurrentResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze code. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSubmission = async (submissionId: string) => {
    try {
      const details = await getSubmissionDetails(submissionId, user.id);

      if (details.detection) {
        setCurrentResult({
          submissionId: submissionId,
          aiProbability: details.detection.ai_probability,
          confidenceScore: details.detection.confidence_score,
          patterns: details.patterns.map((p: {
            pattern_type: string;
            pattern_name: string;
            severity: string;
            description: string;
          }) => ({
            type: p.pattern_type,
            name: p.pattern_name,
            severity: p.severity,
            description: p.description,
          })),
          suggestions: details.suggestions.map((s: {
            suggestion_type: string;
            title: string;
            description: string;
            priority: string;
          }) => ({
            type: s.suggestion_type,
            title: s.title,
            description: s.description,
            priority: s.priority,
          })),
        });
      }
    } catch (error) {
      console.error('Failed to load submission:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={onSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CodeEditor onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {currentResult && (
              <AnalysisResults result={currentResult} />
            )}
          </div>

          <div className="lg:col-span-1">
            <HistoryPanel
              userId={user.id}
              onSelectSubmission={handleSelectSubmission}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
