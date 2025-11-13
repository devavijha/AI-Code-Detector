/*
  # AI Code Detection System Schema

  1. New Tables
    - `code_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `code_content` (text) - The submitted code
      - `language` (text) - Programming language
      - `file_name` (text) - Original file name
      - `created_at` (timestamptz)
    
    - `detection_results`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references code_submissions)
      - `ai_probability` (decimal) - Likelihood of AI generation (0-100)
      - `detection_method` (text) - Method used for detection
      - `confidence_score` (decimal) - Confidence in the result
      - `analysis_details` (jsonb) - Detailed analysis breakdown
      - `created_at` (timestamptz)
    
    - `code_patterns`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references code_submissions)
      - `pattern_type` (text) - Type of pattern detected
      - `pattern_name` (text) - Name of the pattern
      - `severity` (text) - high, medium, low
      - `description` (text) - Pattern description
      - `line_numbers` (jsonb) - Array of affected line numbers
      - `created_at` (timestamptz)
    
    - `developer_suggestions`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references code_submissions)
      - `suggestion_type` (text) - refactor, security, performance, style
      - `title` (text) - Suggestion title
      - `description` (text) - Detailed suggestion
      - `code_snippet` (text) - Suggested code improvement
      - `priority` (text) - high, medium, low
      - `applied` (boolean) - Whether suggestion was applied
      - `created_at` (timestamptz)
    
    - `analysis_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_name` (text) - Name of the analysis session
      - `total_submissions` (integer) - Count of code submissions
      - `avg_ai_probability` (decimal) - Average AI probability across submissions
      - `status` (text) - active, completed, archived
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own submissions and results
    - Authenticated users required for all operations
*/

CREATE TABLE IF NOT EXISTS code_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  code_content text NOT NULL,
  language text NOT NULL,
  file_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detection_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES code_submissions ON DELETE CASCADE NOT NULL,
  ai_probability decimal(5,2) NOT NULL,
  detection_method text NOT NULL,
  confidence_score decimal(5,2) NOT NULL,
  analysis_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS code_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES code_submissions ON DELETE CASCADE NOT NULL,
  pattern_type text NOT NULL,
  pattern_name text NOT NULL,
  severity text DEFAULT 'medium',
  description text DEFAULT '',
  line_numbers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS developer_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES code_submissions ON DELETE CASCADE NOT NULL,
  suggestion_type text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  code_snippet text DEFAULT '',
  priority text DEFAULT 'medium',
  applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  session_name text NOT NULL,
  total_submissions integer DEFAULT 0,
  avg_ai_probability decimal(5,2) DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own code submissions"
  ON code_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code submissions"
  ON code_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own code submissions"
  ON code_submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view detection results for own submissions"
  ON detection_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = detection_results.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert detection results for own submissions"
  ON detection_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = detection_results.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view code patterns for own submissions"
  ON code_patterns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = code_patterns.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert code patterns for own submissions"
  ON code_patterns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = code_patterns.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view suggestions for own submissions"
  ON developer_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = developer_suggestions.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert suggestions for own submissions"
  ON developer_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = developer_suggestions.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update suggestions for own submissions"
  ON developer_suggestions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = developer_suggestions.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_submissions
      WHERE code_submissions.id = developer_suggestions.submission_id
      AND code_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own analysis sessions"
  ON analysis_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis sessions"
  ON analysis_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis sessions"
  ON analysis_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_code_submissions_user_id ON code_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_results_submission_id ON detection_results(submission_id);
CREATE INDEX IF NOT EXISTS idx_code_patterns_submission_id ON code_patterns(submission_id);
CREATE INDEX IF NOT EXISTS idx_developer_suggestions_submission_id ON developer_suggestions(submission_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);