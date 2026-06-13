<div align="center">
<img width="1200" height="475" alt="Clinical Precision Pulse" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Clinical Precision Pulse - Emergency Triage Simulator

AI-powered clinical triage simulator using Groq API for real-time patient case generation and evaluation.

## Prerequisites

- **Node.js** (v16+)
- **Groq API Key** (get one at https://console.groq.com)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Groq API Key
Create or update your `.env` file with your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
APP_URL=http://localhost:3000
```

You can get a free Groq API key from [console.groq.com](https://console.groq.com).

### 3. Run Locally
```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Features

- **AI-Generated Patient Cases**: Dynamic clinical scenarios using Groq's fast LLMs
- **Triage Evaluation**: Real-time feedback on triage decisions
- **Educational Quizzes**: Context-specific clinical questions based on cases
- **Fallback Support**: Automatic model fallback for reliability

## Supported Models

- **mixtral-8x7b-32768** (primary)
- **llama-3.1-70b-versatile** (fallback)

## Development

```bash
npm run dev    # Start dev server with Vite
npm run build  # Build for production
npm run lint   # TypeScript type checking
```

## Migration from Gemini to Groq

This project was migrated from Google Gemini to Groq for improved performance and cost efficiency. Key changes:
- Replaced `@google/genai` with `groq-sdk`
- Updated API contracts to use Groq's chat completions format
- Maintained identical response schema for frontend compatibility
- Improved retry logic with model fallback strategy
