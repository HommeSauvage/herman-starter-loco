# AGENTS.md

Operating contract for agents on this repo. This is a template for Herman's
wizard: an agent turns it into one user's product.

## Rules

- **Scaffold, don't invent.** `cargo loco generate <thing>` writes the file *and* the wiring — module declarations, route registration, worker registration, test module. Rust has no autoloading, so a hand-written handler that never got registered is the most expensive mistake available here.
- **Trim as you go.** What the product does not use is deleted in the same pass that makes it unused.
- **The gate is the contract.** `./scripts/ci-check.sh` green means done.
- Do not change dependencies, add base folders, or write documentation files unless asked.
- Read framework conventions from `.claude/skills/loco/**` before guessing. Check `api-index.md` and `sea-orm-index.md` for symbol names; do not grep framework source unless the index and recipes both miss.

## Stack

Loco 1.2 / Rust / SeaORM 2 / SQLite by default (Postgres is a config change) · React 19 + Vite · Tailwind v4 + shadcn/ui · TanStack Query · React Router 8 · ts-rs typings generated from Rust DTOs.

## Gates

- `./scripts/ci-check.sh` — `cargo fmt --check`, clippy `-D warnings`, `cargo test`, bindings drift, frontend lint/format/typecheck/build. Run it before saying done.
- `cargo test` — request tests through `loco_rs::testing`, model tests, insta snapshots. Feature/request tests by default.
- `cargo loco routes` after every generator — it is the cheapest proof that what you generated is reachable.
- `cargo loco doctor` when boot, DB or mail misbehaves; it names the missing piece.
- Never delete tests without approval. Never hand-edit `frontend/src/bindings/**` (ts-rs) or `frontend/src/components/ui/**` (shadcn).

## Backend

- Generate, then edit. `cargo loco generate scaffold notes user:references title:string! body:text! pinned:bool!` is the shape of a CRUD feature; `generate model|controller|worker|task|mailer|migration` for the rest. Model names are plural.
- Register everything in `src/app.rs`: routes, workers, tasks, seeds, truncate. Generators inject into it; if you add by hand, that is the file that makes it real.
- Schema lives in `migration/src/*`; entities in `src/models/_entities/**` are generated. After a migration: `cargo loco db migrate && cargo loco db entities`. Never edit under `_entities/`.
- Fat model, slim controller. Finders, filtering and counts on `impl Model`; handlers parse, call one or two model methods, render. `src/controllers/notes.rs` is the reference.
- Auth is `auth: auth::JWT`. Resolve the caller with `users::Model::find_by_pid` and scope every query to them. **Never accept an owner id in a request body** — `CreateNote`/UpdateNote` deliberately have no `user_id`.
- Wire types are DTOs in `src/dtos/*`, deriving `TS` with `#[ts(export)]`. Entities never go on the wire. `cargo test` exports the bindings; commit them.
- `config/<env>.yaml` is the only settings source. No `std::env::var` in app code. Development mail is stubbed so register/reset work with no SMTP.

## Frontend

- `frontend/` is a Vite SPA. `bun install`; `bun run dev` on 5173 proxies `/api` to the API on 5150; `bun run build` writes `frontend/dist`, which Loco serves.
- Path alias `@/`. Pages in `src/pages`, app chrome in `src/layouts/app-layout.tsx`, sidebar entries in `src/lib/nav.ts` — one registry, never edit the sidebar twice.
- Data: one hook file per domain in `src/api/*` on top of `src/api/client.ts`. Invalidate the domain key after a mutation. A 401 clears the token; `RequireAuth` sends the user to `/login`.
- Auth state: `src/auth/session.tsx` (`useSession`). Token in localStorage; do not add a second store.
- Every page calls `usePageTitle`. Every list has loading, error, empty and filtered-empty states (`components/{loading,error,empty}-state.tsx`).
- The notes module is the quality bar for list → detail → create/edit. Copy its shape, not its domain.

## UI

- Tokens live in `frontend/src/index.css` (`:root`, `.dark`, `--radius`); change values, never rename variables or the `@theme` mapping. Never hardcode colors — use token utilities.
- Never edit `components/ui/*` — compose them. Add a primitive with `bunx shadcn@latest add <name>` only when composition cannot cover it.
- Layout: `SidebarProvider` + `AppSidebar` + `SidebarInset`; the header carries breadcrumbs, theme and user menu. Mobile is the sidebar's sheet.
- Shared: `PageHeader`, `StatCard`, `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`.
- Forms: `Field` + `Input`/`Textarea` + inline `FieldError`; disable submit with `isPending`. Toasts: `sonner`. Destructive actions go through `ConfirmDialog`.

## Docs

`README.md` belongs to the product: replace it in the foundation milestone. Trim this file the same way — it describes the product's invariants, not the template's.

## Misc

- Ports: API 5150 (`PORT=5151 cargo loco start`), Vite 5173. The Vite proxy reads `PORT`.
- Frontend changes not showing: Loco serves the *built* `frontend/dist`. Run `bun run build`, or use `bun run dev` while iterating.
- `sea-orm-cli` is required for `cargo loco db entities`; `./scripts/preflight.sh` says what is missing.
- Skills: `.claude/skills/loco` is the official, version-matched copy. `.agents`, `.pi` and `.cursor` hold identical copies — edit `.claude` and run `./scripts/sync-skills.sh`.
- Demo login after `cargo loco db seed`: `user1@example.com` / `1234`.
