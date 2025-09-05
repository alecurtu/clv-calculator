# PR: Remove banner + production build fixes
This overlay removes the banner component and keeps a clean, Vercel-ready Next.js 14 build.

## Replace / Add
- `next.config.mjs`, `postcss.config.js`
- `app/` (includes `layout.tsx` importing `./globals.css` and **no** banner import)
- `components/ScoreTicker.tsx`, `components/CLVCalculator.tsx`
- `lib/odds.ts`
- `tailwind.config.ts`, `tsconfig.json` (with `baseUrl`), `.env.example`, `.gitignore`

## Remove in your repo (if present)
- `components/BannerBar.tsx`
- `lib/banners.ts`
- `public/banners/*`

## Local build test
```bash
npm ci
cp .env.example .env.local
npm run build
npm start  # then open http://localhost:3000
```

## Create PR
```bash
git checkout -b clv-no-banner-prod
# copy overlay files into repo root (overwrite), delete banner files
git add -A
git commit -m "chore: remove banner; optimize prod build; ensure Tailwind loads"
git push -u origin clv-no-banner-prod
```
Open a PR from `clv-no-banner-prod` → `main`.
