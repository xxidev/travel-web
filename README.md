# Smart Travel Planning Website

A localized travel itinerary recommendation system that generates customized travel plans based on destination, duration, and budget.

## Features

- Intelligently generates itineraries based on destination, duration, and budget
- Automatically calculates budget allocation (accommodation, dining, transportation, etc.)
- Recommends different service tiers based on budget level
- Provides detailed daily activity schedules
- Practical travel tips
- Responsive design with mobile support
- No API key required, ready to use out of the box

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: TypeScript + HTML + CSS
- **Build Tool**: TypeScript Compiler

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

Development mode (with hot reload):

```bash
npm run dev
```

Compile TypeScript only:

```bash
npm run build
```

Watch for TypeScript file changes:

```bash
npm run watch
```

### 3. Access the Website

Open in your browser: `http://localhost:3000`

## Usage

1. Enter your travel information in the form:
   - Destination (e.g., Tokyo, Paris, Chengdu)
   - Start and end dates
   - Budget (in CNY)
   - Travel preferences (optional)

2. Click the "Generate Itinerary" button

3. The system will generate a personalized travel itinerary, including:
   - Budget allocation suggestions
   - Detailed daily schedule
   - Accommodation and dining recommendations
   - Practical travel tips

## Project Structure

```
travel/
├── index.js              # Express server and itinerary generation logic
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
├── README.md             # Project documentation
├── src/                  # TypeScript source code
│   └── app.ts            # Frontend application logic
└── public/               # Static files directory
    ├── index.html        # Main page
    ├── styles.css        # Stylesheet
    └── app.js            # Compiled JavaScript (auto-generated)
```

## Budget Tiers

The system automatically adjusts recommendations based on average daily budget:

- **< ¥300/day**: Economy - Hostels, street food, public transportation
- **¥300-600/day**: Comfort - 3-star hotels, local restaurants, occasional taxi
- **> ¥600/day**: Luxury - 4-5 star hotels, fine dining, private transportation

## Development Notes

- Frontend is written in TypeScript for type safety
- After modifying `src/app.ts`, run `npm run build` to recompile
- Use `npm run watch` to automatically watch for file changes and recompile

## License

Private
