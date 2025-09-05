# NFL CLV Calculator (Next.js 14)

Production-ready app with Tailwind, live NFL score ticker (ESPN), and a CLV calculator for totals.

## Quickstart
```bash
npm ci
cp .env.example .env.local
npm run dev
# open http://localhost:3000
```

## Build
```bash
npm run build && npm start
```

## Deploy (Vercel)
- Uses `next.config.mjs` and `postcss.config.js` (no TS configs).
- Ensure Node 18 or 20 in the project settings.
- Add env vars or keep defaults from `.env.example`.
```ini
SCORES_SOURCE=espn
ESPN_SCOREBOARD_BASE=https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
SCORES_REVALIDATE=30
```
