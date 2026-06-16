# Implementation Plan: Duel Archive – Yu-Gi-Oh! Card Database & Deck Management Web App

**Branch**: `001-duel-archive` | **Date**: 2026-06-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [specs/001-duel-archive/spec.md](spec.md)

## Summary

Duel Archive is a full-stack web application for Yu-Gi-Oh! card discovery, deck building, collection management, trading, and community engagement. The frontend is a single-page React application (JavaScript-only, no TypeScript) using Vite, Tailwind CSS, and Redux Toolkit, serving desktop and mobile users. The backend is Django REST Framework with PostgreSQL, caching card data from YGOPRODeck API v7 for 48 hours and enforcing 15 req/s rate limiting. The visual design and layout for all pages come from Figma Make source files in `/design/` and serve as authoritative templates—SpecKit generates React components that replicate exact layouts without modification. Three user tiers (guest, registered, admin) access progressively enabled features. Core MVP delivers card search, filtering, user authentication, and deck building (P1–P2 features); community trading, sharing, and admin tooling (P3 features) enhance value in later phases. All phases must include comprehensive tests (Jest/RTL for frontend, Django tests for backend) passing before delivery.

## Technical Context

**Language/Version**: 
- Frontend: JavaScript (ES2020+, no TypeScript); React 18.x
- Backend: Python 3.11+, Django 4.2+
- Database: PostgreSQL 13+

**Primary Dependencies**: 
- Frontend: React, Vite (build), Redux Toolkit, React Router v6, Tailwind CSS, Recharts (charts), axios (HTTP client)
- Backend: Django, Django REST Framework, djangorestframework-simplejwt (JWT auth), Celery + Redis (background tasks), Pillow (image processing), django-cors-headers, psycopg2 (PostgreSQL driver)
- External: YGOPRODeck API v7 (https://db.ygoprodeck.com/api/v7/)

**Storage**: 
- PostgreSQL: User accounts, JWT tokens, decks, collections, card cache, price snapshots, audit logs
- Django Media Storage: Downloaded card images (never hotlinked from images.ygoprodeck.com)
- Browser localStorage (guest): Device UUID, recently viewed cards, draft decks, theme preference, language

**Testing**: 
- Frontend: Jest + React Testing Library (component rendering, state, interactions); coverage target ≥80%
- Backend: Django unittest or pytest (API endpoints, models, caching, rate limiting); coverage target ≥75%
- CSS Modules: Visual fidelity verified against Figma layouts (no unit tests)

**Target Platform**: Web (desktop 1920px, tablet 768px, mobile 375px); modern browsers (Chrome, Firefox, Safari, Edge); ES2020+ support required; IE11 NOT supported

**Project Type**: Web service (SPA frontend + REST API backend + external API integration + background tasks)

**Performance Goals**:
- Search results load <2 seconds (p95); detail page <1 second
- Card add to deck validation <500ms
- API response cache hit ratio ≥85%
- Reveal animations 60 FPS, CSS-based (CSS Modules)
- Support 1000 concurrent users without degradation

**Constraints**:
- YGOPRODeck API rate limit: max 15 req/s (safely below 20 req/s to avoid 1-hour ban)
- Random card pull: max once per 2 seconds per user
- Card images: only image_url (detail), image_url_small (lists), image_url_cropped (gallery)
- JWT access token lifetime: 15 minutes (example, subject to change)
- JWT refresh token lifetime: 30 days
- Cache TTL: minimum 48 hours for all card data
- Deck size: main ≥40, extra ≤15, side ≤15
- Deck banlist compliance: no banned cards; limited ≤1, semi-limited ≤2

**Scale/Scope**:
- Target users: 1,000 concurrent (v1); horizontal scaling deferred to v2 for 10,000+
- Card database: ~9,000 cards (from YGOPRODeck API)
- Pages/Routes: 15+ (home, search, detail, login, register, profile, deck builder, wishlist, collection, trading, community, admin, etc.)
- Features: 11 user stories (P1: search, auth; P2: deck building, detail layout; P3: wishlist, collection, gallery, random pull, trading, sharing, admin)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Requirements vs. Plan Alignment:**

| Principle | Requirement | Plan Status | Notes |
|-----------|-------------|-------------|-------|
| I. YGOPRODeck API Authority | Use API v7 exclusively as sole source | ✅ PASS | Backend fetches from YGOPRODeck; no raw dumps committed; no hotlinks to images.ygoprodeck.com |
| II. Backend Caching Proxy | 48h cache, 15 req/s rate limit, retry logic, no direct API exposure | ✅ PASS | Django caches responses in PostgreSQL; Celery + exponential backoff; client sees only DRF JSON |
| III. Figma Layout Authority | Use Figma files as authoritative templates; extract exact HTML/CSS | ✅ PASS | SpecKit reads `/design/` files; generates exact HTML structure; Tailwind classes from Figma; CSS Modules for complex animations only |
| IV. JavaScript-Only Frontend | React in .jsx/.js only; NO TypeScript; JSDoc comments for props | ✅ PASS | All frontend files .js/.jsx; TypeScript explicitly prohibited; props documented with JSDoc; no .ts/.tsx files |
| V. API Response Compliance | Return all required fields (image_url, prices, banlist, etc.) | ✅ PASS | DRF serializers include all YGOPRODeck response fields; card detail page uses image_url; lists use image_url_small |
| VI. Visual Consistency | Two-column detail layout; thumbnails in lists; responsive mobile; accessibility | ✅ PASS | Detail page: left scrolls (stats/sets/prices), right sticky (image_url); lists use lazy-loaded image_url_small; responsive breakpoints (sm:, md:, lg:) |
| VII. Testing Per Phase | Tests written end-of-phase; Jest/RTL for frontend, Django for backend; coverage ≥80%/≥75%; tests pass before delivery | ✅ PASS | Phase 0 includes research (no tests); Phase 1 generates design artifacts (tests for schema validation); Phase 2 (implementation) includes full test suites per spec |
| VIII. Data Flow Authority | Client → Django → YGOPRODeck; cache validation; images served locally | ✅ PASS | Frontend API client communicates only with Django; backend enforces caching and rate limiting; card images downloaded to media storage |
| README.md Updates | Create/update README after each phase | ✅ PASS | Phase 0 output includes research summary; Phase 1 outputs design; Phase 2 implementation; each phase updates root README.md |

**Gate Evaluation**: ✅ **ALL GATES PASS** — Plan is fully aligned with constitution. No violations or waivers required.

## Project Structure

### Documentation (this feature)

```text
specs/001-duel-archive/
├── plan.md                        # This file
├── research.md                    # Phase 0 output: API deep dive, Figma layout review, tech stack justification
├── data-model.md                  # Phase 1 output: entities, relationships, validation rules
├── quickstart.md                  # Phase 1 output: setup instructions, deployment, validation scenarios
├── contracts/                     # Phase 1 output: API endpoint contracts
│   ├── card-search.md
│   ├── card-detail.md
│   ├── authentication.md
│   ├── deck-management.md
│   ├── wishlist.md
│   ├── collection.md
│   ├── trading.md
│   └── admin.md
└── tasks.md                       # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Web application structure: frontend + backend + design

frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.jsx                  # Entry point (Vite)
│   ├── App.jsx                   # Root component
│   ├── index.css                 # Global Tailwind + CSS resets
│   ├── components/               # Reusable UI components
│   │   ├── CardDetail.jsx
│   │   ├── CardDetailPanel.jsx  # Scrollable left panel (two-column)
│   │   ├── CardImage.jsx        # Sticky right image (two-column)
│   │   ├── CardThumbnail.jsx    # Grid thumbnail with image_url_small
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Filter.jsx
│   │   ├── Pagination.jsx
│   │   ├── AdvancedFilters.jsx
│   │   ├── DeckBuilder.jsx
│   │   ├── DeckStatistics.jsx
│   │   ├── WishlistHeart.jsx    # With CSS Module for animation
│   │   ├── CollectionManager.jsx
│   │   ├── CommunityDeckCard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ui/                  # shadcn/ui or custom UI library components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Card.jsx
│   │       ├── Select.jsx
│   │       ├── Tabs.jsx
│   │       └── ...
│   ├── pages/                   # Page-level components (React Router)
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── CardDetailPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── MyDecksPage.jsx
│   │   ├── DeckBuilderPage.jsx
│   │   ├── DeckDetailPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── CollectionPage.jsx
│   │   ├── TradingMarketplacePage.jsx
│   │   ├── CommunityDecksPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   ├── GalleryPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── styles/
│   │   ├── globals.css          # Tailwind directives + global resets
│   │   ├── tailwind.css         # Tailwind config imports
│   │   └── theme.css            # Custom theme variables (if needed)
│   ├── services/                # API clients & utilities
│   │   ├── cardAPI.js           # Card search, detail, gallery endpoints
│   │   ├── authAPI.js           # Login, register, JWT refresh
│   │   ├── deckAPI.js           # Deck CRUD, import/export, validation
│   │   ├── wishlistAPI.js
│   │   ├── collectionAPI.js
│   │   ├── tradeAPI.js
│   │   ├── adminAPI.js
│   │   └── apiClient.js         # axios instance with interceptors (token refresh)
│   ├── store/                   # Redux Toolkit
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js     # User, JWT tokens, login state
│   │   │   ├── cardSlice.js     # Cached cards, search results, filters
│   │   │   ├── deckSlice.js     # Deck builder state, selected cards, validation errors
│   │   │   ├── wishlistSlice.js
│   │   │   ├── collectionSlice.js
│   │   │   ├── uiSlice.js       # Theme, language, loading states
│   │   │   └── adminSlice.js    # Admin metrics
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Login, logout, token refresh
│   │   ├── useCards.js          # Fetch cards, filter, paginate
│   │   ├── useDeck.js           # Deck operations, validation
│   │   ├── useLocalStorage.js   # Recently viewed, draft decks
│   │   ├── usePriceHistory.js   # Chart data for price trends
│   │   └── useTheme.js          # Dark mode toggle
│   ├── context/                 # React Context (non-Redux)
│   │   ├── LanguageContext.jsx  # Multi-language support (EN, FR, DE, IT, PT)
│   │   └── ThemeContext.jsx     # Light/dark theme (also in Redux)
│   ├── utils/
│   │   ├── formatters.js        # Format prices, dates, deck stats
│   │   ├── validators.js        # Deck validation, email validation, password strength
│   │   ├── localStorage.js      # Guest data persistence (UUID, recently viewed, drafts)
│   │   ├── ydkParser.js         # Parse/generate YDK format
│   │   └── api-config.js        # API base URL, headers, endpoints
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── fonts/
├── tests/
│   ├── components/              # React Testing Library tests
│   │   ├── CardDetail.test.jsx
│   │   ├── CardThumbnail.test.jsx
│   │   ├── SearchBar.test.jsx
│   │   ├── DeckBuilder.test.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── SearchPage.test.jsx
│   │   ├── CardDetailPage.test.jsx
│   │   └── ...
│   ├── services/                # API service tests
│   │   ├── cardAPI.test.js
│   │   ├── authAPI.test.js
│   │   └── ...
│   ├── hooks/                   # Hook tests
│   │   ├── useAuth.test.js
│   │   ├── useCards.test.js
│   │   └── ...
│   ├── utils/                   # Utility function tests (Jest)
│   │   ├── validators.test.js
│   │   ├── ydkParser.test.js
│   │   └── ...
│   └── setup.js                 # Jest setup, mocks, test utilities
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── prettier.config.js
├── .eslintrc.json
├── package.json
└── pnpm-lock.yaml (or package-lock.json)

backend/
├── manage.py
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py              # Base Django settings
│   │   ├── local.py             # Local development settings
│   │   ├── production.py        # Production settings (env vars)
│   ├── urls.py                  # Main URL router
│   ├── wsgi.py
│   ├── asgi.py                  # For WebSocket support (future)
│   ├── apps/
│   │   ├── cards/               # Card data & caching
│   │   │   ├── models.py        # Card, CardSet, CardPrice, BanlistStatus
│   │   │   ├── views.py         # CardViewSet, search, detail, list endpoints
│   │   │   ├── serializers.py   # CardSerializer, PaginatedCardSerializer
│   │   │   ├── filters.py       # SearchFilter, CardFilter (name, type, attr, etc.)
│   │   │   ├── services.py      # YGOPRODeck API client, caching, rate limiting
│   │   │   ├── tasks.py         # Celery: periodic banlist update, DB version check
│   │   │   ├── tests/
│   │   │   │   ├── test_models.py
│   │   │   │   ├── test_views.py
│   │   │   │   ├── test_services.py
│   │   │   │   └── test_caching.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   └── urls.py
│   │   ├── users/               # User accounts & authentication
│   │   │   ├── models.py        # User, UserProfile, Guest UUID tracking
│   │   │   ├── views.py         # RegisterView, LoginView, ProfileView, SettingsView
│   │   │   ├── serializers.py   # UserSerializer, RegistrationSerializer
│   │   │   ├── authentication.py # Custom JWT backend, device_id migration
│   │   │   ├── throttles.py     # UserRateThrottle (random card limit)
│   │   │   ├── tests/
│   │   │   │   ├── test_auth.py
│   │   │   │   ├── test_registration.py
│   │   │   │   └── test_guest_migration.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   └── urls.py
│   │   ├── decks/               # Deck building & management
│   │   │   ├── models.py        # Deck, DeckCard
│   │   │   ├── views.py         # DeckViewSet, import/export, validation, statistics
│   │   │   ├── serializers.py   # DeckSerializer, DeckImportExportSerializer
│   │   │   ├── services.py      # YDK parser, deck validator, banlist checker
│   │   │   ├── permissions.py   # IsOwner or IsAdmin permission
│   │   │   ├── tests/
│   │   │   │   ├── test_models.py
│   │   │   │   ├── test_validation.py
│   │   │   │   ├── test_ydkparser.py
│   │   │   │   └── test_statistics.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   └── urls.py
│   │   ├── wishlists/          # Wishlist & favorites
│   │   │   ├── models.py        # WishlistItem, PriceAlert
│   │   │   ├── views.py         # WishlistViewSet, price alert setup
│   │   │   ├── serializers.py
│   │   │   ├── tasks.py         # Celery: price drop alerts via email
│   │   │   ├── tests/
│   │   │   └── [standard structure]
│   │   ├── collections/        # Physical card collection tracking
│   │   │   ├── models.py        # CollectionItem
│   │   │   ├── views.py         # CollectionViewSet, bulk import
│   │   │   ├── serializers.py
│   │   │   ├── tests/
│   │   │   └── [standard structure]
│   │   ├── trading/            # Trade offers & matching
│   │   │   ├── models.py        # TradeOffer, TradingMatch
│   │   │   ├── views.py         # TradeViewSet, trade matching
│   │   │   ├── serializers.py
│   │   │   ├── tasks.py         # Celery: hourly trade matching
│   │   │   ├── tests/
│   │   │   └── [standard structure]
│   │   ├── community/          # Shared decks, comments, upvotes
│   │   │   ├── models.py        # SharedDeck, DeckComment, DeckUpvote
│   │   │   ├── views.py         # SharedDeckViewSet, comments, copy-to-user
│   │   │   ├── serializers.py
│   │   │   ├── tests/
│   │   │   └── [standard structure]
│   │   └── admin_tools/        # Admin dashboard & monitoring
│   │       ├── models.py        # APIUsageMetric, AdminAuditLog
│   │       ├── views.py         # AdminDashboardView, cache clear, banlist refresh
│   │       ├── serializers.py
│   │       ├── permissions.py   # IsAdmin permission
│   │       ├── tasks.py         # Celery: collect API metrics, price snapshots
│   │       ├── tests/
│   │       └── [standard structure]
│   └── shared/
│       ├── middleware.py        # Device ID extraction, CORS, logging
│       ├── pagination.py        # DRF pagination classes
│       ├── exceptions.py        # Custom exception handlers
│       └── utils.py             # Shared utilities (logging, errors)
├── tests/
│   ├── conftest.py             # pytest fixtures
│   ├── factories/              # Factory Boy factories for test data
│   │   ├── card_factory.py
│   │   ├── user_factory.py
│   │   ├── deck_factory.py
│   │   └── ...
│   └── integration/            # Integration tests across apps
│       ├── test_auth_to_deck_flow.py
│       ├── test_guest_to_user_migration.py
│       └── ...
├── celery/
│   ├── __init__.py
│   ├── settings.py             # Celery configuration
│   └── tasks_registry.py       # Centralized task imports
├── docker/                     # Docker setup (optional v1)
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
└── wsgi.py

design/
├── index.html                  # Figma export or reference
├── default_shadcn_theme.css   # Figma-exported CSS
├── guidelines/
│   ├── Guidelines.md           # Design system documentation
├── vite.config.ts             # Figma preview server (optional)
├── package.json               # Figma preview dependencies
└── src/
    └── [Figma Make HTML/CSS exports — reference files, read-only]

root/
├── README.md                  # Project overview, setup, deployment (updated per phase)
├── .gitignore
├── .github/
│   ├── workflows/
│   │   ├── test-frontend.yml  # GitHub Actions: frontend tests on PR
│   │   ├── test-backend.yml   # GitHub Actions: backend tests on PR
│   │   └── lint.yml           # GitHub Actions: ESLint + Prettier on PR
│   ├── copilot-instructions.md # AI agent context (updated after each phase)
│   └── prompts/               # SpecKit prompts
└── docker-compose.yml         # Local dev environment (future)
```

**Structure Decision**: Selected **Option 2: Web application** (frontend + backend) due to architecture split (React SPA + Django REST API) and independent deployment/scaling needs. Figma design files kept in `/design/` as read-only reference (source of truth for layouts). Each layer (frontend, backend, design) has clear separation of concerns:
- Frontend: React + Redux, UI components, routing, state management, API client
- Backend: Django + DRF, models, serializers, API endpoints, caching, business logic
- Design: Figma HTML/CSS exports, layout templates, component structure definitions

This structure supports team parallelization: frontend devs implement UI from Figma exports; backend devs implement APIs in isolation; design updates flow to frontend without affecting backend.

## Complexity Tracking

No complexity violations or waivers required. Plan aligns fully with Constitution:

- Single monorepo for frontend + backend simplifies deployment and versioning (standard full-stack structure)
- OAuth/SSO not required; JWT + device_id migration simpler for MVP and satisfies auth requirements
- Figma authority enforced through read-only `/design/` reference directory; no override logic needed
- Caching strategy (PostgreSQL-based) chosen for simplicity; Redis caching deferred to v2 (scale-up phase)
- Rate limiting via custom Django throttle sufficient for MVP; distributed rate limiting (via Redis or external service) deferred to multi-instance deployment
- Testing strategy (Jest/RTL + Django unittest) appropriate for monorepo; no additional frameworks needed

---

## Phase 0: Outline & Research *(Generated by /speckit.plan)*

### Phase 0 Deliverables

This phase generates a research document that resolves all technical unknowns from the user requirements:

**Research Tasks** (see [research.md](research.md)):

1. **YGOPRODeck API Deep Dive** – Validate all endpoints, response structure, rate limiting behavior, caching headers, language support, image field availability
2. **Figma Layout Review** – Inspect all design files in `/design/`; document layout patterns, Tailwind class naming, animation triggers, responsive breakpoints
3. **Redux Architecture Patterns** – State shape for card search (filters, results, pagination), deck builder (card selection, validation errors), user auth (tokens, profile)
4. **React Router v6 Lazy Loading Strategy** – Code splitting for pages; route configuration; protected routes for logged-in features
5. **JWT Token Refresh Flow** – API interceptor logic; refresh token rotation; session expiry handling
6. **YDK Format Specification** – Deck import/export format; card ID vs. name handling; extra deck card restrictions
7. **Django Serializer Patterns** – Nested serializers for Card (includes card_sets, card_prices, card_images, banlist_info); pagination; filtering
8. **Celery Task Scheduling** – Price snapshot collection (daily), price drop alerts (on-demand email), trade matching (hourly)
9. **CSS Module Animation Performance** – Benchmarks for CSS keyframes vs. JavaScript animations; 60 FPS targets for card reveal, wishlist heart
10. **Mobile Responsive Breakpoints** – Figma layout adaptation to sm:/md:/lg: breakpoints; touch-friendly button sizing (48px min)

**Output**: [research.md](research.md) — Findings from each research task, decisions made, rationale, alternatives considered

---

## Phase 1: Design & Contracts *(Generated by /speckit.plan)*

### Phase 1 Deliverables

This phase generates design artifacts defining data models, API contracts, and validation rules:

1. **Data Model** ([data-model.md](data-model.md)) – Entity definitions with relationships, validation rules, state transitions
2. **API Contracts** ([contracts/](contracts/)) – Endpoint specifications for search, authentication, deck management, etc.
3. **Quickstart Guide** ([quickstart.md](quickstart.md)) – Setup instructions, validation scenarios, manual testing steps
4. **Agent Context Update** – Refresh [.github/copilot-instructions.md](.github/copilot-instructions.md) with plan details

**Data Model Entities** (detailed in [data-model.md](data-model.md)):
- Guest (UUID device_id, localStorage state)
- User (email, password hash, profile, JWT tokens)
- Card (YGOPRODeck API fields: id, name, type, ATK, DEF, images, prices, banlist_info)
- Deck (user_id, name, main/extra/side cards, banlist compliance)
- Collection (user_id, card_id, quantity, condition, set_code, rarity)
- Wishlist (user_id, card_id, price_alert_threshold)
- Trade (user_id, offered_cards, wanted_cards, status, matched_user_id)
- SharedDeck (user_id, deck_id, is_public, upvotes, comments)

**API Contracts** (detailed in [contracts/](contracts/)):
- `card-search.md` – GET /api/cards/ with filtering (name, type, attribute, etc.), pagination, response fields
- `card-detail.md` – GET /api/cards/{id}/ with related data (images, prices, banlist, sets)
- `authentication.md` – POST /api/auth/register/, POST /api/auth/login/, POST /api/auth/logout/, POST /api/auth/refresh/
- `deck-management.md` – CRUD endpoints for decks; POST /api/decks/validate/, POST /api/decks/import/, GET /api/decks/export/{id}/
- Additional contracts for wishlist, collection, trading, community, admin

**Quickstart** ([quickstart.md](quickstart.md)):
- Local development environment setup (Node.js, Python, PostgreSQL, Redis)
- Frontend: `npm install`, `npm run dev`
- Backend: `python manage.py migrate`, `python manage.py runserver`
- Test scenarios: (1) Search for card, (2) Register user, (3) Create deck, (4) Add card to deck, (5) Validate deck against banlist
- Deployment checklist: environment variables, database setup, static files, media storage, Celery workers

---

## Phase 2: Implementation *(Executed by /speckit.tasks + developer implementation)*

### Phase 2 Approach

Phase 2 is executed by the `/speckit.tasks` command (generates [tasks.md](tasks.md)) and subsequent developer implementation. Each task is assigned to a user story and prioritized (P1–P3):

**P1 Tasks** (Core MVP, blocking others):
- T001–T010: Guest card search & filtering (backend search API, frontend search UI, recent views in localStorage)
- T011–T020: User authentication (registration endpoint with device_id migration, JWT login/logout, token refresh interceptor)
- T021–T030: Basic deck building (deck CRUD API, deck validation against banlist, deck statistics calculation)
- T031–T040: Card detail page (two-column layout from Figma, left/right scroll/sticky behavior, responsive mobile)

**P2 Tasks** (Value-add features, depend on P1):
- T041–T050: Deck import/export (YDK parser, export endpoint, import endpoint with validation)
- T051–T060: Wishlist/favorites (heart toggle with CSS Module animation, price alerts via Celery)
- T061–T070: Collection manager (bulk CSV import, condition tracking, collection value calculation)

**P3 Tasks** (Nice-to-have, non-blocking):
- T071–T080: Visual spoiler gallery (grid layout with lazy-loaded image_url_cropped, filtering)
- T081–T090: Random card pull (rate-limited endpoint, reveal animation with CSS Module)
- T091–T100: Trading marketplace (post offers, find matches, trade completion)
- T101–T110: Community deck sharing (public decks, upvoting, commenting, copying)
- T111–T120: Admin dashboard (API metrics, cache monitoring, cache clear, banlist refresh)

**Testing Gate** (mandatory end-of-phase):
- All tests written and passing
- Frontend coverage ≥80% (components, hooks, utils)
- Backend coverage ≥75% (models, views, services)
- No code committed without passing tests

Each task includes: acceptance criteria, test coverage requirements, Figma file reference (if applicable), estimated effort, and dependencies. Tasks are executed in dependency order; teams can parallelize independent tasks.

---

## Phase Recap

| Phase | Purpose | Outputs | Gate |
|-------|---------|---------|------|
| **Phase 0** | Research unknowns | research.md | All clarifications resolved |
| **Phase 1** | Design & contracts | data-model.md, contracts/, quickstart.md, agent context | No ambiguities; ready for implementation |
| **Phase 2** | Implementation + tests | tasks.md, source code, test suites | All tests passing; code reviewed |

---

**Version**: 1.0.0 | **Created**: 2026-06-16 | **Status**: Ready for Phase 0 Research
