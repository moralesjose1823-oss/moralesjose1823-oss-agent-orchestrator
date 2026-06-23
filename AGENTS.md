# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`jose-agents` is a single Next.js 13 (Pages Router) app — a multi-agent personal assistant UI. There is one service: the Next.js dev server.

### Running
- Dev server: `npm run dev` (serves http://localhost:3000). Use this for development.
- Production build/run: `npm run build` then `npm run start`. Do not run `next build` while `next dev` is running — both write to `.next` and can conflict.

### Required configuration / key gotcha
- The agent chat depends on the Anthropic API. The API route `pages/api/claude.js` reads `process.env.ANTHROPIC_API_KEY`. Without it, `POST /api/claude` returns `{"error":"ANTHROPIC_API_KEY not set"}` (HTTP 500) and every agent reply shows an error, even though the UI still loads and projects can be created.
- Set the key via `.env.local` (gitignored) as `ANTHROPIC_API_KEY=...`, or as an environment variable. The model used is `claude-opus-4-5`.
- Live sports data (`fetchLiveSports`) is fetched client-side from ESPN's public API and needs no key, but the generated answer still goes through Claude, so the key is required for any visible agent output.

### State
- All projects/conversations and "team memory" persist in the browser's `localStorage` (see `lib/storage.js`), not a server DB. There is no backend persistence.

### Lint / tests
- There is no lint script and no ESLint config; `next lint` would launch an interactive setup, so do not rely on it in automation.
- There are no automated tests in this repo.
