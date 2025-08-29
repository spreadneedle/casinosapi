# GrokCasino.online

A simple Node.js Express application that provides casino bonus information and recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Endpoints

### GET /bonus
Returns casino bonuses filtered by location.

Query Parameters:
- `location` (required): The country to filter casinos by (e.g., "Sweden", "Finland")

Example:
```
GET /bonus?location=Sweden
```

### GET /recommendations
Returns an HTML page with all available casino recommendations.

Example:
```
GET /recommendations
```

## Port
The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable. 
