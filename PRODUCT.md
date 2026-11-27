# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Software developers, students, and engineers who build across multiple repositories and need one searchable personal place to store, organize, and retrieve reusable code snippets.

## Product Purpose

CodePocket is a personal code snippet vault. Users capture snippets from the web dashboard or directly from Visual Studio Code using personal API keys, organize them with colored folders and tags, pin favorites, search across titles, descriptions, tags, and code, and safely recover deleted snippets from an archive.

## Positioning

CodePocket focuses on personal developer retrieval speed and editor-to-vault synchronization rather than social feeds or public snippet sharing. Snippets live in a structured Neon PostgreSQL vault backed by Prisma and Better Auth, paired with Monaco Editor and syntax highlighting themes.

## Operating Context

- Web application built with Next.js App Router (`/`, `/login`, `/signup`, `/dashboard`, `/dashboard/favorites`, `/dashboard/archive`, `/dashboard/folder/[id]`, `/dashboard/new`, `/dashboard/snippet/[id]`, `/dashboard/help`).
- VS Code extension integration authenticating with personal `cpk_` API keys via `x-api-key` header against `/api/snippets` and `/api/snippets/[id]`.
- Authenticated sessions managed by Better Auth; database storage on Neon Serverless PostgreSQL via Prisma ORM.

## Capabilities and Constraints

- Supported features: email/password signup & login, snippet CRUD with soft-delete Archive and restore, custom colored folders, multi-tag support, language and date-range filtering, Favorites view, 7 syntax highlighting themes (`vscode-dark`, `dracula`, `github-dark`, `monokai`, `nord`, `one-dark`, `solarized-dark`), Monaco code editor, personal API key management, and profile/avatar editing.
- Absence constraints: no public testimonials, no telemetry user-count claims, no pricing tiers (free personal tool), no enterprise compliance certifications. Never fabricate statistics or social proof.

## Brand Commitments

- Name: CodePocket
- Signature product palette: true black / deep obsidian ground (`#050608` / `#090B0E` / `#0A0D12`) paired with emerald (`#10B981` / `#34D399`) accents and clean monospace code views.
- Landing page (`/`): user-pinned dark obsidian surface framing an interactive CodePocket Vault preview.

## Evidence on Hand

- Real working application routes and components in `app/` and `components/`.
- Real sample developer recipes and authentic `SnippetCard` / sidebar / folder / archive behaviors matching `app/dashboard/page.tsx` and `app/dashboard/layout.tsx`.
- Real VS Code API key documentation and endpoints in `app/api/snippets/route.ts` and `app/api/api-keys/route.ts`.

## Product Principles

1. Show the real workspace first: visitors should be able to click folders, search snippets, favorite items, and inspect code before signing up.
2. Honesty over hype: present only real implemented features, endpoints, and developer workflows without fabricated metrics.
3. Keyboard-first clarity: clean typography, readable code formatting, and zero-clutter navigation across desktop and mobile.
