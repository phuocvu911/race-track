# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Beachside Racetrack: a real-time race-operations MVP (school project). The full spec and grading checklist are in `data/context/task.md` and `data/context/testing.md`; that folder is gitignored, so it is local only. Graders run `npm install` then `npm start` (or `npm run dev`) on a fresh clone, so those must work with no extra steps. Real-time communication must go through Socket.IO messages: no polling, and no HTTP APIs for sending data.

## Commands

- `npm start`: builds the Svelte client (`vite build client` → `dist/`), then starts the server
- `npm run dev`: same, with `TIMER_MINUTES=1` and `node --watch` (restarts on server changes only; does not rebuild the client)
- `npm run dev:client`: Vite dev server with HMR (port 5173); proxies `/socket.io` to `localhost:3000`. Run it alongside `npm run dev`.
- `npm run build`: client build only
- `npm run lint` / `npm run check` (Biome, writes fixes) / `npx biome ci .` (what CI runs)
- `npx svelte-check --tsconfig ./client/tsconfig.json`: type-checks the client (`.ts` and `.svelte`). Not in CI yet.
- There is no test suite.

The server exits at startup unless `RECEPTIONIST_KEY`, `OBSERVER_KEY` and `SAFETY_KEY` are set (loaded from `.env` via `--env-file-if-exists`; see `.env.example`, which also sets `PORT=3000`).

## Architecture

- `server.js`: Express + Socket.IO on one HTTP server. Validates the access keys, serves the static frontend directory and page routes, and creates the state store, persisted to `data/race-state.json`.
- `src/state.js`: `createStateStore`, the single source of truth. All mutations happen here; they throw `Error`s with user-facing messages and save atomically (write to `.tmp`, then rename). `publicState()` builds the one snapshot that every client receives. Sessions move through `upcoming → active → finished → ended`; modes are `safe | hazard | danger | finished`.
- `src/sockets.js`: authenticates in `io.use` from `socket.handshake.auth = { role, accessKey }`. `role` is either `public` or a page name (`front-desk`, `race-control`, `lap-line-tracker`), mapped to a key. A wrong key is rejected after a 500ms delay, as the spec requires. `bind(role, event, action)` wires each command event to a store call, replies to the acknowledgement callback with `{ ok, result | error }`, then broadcasts `race:state` to everyone. The race timer is a server-side `setTimeout` (`finishTimer`/`finishIfExpired`) that also resumes after a restart.
- `src/routes.js`: maps each first-level route (`/front-desk`, `/race-control`, `/leader-board`, …) to `<page>/index.html` inside the static directory.
- Event names are namespaced by role: `frontdesk:*`, `safety:*`, `observer:*`. The table is in README.md.

## Frontend migration (this branch)

`feat/svelte-frontend` (formerly `feat/race-control-svelte`) replaces the vanilla JS frontend with Svelte 5 + TypeScript + Tailwind 4 (`client/`). The vanilla client is retired, but `server.js` still serves `public/` (home and race-control only) until the switch below. `feat/race-control` keeps the vanilla version for comparison.

Done so far: the landing page (`/`), with the shared header and status bar. Not built yet: the staff pages and their unlock flow (`unlock`/`lock` with keys in `sessionStorage`), an `emit` helper using `emitWithAck`, and the public display pages.

Switching the server to the Svelte build, once enough pages exist:

- `server.js:16`: serve `dist` instead of `public`, then delete `public/`.
- `src/routes.js` maps `/` to `home/index.html`, but Vite builds the home page to `dist/index.html`; map `/` to `''`.
- Every route in `src/routes.js` needs a page in `dist/` before merging to `main`.
- Afterwards, planned: socket roles become personas (`receptionist | safety | observer`, matching the key names) instead of page names.

### Client layout

- `client/` is the Vite root; one `package.json` at the repo root. Build output goes to `../dist`. Each page has its own HTML entry (`client/<page>/index.html`, listed in `build.rolldownOptions.input`) and `src/<page>/main.ts`; the home page's HTML is `client/index.html`.
- `src/lib/socket.svelte.ts`: the only socket. Exports the reactive `race` state (`state`, `updatedAt`, `connection`, `reconnectedAt`) and `connect(role)`. `Connection` is `idle | connecting | connected | reconnecting | unreachable | offline | denied`; a first connection stays `connecting` for a 4 s grace period before `unreachable`. Pages call `connect` in `main.ts`; components only read `race`.
- `src/lib/types.ts`: the server's data and events (`RaceState`, `Session`, `Driver`, `Mode`, `ServerToClientEvents`), mirroring `publicState()`. Update it in the same commit as any server change to that data.
- `src/lib/clock.svelte.ts`: a shared `clock.now` ticking every second (countdowns, "40s ago").
- `src/lib/components/`: `Header` (race status line) and `StatusBar` (connection bar, rendered inside the header). `src/lib/icons/`: own SVG icons with a `class` prop and `currentColor`. Components used by one page only live in that page's folder (e.g. `src/home/`).
- Countdowns use `updatedAt + remainingMs` (both on the device's clock), never the server's `startedAt`.

### Conventions

- TypeScript is strict (`extends @tsconfig/svelte`). Stay on TypeScript 6: svelte-check doesn't support 7 without extra flags.
- `<script lang="ts">` in every component; props as `interface Props` + `: Props = $props()`, read elsewhere with `ComponentProps<typeof X>`.
- Type-only imports use `import type` (`verbatimModuleSyntax`). Local imports end in `.js`, even for `.ts` files.
- Prefer lookups over `if` chains: `Record<Union, …>` so a new union member is a type error until handled.
- Tailwind classes are written out in full (never built from strings). Breakpoints follow the design: phone below `md`, tablet `md`, desktop `lg`.

### Design

The design is the "Racetrack Portal" Claude Design canvas: https://claude.ai/artifact/FRAmrUBLHSZ2oFjkRtchTP. The source of truth is the first three boards (`Main.dc.html` desktop, `PortalTablet.dc.html`, `PortalPhone.dc.html`); the other boards are sketches and may disagree. Read it with the Artifact tool; never change it.

### Working with the user

- The user is building the frontend themselves to learn Svelte and TypeScript. Explain and guide; don't write their code unless asked.
- Each team member has their own AI log at the repo root: `AI_LOG_<name>.md` (`AI_LOG_jere.md` for Jere, `AI_LOG_hoang.md` for Hoang). Whenever Claude writes code into the repo, it adds a numbered entry (Asked / Kept / Changed or rejected) to the log of the person it's working with, committed together with that code. If it's unclear who that is, check `git config user.name` or ask.

## Tooling

Biome is the only linter and formatter: single quotes, no semicolons, 2 spaces, width 80. `html.experimentalFullSupportEnabled` is on so that `.svelte` markup is linted and formatted, and `css.parser.tailwindDirectives` so that `@utility`/`@apply` parse. Lefthook runs `biome check --write` on staged files before each commit. CI (`.github/workflows/ci.yml`) runs `npx biome ci .`.
