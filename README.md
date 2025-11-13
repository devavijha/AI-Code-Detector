# AI Code Detector

A hybrid framework for detecting AI-generated code with pattern analysis and developer insights.

## Features

- 🤖 AI Code Detection using hybrid analysis
- 📊 Detailed pattern recognition
- 💡 Code improvement suggestions
- 📝 Analysis history tracking
- 🔐 Secure authentication with Supabase

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/devavijha/AI-Code-Detector.git
cd AI-Code-Detector
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings under "API".

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration script from `supabase/migrations/20251112164603_create_code_detection_schema.sql`

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Sign In**: Create an account or log in with existing credentials
2. **Paste Code**: Enter the code you want to analyze in the code editor
3. **Select Language**: Choose the programming language
4. **Analyze**: Click the analyze button to get results
5. **Review Results**: View AI probability, detected patterns, and improvement suggestions
6. **Check History**: Access your previous analyses in the history panel

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication & Database)
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/        # React components
│   ├── AnalysisResults.tsx
│   ├── AuthForm.tsx
│   ├── CodeEditor.tsx
│   ├── Dashboard.tsx
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   └── HistoryPanel.tsx
├── services/         # Business logic
│   ├── codeAnalysisService.ts
│   ├── detectionEngine.ts
│   ├── patternAnalyzer.ts
│   └── suggestionGenerator.ts
├── lib/             # Utilities
│   └── supabase.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Troubleshooting

### White Screen on Load

If you see a white screen:

1. Check browser console for errors (F12)
2. Verify `.env` file has correct Supabase credentials
3. Ensure Supabase database migrations are run
4. Try clearing browser cache and reloading

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
