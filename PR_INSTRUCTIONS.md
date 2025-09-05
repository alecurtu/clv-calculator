# PR Instructions (Configs + UI)
This folder contains the updated files needed to fix your build and ship the CLV app.

## What to **add/replace**
Copy these files to your repo root (overwrite if they exist):
- `next.config.mjs`
- `postcss.config.js`
- `package.json`
- `tailwind.config.ts`
- `tsconfig.json`
- `.env.example`
- `.gitignore`
- `app/**` (layout, page, API route, styles)
- `components/**` (BannerBar, ScoreTicker, CLVCalculator)
- `lib/**` (banners, odds)
- `public/**` (banner placeholders, favicon)

## What to **delete** (if present)
- `next.config.ts`
- `postcss.config.ts`

## Create a PR
```bash
git checkout -b clv-config-fixes
# copy these files into your repo, then:
git add -A
git commit -m "fix: Next/PostCSS configs + CLV UI, banners, and ESPN ticker"
git push -u origin clv-config-fixes
```
Then open a Pull Request on GitHub from `clv-config-fixes` → `main`.
