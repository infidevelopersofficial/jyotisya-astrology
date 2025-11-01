# Jyotishya • Digital Astrology Platform

This repository houses the scaffolding for a modern astrology platform tailored for India, featuring Vedic + Western horoscopes, Kundli generation, compatibility tools, live astrologer consultations, and an e-commerce marketplace.

## Monorepo Layout

- `apps/web` — customer-facing Next.js 14 application.
- `apps/admin` — operations/admin portal (Next.js).
- `services/` — modular backend services (NestJS / TypeScript and a FastAPI astro-core prototype).
- `packages/` — shared UI kit, business logic, schema definitions.
- `infrastructure/` — Terraform, Helm, Docker assets.
- `docs/` — architecture notes, API guides, GTM playbooks.
- `scripts/` — automation, seeding, and DX helpers.

## Prerequisites

- Node.js **>= 18.18** (20.x recommended).
- Yarn **Berry (4.x)** — already configured through `.yarn/releases`. Use `corepack enable` once per machine.
- Optional for backend services: Docker (for databases) and Nest CLI (`yarn dlx @nestjs/cli new` is available via PnP).

## Installation

Install all workspace dependencies from the repo root:

```bash
corepack enable             # if you have not done this before
yarn install
```

The project uses Plug’n’Play; IDEs may need the TypeScript SDK patched via `yarn dlx @yarnpkg/sdks vscode` (or the equivalent for your editor).

## Running Applications

### Web (customer site)

```bash
# Dev server with component HMR
yarn dev --filter @digital-astrology/web
```

The site boots at `http://localhost:3000`. It serves mock data when upstream services are unavailable.

### Admin portal

```bash
yarn dev --filter @digital-astrology/admin
```

### Backend services

All services support standard NestJS scripts. For example, to run the Astro Core aggregator:

```bash
# Compile & watch mode (NestJS)
yarn dev --filter @digital-astrology/astro-core -- start:dev
```

Some services rely on environment variables or databases; check their individual READMEs or `docs/` for details.

### Python astro-core proxy

`services/astro-core-python` bundles a FastAPI wrapper around FreeAstrologyAPI. To run it locally:

```bash
cd services/astro-core-python
python -m venv .venv
source .venv/bin/activate
pip install -e .
export FREE_API_BASE_URL=https://json.freeastrologyapi.com
export FREE_API_KEY=your_api_key
uvicorn freeastrology.main:app --host 0.0.0.0 --port 4001 --reload
```

Then set `ASTRO_CORE_URL=http://localhost:4001` (or `http://localhost:4001/api/astro-core` depending on your routing preference) in the web app. See `services/astro-core-python/README.md` for advanced configuration and endpoints.

## Environment Variables

The Next.js app proxies to backend services when the following variables are provided (set them in `.env.local` at the repo root):

```dotenv
ASTRO_CORE_URL=http://localhost:4001/api/astro-core
COMMERCE_SERVICE_URL=http://localhost:4002/api/commerce
ASTROLOGY_PROVIDER=open_source          # or jyotish_api
JYOTISH_API_URL=https://api.example.com # required when ASTROLOGY_PROVIDER=jyotish_api
JYOTISH_API_KEY=replace-with-secret
JYOTISH_API_TIMEOUT_MS=8000
INTERPRETATION_PROVIDER=mock            # or openai
OPENAI_API_KEY=replace-with-secret
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=10000
```

Unset variables default to local mocks so development remains functional.

## Quality Checks

Run these from the repository root unless noted otherwise:

```bash
# Type-check the entire monorepo (NodeNext config)
yarn --cwd apps/web exec tsc --noEmit --pretty false

# Lint specific workspaces
yarn lint --filter @digital-astrology/web
yarn lint --filter @digital-astrology/astro-core

# Unit tests (Vitest) for the web app
yarn --cwd apps/web test

# Turbo-powered pipelines
yarn turbo run lint
yarn turbo run test
```

Vitest lives alongside Next.js code (`apps/web/lib/api/*.test.ts`). Add new tests there and run `yarn --cwd apps/web test --watch` for red/green feedback.

## Internationalisation

- Locale copy is defined in `apps/web/components/providers/intl-provider.tsx` (`en`, `hi`, `ta`).
- `LocaleSwitcher` persists the reader’s preference in `localStorage` and swaps UI strings instantly.

## Additional Notes

- The shared TypeScript configuration now uses `module: "NodeNext"` and aligns with `moduleResolution: "NodeNext"` to keep `tsc --noEmit` happy across workspaces.
- Horoscopes returned by `@digital-astrology/lib` include an optional `summary.snapshot` payload so interpretation prompts can use richer planetary context.

## Roadmap

- Integrate real ephemeris & Panchang providers (Swiss Ephemeris, Drik Panchang APIs).
- Wire up authentication (Keycloak, Cognito) and payments (Razorpay, PhonePe).
- Expand automated coverage (API integration tests, UI smoke tests) and harden CI/CD pipelines.
