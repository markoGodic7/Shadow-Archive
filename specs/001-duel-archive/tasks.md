# Tasks: Duel Archive

**Input**: Design documents from `/specs/001-duel-archive/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the monorepo structure and shared tooling needed for frontend and backend development.

- [x] T001 Create the root project structure for `frontend/`, `backend/`, and `design/` per the implementation plan
- [x] T002 Initialize the React/Vite frontend with JavaScript tooling in `frontend/package.json`
- [x] T003 Initialize the Django/DRF backend with dependencies in `backend/requirements.txt`
- [x] T004 [P] Configure shared linting, formatting, and environment tooling in `frontend/.eslintrc.json`, `frontend/prettier.config.js`, and `backend/pyproject.toml`

### Tests for Setup

- [x] T051 [P] Add smoke tests for frontend build bootstrapping and backend Django startup.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared infrastructure that all user stories depend on before any story implementation begins.

- [x] T005 Implement Django settings, URL routing, CORS, and app bootstrap in `backend/src/settings/base.py` and `backend/src/urls.py`
- [x] T006 Implement shared authentication and JWT configuration in `backend/src/apps/users/authentication.py`
- [x] T007 [P] Implement the YGOPRODeck client, cache layer, and 15 req/s rate-limiting logic in `backend/src/apps/cards/services.py`
- [x] T008 [P] Create the Redux store, API client, and shared hooks in `frontend/src/store/store.js`, `frontend/src/services/apiClient.js`, and `frontend/src/hooks/`
- [x] T009 Create the main app shell, routes, and navigation in `frontend/src/App.jsx` and `frontend/src/pages/`

### Tests for Foundational Infrastructure

- [x] T052 [P] Add foundational tests for shared API client, auth bootstrap, and base routing behavior.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Guest Card Search and Browse (Priority: P1)

**Goal**: Deliver search, filtering, pagination, and card detail discovery for guests.

**Independent Test**: Verify a guest can search by name, apply filters, paginate results, open a card detail page, and see recent views persisted in localStorage.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Build the guest search page and filter controls in `frontend/src/pages/SearchPage.jsx`
- [ ] T011 [P] [US1] Implement card search/detail API calls in `frontend/src/services/cardAPI.js`
- [ ] T012 [US1] Implement backend card search and list endpoints in `backend/src/apps/cards/views.py`
- [ ] T013 [US1] Implement recent-view persistence and pagination behavior in `frontend/src/hooks/useCards.js` and `frontend/src/utils/localStorage.js`
- [ ] T014 [US1] Wire the card detail route and two-column layout entry points in `frontend/src/pages/CardDetailPage.jsx`

### Tests for User Story 1

- [ ] T053 [P] Add frontend and backend tests for search, filters, pagination, detail rendering, and recent-view persistence.

**Checkpoint**: User Story 1 is independently testable with guest search and detail browsing.

---

## Phase 4: User Story 2 - User Authentication & Account Registration (Priority: P1)

**Goal**: Deliver registration, login, JWT session handling, and guest-to-user migration.

**Independent Test**: Verify registration creates a valid account, login issues tokens, logout clears session state, and guest data migration is sent with `device_id`.

### Implementation for User Story 2

- [ ] T015 [P] [US2] Build the login and registration pages in `frontend/src/pages/LoginPage.jsx` and `frontend/src/pages/SignupPage.jsx`
- [ ] T016 [US2] Implement JWT refresh/interceptor logic in `frontend/src/services/authAPI.js` and `frontend/src/services/apiClient.js`
- [ ] T017 [US2] Implement backend registration, login, logout, and guest migration flow in `backend/src/apps/users/views.py` and `backend/src/apps/users/serializers.py`
- [ ] T018 [US2] Add protected-route handling and session persistence in `frontend/src/store/slices/authSlice.js`

### Tests for User Story 2

- [ ] T054 [P] Add authentication tests for registration, login, logout, token refresh, and guest-data migration.

**Checkpoint**: User Story 2 is independently testable as the authentication baseline.

---

## Phase 5: User Story 3 - Registered User Deck Building & Management (Priority: P2)

**Goal**: Deliver deck creation, card validation, banlist checks, statistics, and YDK import/export.

**Independent Test**: Verify a user can create a deck, add cards with legal limits, save it, export/import YDK, and view deck stats.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Build the deck builder and deck stats UI in `frontend/src/pages/DeckBuilderPage.jsx` and `frontend/src/components/DeckStatistics.jsx`
- [ ] T020 [US3] Implement deck CRUD and validation logic in `backend/src/apps/decks/views.py` and `backend/src/apps/decks/services.py`
- [ ] T021 [US3] Implement YDK import/export helpers in `backend/src/apps/decks/services.py` and `frontend/src/utils/ydkParser.js`
- [ ] T022 [US3] Add deck state and validation feedback in `frontend/src/store/slices/deckSlice.js`

### Tests for User Story 3

- [ ] T055 [P] Add deck validation, banlist enforcement, YDK import/export, and statistics tests.

**Checkpoint**: User Story 3 is independently testable for deck management workflows.

---

## Phase 6: User Story 4 - Card Detail Page with Two-Column Layout (Priority: P2)

**Goal**: Deliver the full card detail experience with stats, sets, prices, banlist, and animated artwork.

**Independent Test**: Verify the detail page renders a scrollable left panel, fixed image panel, banlist badges, price history chart, and responsive adaptation on mobile.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Build the reusable card detail components in `frontend/src/components/CardDetail.jsx` and `frontend/src/components/CardDetailPanel.jsx`
- [ ] T024 [US4] Add the sticky image panel and reveal animation in `frontend/src/components/CardImage.jsx` and `frontend/src/components/CardDetail.module.css`
- [ ] T025 [US4] Expose the full card detail serializer and price/banlist fields in `backend/src/apps/cards/serializers.py`
- [ ] T026 [US4] Add price-history chart rendering in `frontend/src/components/PriceHistoryChart.jsx`

### Tests for User Story 4

- [ ] T056 [P] Add card detail layout, responsive behavior, banlist display, and price-chart tests.

**Checkpoint**: User Story 4 is independently testable as the core detail page experience.

---

## Phase 7: User Story 5 - Wishlist and Favourite Cards (Priority: P3)

**Goal**: Deliver wishlist management, heart animation, and price-alert setup.

**Independent Test**: Verify a registered user can add/remove cards from wishlist, see the animation state persist, and create a price alert.

### Implementation for User Story 5

- [ ] T027 [P] [US5] Build the wishlist page and heart interaction UI in `frontend/src/pages/WishlistPage.jsx` and `frontend/src/components/WishlistHeart.jsx`
- [ ] T028 [US5] Implement wishlist CRUD and price alert endpoints in `backend/src/apps/wishlists/views.py`
- [ ] T029 [US5] Add Celery task wiring for price alerts in `backend/src/apps/wishlists/tasks.py`

### Tests for User Story 5

- [ ] T057 [P] Add wishlist persistence, heart animation state, and price-alert scheduling tests.

**Checkpoint**: User Story 5 is independently testable as a registered-user value feature.

---

## Phase 8: User Story 6 - Collection Manager & Card Ownership Tracking (Priority: P3)

**Goal**: Deliver collection tracking, condition filters, and CSV bulk import.

**Independent Test**: Verify a user can add a card to collection, filter by condition, upload CSV, and see total value recalculated.

### Implementation for User Story 6

- [ ] T030 [P] [US6] Build the collection manager UI and import dialog in `frontend/src/pages/CollectionPage.jsx`
- [ ] T031 [US6] Implement collection models, serializers, and bulk-import logic in `backend/src/apps/collections/views.py`
- [ ] T032 [US6] Add collection value calculation and filters in `frontend/src/store/slices/collectionSlice.js`

### Tests for User Story 6

- [ ] T058 [P] Add collection CRUD, CSV import, filter, and value-calculation tests.

**Checkpoint**: User Story 6 is independently testable as the collection-management flow.

---

## Phase 9: User Story 7 - Visual Spoiler Gallery with Filterable Grid (Priority: P3)

**Goal**: Deliver gallery browsing with filters and lazy-loaded artwork cards.

**Independent Test**: Verify cards load in a responsive gallery, filters update the grid, and clicking an artwork opens the detail page.

### Implementation for User Story 7

- [ ] T033 [P] [US7] Build the spoiler gallery page and lazy-loading grid in `frontend/src/pages/GalleryPage.jsx`
- [ ] T034 [US7] Add gallery search/filter support in `backend/src/apps/cards/views.py` and `frontend/src/services/cardAPI.js`
- [ ] T035 [US7] Add gallery image handling for `image_url_cropped` in `frontend/src/components/CardThumbnail.jsx`

### Tests for User Story 7

- [ ] T059 [P] Add gallery rendering, filter behavior, image lazy-loading, and pagination tests.

**Checkpoint**: User Story 7 is independently testable for visual browsing.

---

## Phase 10: User Story 8 - Random Card Pull with Reveal Animation (Priority: P3)

**Goal**: Deliver the random-pull experience, rate-limited pull, and animation feedback.

**Independent Test**: Verify a pull returns a card within 2 seconds, animation plays, and the button enforces a 2-second cooldown.

### Implementation for User Story 8

- [ ] T036 [P] [US8] Build the random-pull button and reveal animation UI in `frontend/src/components/RandomPull.jsx`
- [ ] T037 [US8] Implement backend random-pull endpoint and throttle rules in `backend/src/apps/users/throttles.py` and `backend/src/apps/cards/views.py`
- [ ] T038 [US8] Add collection increment handling for logged-in pulls in `backend/src/apps/collections/views.py`

### Tests for User Story 8

- [ ] T060 [P] Add random-pull, animation trigger, cooldown, and collection-update tests.

**Checkpoint**: User Story 8 is independently testable as a gamified discovery flow.

---

## Phase 11: User Story 9 - Trade Offers & Community Matching (Priority: P3)

**Goal**: Deliver form-based trade offers, matching suggestions, and trade status updates.

**Independent Test**: Verify a trade offer is created, matching logic finds candidates, and trade acceptance updates both collections.

### Implementation for User Story 9

- [ ] T039 [P] [US9] Build the trade marketplace and offer form in `frontend/src/pages/TradingMarketplacePage.jsx`
- [ ] T040 [US9] Implement trade offer models, matching, and status updates in `backend/src/apps/trading/views.py`
- [ ] T041 [US9] Add Celery tasks for background trade matching in `backend/src/apps/trading/tasks.py`

### Tests for User Story 9

- [ ] T061 [P] Add trade-offer creation, match suggestion, and status-update tests.

**Checkpoint**: User Story 9 is independently testable for community trade workflows.

---

## Phase 12: User Story 10 - Shared Decks & Community Engagement (Priority: P3)

**Goal**: Deliver public deck sharing, upvotes, comments, and copy-to-user workflows.

**Independent Test**: Verify a user can publish a deck, upvote or comment on it, and copy it into their own account.

### Implementation for User Story 10

- [ ] T042 [P] [US10] Build the community deck browser and deck detail UI in `frontend/src/pages/CommunityDecksPage.jsx`
- [ ] T043 [US10] Implement shared deck, comment, and vote models/views in `backend/src/apps/community/views.py`
- [ ] T044 [US10] Add deck copy and leaderboard logic in `backend/src/apps/community/services.py`

### Tests for User Story 10

- [ ] T062 [P] Add shared-deck vote, comment, and copy-to-user tests.

**Checkpoint**: User Story 10 is independently testable for community sharing.

---

## Phase 13: User Story 11 - Admin Dashboard & API Monitoring (Priority: P3)

**Goal**: Deliver admin metrics, cache controls, and audit logging.

**Independent Test**: Verify an admin sees metrics, clears cache, refreshes the banlist, and audit events are recorded.

### Implementation for User Story 11

- [ ] T045 [P] [US11] Build the admin dashboard and action controls in `frontend/src/pages/AdminDashboardPage.jsx`
- [ ] T046 [US11] Implement admin metrics, cache refresh, and audit-log endpoints in `backend/src/apps/admin_tools/views.py`
- [ ] T047 [US11] Add admin permission and metrics collection tasks in `backend/src/apps/admin_tools/tasks.py`

### Tests for User Story 11

- [ ] T063 [P] Add admin dashboard, cache-clear, banlist-refresh, and audit-log tests.

**Checkpoint**: User Story 11 is independently testable as the administration workflow.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Finalize quality, documentation, and release-readiness across all stories.

- [ ] T048 [P] Update root `README.md` after implementation milestones and summarize setup/validation steps
- [ ] T049 [P] Hardening pass for accessibility, responsive behavior, and error handling in `frontend/src/components/` and `frontend/src/pages/`
- [ ] T050 Run the quickstart validation flow from `specs/001-duel-archive/quickstart.md` and fix any blockers

### Tests for Polish

- [ ] T064 [P] Add cross-phase regression and smoke tests covering the completed MVP flow.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Setup completion and blocks all story work
- User Story phases (Phases 3–13): depend on Foundational completion
- Polish (Phase 14): depends on all desired user stories being complete

### Story Order

1. User Story 1 (P1) - guest search and card detail discovery
2. User Story 2 (P1) - authentication and guest migration
3. User Story 3 (P2) - deck building and YDK workflows
4. User Story 4 (P2) - detail-page layout and data presentation
5. User Stories 5–11 (P3) - wishlist, collection, gallery, random pull, trading, community, admin

### Parallel Opportunities

- `T004`, `T007`, `T008` can run in parallel during setup/foundation
- Once foundational tasks finish, all user-story phases can begin in parallel across multiple contributors
- Within each story, UI and backend tasks marked `[P]` can be worked on simultaneously

### Suggested MVP Scope

- Deliver User Story 1 and User Story 2 first for the minimum viable guest-to-authenticated search experience
- Then add User Story 3 and User Story 4 to complete the core deck-building and detail workflow
