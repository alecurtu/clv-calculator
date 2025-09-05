# NFL CLV Calculator — Neon UI + Dark/Light Mode

Next.js 14 app with Tailwind, a neon-themed UI, dark/light mode toggle, live NFL score ticker (ESPN), and a CLV calculator for totals.

## Run locally
```bash
npm ci
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

## Production build
```bash
npm run build && npm start
```

## Notes
- Dark mode is class-based (`darkMode: 'class'`); a toggle stores preference in `localStorage`.
- Styles use glass + neon glow (see `app/globals.css`).
- Score ticker background is a neon gradient.
