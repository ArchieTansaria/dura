# DURA Frontend

A modern, minimal frontend for DURA (Dependency Update Risk Analyzer) built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 **Glassmorphism UI** - Beautiful frosted glass cards with dark theme
- 🦖 **DURA Branding** - Modern Web3/crypto aesthetic
- ⚡ **Fast & Responsive** - Optimized for all screen sizes
- 🎭 **Smooth Animations** - Powered by Framer Motion
- 📊 **Risk Analysis** - Visual risk summaries with animated counters
- 📦 **Dependency Lists** - Expandable dependency cards with detailed information
- 💡 **Recommendations** - AI-powered update recommendations
- 📥 **Export Options** - Copy JSON or download reports

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Express** backend API (see `/server`)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- DURA CLI installed globally (`npm install -g dura-kit`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend expects a backend API server running on port 3001 (or configured via `VITE_API_URL`).

### Start the API Server

In a separate terminal, from the project root:

```bash
cd server
npm install
npm start
```

The API server will run on `http://localhost:3001`

### API Endpoints

- `POST /api/analyze` - Analyze a GitHub repository
  - Body: `{ repoUrl: string, branch?: string }`
  - Returns: Array of dependency analysis results

- `GET /api/health` - Health check endpoint

## Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
client/
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── RiskSummary.tsx
│   │   ├── DependencyList.tsx
│   │   ├── Recommendations.tsx
│   │   ├── Footer.tsx
│   │   ├── GlassCard.tsx
│   │   └── ResultsActions.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── dura.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json
```

## Design System

### Colors

- Background: `#0a0a0a` to `#1a1a1a`
- Accent: `#00d4ff` (cyan) and `#8b5cf6` (purple)
- High Risk: `#ef4444` (red)
- Medium Risk: `#f59e0b` (amber)
- Low Risk: `#10b981` (green)

### Glassmorphism

Cards use the `.glass` utility class with:
- `backdrop-filter: blur(10px)`
- `background: rgba(255, 255, 255, 0.05)`
- `border: 1px solid rgba(255, 255, 255, 0.1)`

## Development

### Adding New Components

1. Create component in `src/components/`
2. Use TypeScript for type safety
3. Follow the glassmorphism design pattern
4. Add Framer Motion animations for polish

### Styling

- Use Tailwind utility classes
- Extend theme in `tailwind.config.js`
- Add custom utilities in `src/index.css`

## License

MIT
