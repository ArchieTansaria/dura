# DURA API Server

Express.js API server for the DURA frontend. Provides REST endpoints to analyze GitHub repositories using the DURA CLI.

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm start
```

The server will start on `http://localhost:3001` by default.

### Environment Variables

Create a `.env` file (optional):

```env
PORT=3001
```

## API Endpoints

### POST /api/analyze

Analyze a GitHub repository for dependency update risks.

**Request Body:**
```json
{
  "repoUrl": "https://github.com/facebook/react",
  "branch": "main"
}
```

**Response:**
```json
[
  {
    "name": "react",
    "type": "prod",
    "currentRange": "^18.0.0",
    "currentResolved": "18.0.0",
    "latest": "18.2.0",
    "diff": "minor",
    "breaking": false,
    "releaseKeywords": [],
    "githubRepoUrl": "https://github.com/facebook/react",
    "riskScore": 10,
    "riskLevel": "low"
  }
]
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "DURA API is running"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `400` - Bad Request (missing/invalid parameters)
- `500` - Internal Server Error (analysis failed)
- `504` - Gateway Timeout (analysis took too long)

## Requirements

- Node.js 18+
- DURA CLI installed and accessible
- The CLI should be at `../cli/bin/dura.js` relative to this server

## License

MIT
