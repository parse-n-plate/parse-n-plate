# Parse & Plate

A Next.js application that parses recipe URLs and extracts ingredients and instructions using a hybrid approach of HTML scraping and AI processing.

## Features

- **Recipe URL Parsing**: Extract recipes from popular cooking websites
- **Hybrid Parsing**: Combines intelligent HTML scraping with AI (Groq) for maximum accuracy
- **Recent Recipes**: Track and display your recently parsed recipes
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Modern UI with Tailwind CSS and Shadcn components

## Getting Started

Install node dependencies:

```bash
npm install
```

## Environment Setup

Create a `.env.local` file in the root directory with your Groq API key:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### Groq API Setup

1. **Get a Groq API Key**:
   - Sign up at [https://console.groq.com/](https://console.groq.com/)
   - Create an API key in your dashboard

2. **Accept Terms and Conditions**:
   - Some Groq models require terms acceptance
   - If you encounter a "model_terms_required" error, visit the model playground to accept terms
   - For example: [https://console.groq.com/playground?model=qwen/qwen3-32b](https://console.groq.com/playground?model=qwen/qwen3-32b)
   - The app uses `qwen/qwen3-32b` by default

Next, start up development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui, Lucide React icons
- **Backend**: Next.js API Routes (Serverless Functions)
- **HTML Parsing**: Cheerio, Axios
- **AI/ML**: Groq AI API (qwen/qwen3-32b, llama3-8b-8192 models)
- **Data Persistence**: localStorage for recent recipes
- **Error Handling**: Structured error responses, error logging system

## Infrastructure

- **Hosting**: Vercel (serverless)
- **Deployment**: Automatic via Vercel (Git push)
- **CI**: GitHub Actions for linting
- **Functions**: Vercel Serverless Functions

## Error Handling System

The application includes a comprehensive error handling system:

### Error Types

- **Invalid URLs**: Validates URL format and supported domains
- **Network Errors**: Handles fetch failures and timeouts
- **Parsing Errors**: Manages AI parsing failures gracefully
- **User Feedback**: Clear, actionable error messages

### Error Logging

- **localStorage Persistence**: Stores last 50 errors for debugging
- **Structured Logging**: Timestamp, error code, message, URL, user agent
- **Export Functionality**: JSON export for debugging sessions

## Node.js Version

This project uses [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions. The required version is specified in the `.nvmrc` file.

**Before running or developing locally:**

```bash
nvm install # installs the version in .nvmrc
nvm use     # switches to the correct version
```

If you use Husky or pre-commit hooks, make sure your shell session is using the correct Node version (`nvm use`).

For CI/CD (e.g., GitHub Actions), ensure the workflow uses the Node version in `.nvmrc`.

## Recent Updates

### Error Handling & User Feedback (Latest)

- Implemented comprehensive error handling across all API routes
- Added user-friendly error messages with retry functionality
- Created error logging system with localStorage persistence
- Enhanced search form with structured error responses
- Added error display component with visual feedback

### Recent Recipes Feature

- Added recent recipes tracking with localStorage persistence
- Implemented React Context for state management
- Created RecentRecipesList component with card-based UI
- Added relative time formatting for recipe timestamps

### Recipe Parsing Improvements

- Migrated from Python to Node.js for better Vercel compatibility
- Enhanced scraper with comprehensive selectors for major recipe sites
- Improved AI prompt formatting for better JSON responses
- Added robust JSON extraction from AI responses
- Implemented multi-layer parsing with JSON-LD and HTML fallbacks

## Documentation

For detailed technical information, see [TECHNICAL_SUMMARY.md](./TECHNICAL_SUMMARY.md).
