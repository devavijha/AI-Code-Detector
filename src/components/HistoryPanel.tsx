import { History, FileCode, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserSubmissions } from '../services/codeAnalysisService';

interface Submission {
  id: string;
  file_name: string;
  language: string;
  created_at: string;
  detection_results: Array<{
    ai_probability: number;
    confidence_score: number;
  }>;
}

interface HistoryPanelProps {
  userId: string;
  onSelectSubmission: (submissionId: string) => void;
}

export function HistoryPanel({ userId, onSelectSubmission }: HistoryPanelProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [userId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getUserSubmissions(userId);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600 bg-red-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <History className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">
            Analysis History
          </h2>
          <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            {submissions.length}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {submissions.length === 0 ? (
          <div className="p-8 text-center">
            <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Submit your first code for analysis
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => {
              const result = submission.detection_results[0];
              return (
                <button
                  key={submission.id}
                  onClick={() => onSelectSubmission(submission.id)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="font-medium text-gray-900 truncate">
                          {submission.file_name || 'Untitled'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {submission.language}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(submission.created_at)}</span>
                        </span>
                      </div>
                    </div>
                    {result && (
                      <div className="ml-4 flex-shrink-0">
                        <span className={`text-sm font-bold px-2.5 py-1 rounded ${getProbabilityColor(result.ai_probability)}`}>
                          {result.ai_probability.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
