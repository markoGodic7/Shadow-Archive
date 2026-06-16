# Shadow Archive Constitution

## Purpose

Shadow Archive is a Yu-Gi-Oh! card database web application providing comprehensive card information, search, filtering, deck building, and collection management through a modern React frontend backed by Django REST Framework and PostgreSQL. All card data originates from the YGOPRODeck API (v7) as the authoritative source of truth. This constitution establishes non-negotiable constraints, technical requirements, and governance rules to ensure consistent quality, compliance with external API terms, and maintainable architecture throughout all development phases.

## Core Principles

### I. YGOPRODeck API as Authoritative Source (NON-NEGOTIABLE)

The YGOPRODeck API at `https://db.ygoprodeck.com/api/v7/` is the sole authoritative source of card data. All card information, images, and pricing must be obtained exclusively from this API. MUST use the following endpoints:
- `cardinfo.php` – card details, filtering, sorting
- `randomcard.php` – random card selection (no more than once per 2 seconds)
- `cardsets.php` – all available card sets
- `cardsetsinfo.php` – cards within a specific set
- `archetypes.php` – all archetype names
- `checkDBVer.php` – database version and update date

Raw API response dumps and binary card images MUST NEVER be committed to Git. No direct hotlinking to `images.ygoprodeck.com` is permitted.

### II. Backend Caching Proxy (NON-NEGOTIABLE)

The Django backend acts as a caching proxy to minimize API calls and serve users quickly. MUST:
- Cache all API responses in PostgreSQL for at least 48 hours (2 days) aligned with API cache headers
- Enforce rate limiting at maximum 15 API calls per second (safely below the 20 req/s limit) to avoid 1-hour IP bans
- Implement back-off and retry logic with exponential backoff
- Include meaningful User-Agent headers identifying the application
- Download all card images from YGOPRODeck image URLs and host on Django media storage
- Never expose the external API directly to clients; all communication is server-side
- Use `misc=yes` parameter only when additional metadata is needed, not for every request
- Support language variants (English [default], French, German, Italian, Portuguese) with separate storage per language

### III. Figma-Generated Source Files as Layout Authority (NON-NEGOTIABLE)

Figma Make source files in the `/design` directory define the exact layout, spacing, sizing, and component structure for all pages and are the authoritative template for component markup. MUST:
- Use Figma files as the starting point for every component implementation
- Extract exact HTML structure, CSS class names, and layout hierarchy from Figma source files before generating code
- Never modify the layout structure from Figma files; only enhance with dynamic behaviour, state management, and data binding
- Prioritise Figma layout over functionality when conflicts arise; adapt functionality to fit the design
- Use custom CSS (CSS Modules) only for styles that cannot be achieved with Tailwind utilities:
  - Complex animations and keyframes (card flip, reveal, shimmer, pulsing glow)
  - Gradients beyond Tailwind's built-in utilities
  - Custom scrollbar styling and pseudo-elements (::before, ::after)
  - CSS Grid layouts exceeding Tailwind's grid utilities
  - Backdrop filters and complex blend modes
  - @font-face declarations and print stylesheets
  - Any style property with no direct Tailwind equivalent
- Place custom CSS in co-located CSS Module files (`ComponentName.module.css`)
- Import styles as objects: `import styles from './ComponentName.module.css'`
- Maintain consistency with design system colours, spacing scale, and typography from Figma and Tailwind config

### IV. JavaScript-Only Frontend (NON-NEGOTIABLE)

React frontend MUST be written in JavaScript (NOT TypeScript). All components, hooks, contexts, and utility files use `.jsx/.js` extensions. Props are documented using JSDoc comments instead of TypeScript interfaces. TypeScript usage is prohibited everywhere in the frontend codebase.

### V. API Response Compliance (NON-NEGOTIABLE)

Card data responses MUST include these YGOPRODeck API fields when available:
- Core fields: `id`, `name`, `type`, `frameType`, `desc`, `atk`, `def`, `level`, `race`, `attribute`, `scale`, `linkval`, `linkmarkers`, `archetype`
- Card sets: `card_sets` (with `set_name`, `set_code`, `set_rarity`, `set_price`)
- Card images: `card_images` (with `id`, `image_url`, `image_url_small`, `image_url_cropped`)
- Card prices: `card_prices` (with `cardmarket_price`, `tcgplayer_price`, `ebay_price`, `amazon_price`, `coolstuffinc_price`)
- Ban list: `banlist_info` (with `ban_tcg`, `ban_ocg`, `ban_goat`)
- Additional metadata (when `misc=yes`): `beta_name`, `views`, `upvotes`, `downvotes`, `formats`, `treated_as`, `tcg_date`, `ocg_date`, `konami_id`, `has_effect`

### VI. Visual Consistency Across All Views (NON-NEGOTIABLE)

All pages MUST adhere to these visual standards:
- Card detail pages: two-column layout with scrollable info panel (left) and fixed full-size card image using `image_url` (right)
- Card lists and grids: use small thumbnail images (`image_url_small`) with lazy loading
- All pages: mobile-responsive using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- All interactive elements: accessible ARIA labels and keyboard navigation support
- Loading states: skeleton placeholders or spinners
- Error states: user-friendly messages with retry options

### VII. Testing Standards Per Phase (NON-NEGOTIABLE)

At the end of EVERY implementation phase, AI MUST write and verify all necessary tests before marking the phase complete. MUST include:
- Frontend: React Testing Library for component rendering, user interactions, state changes; Jest for utility functions
- Backend: Django test cases for API endpoints, model methods, caching logic, rate limiting
- Coverage: happy path, error states, edge cases, loading states, empty states
- Gate: Phase is not marked complete until all tests pass with green output
- No exceptions: every phase delivery must include passing test suites

### VIII. Data Flow Authority (NON-NEGOTIABLE)

Client-to-server data flow MUST follow this exact sequence:
1. Client requests data from Django API
2. Django checks cache (PostgreSQL); if valid and not expired, return cached data
3. On cache miss or expiry, Django queries YGOPRODeck API with appropriate parameters
4. Django processes response, downloads any missing card images, saves to local DB
5. Returns formatted JSON to client
6. Card images served exclusively via Django media URL, never from `images.ygoprodeck.com`

## Technical Standards

### Backend

- Framework: Django with Django REST Framework
- Database: PostgreSQL for all persistent data (card cache, user accounts, decks, collections, price snapshots)
- Authentication: djangorestframework-simplejwt for JWT access/refresh tokens
- Custom registration endpoint: accepts email, password, optional device_id for guest data migration
- Guest identification: UUIDv4 in localStorage, sent as `X-Device-ID` header
- Background tasks: Celery with Redis broker for periodic price snapshots and email alerts
- File handling: Django media storage for downloaded card images
- YDK files: parsed/generated in Python
- API responses: JSON format exclusively

### Frontend

- Framework: React with React Router v6+ (lazy-loaded page components)
- Language: JavaScript (.jsx/.js files only; NO TypeScript)
- State Management: Redux Toolkit for global state; React Context for theme and language; localStorage for guest data
- Styling: Tailwind CSS exclusively for base styles; CSS Modules only for complex custom styles
- Dark mode: Tailwind `dark:` variant
- Component documentation: JSDoc comments for props (no TypeScript interfaces)
- Build tool: Vite
- Testing: Jest + React Testing Library

### Common Standards

- Linting: ESLint with React plugin; NO TypeScript-specific rules
- Formatting: Prettier
- Git: No secrets, API keys, .env files, or binary images committed; .gitignore excludes node_modules/, venv/, media/, staticfiles/, .env, dist/
- Conventional commits: feat:, fix:, chore:, docs:, test: prefixes
- CI/CD: GitHub Actions running tests and linting on every pull request
- CodeRabbit: automated PR reviews on all pull requests

## Development Workflow

- Feature branches created from main, merged via reviewed pull requests
- SpecKit generates specs, plans, and task breakdowns before coding begins
- Commits are small, atomic, and use conventional commit messages
- All new features include tests (passing) before merge
- Figma source files in `/design` directory are read-only reference files
- At start of every implementation phase: AI MUST read and inspect all relevant Figma source files before generating component code
- API rate limiting enforced server-side; no client-side API calls permitted
- Guest user data migrated on signup via device_id parameter
- README.md MUST be created and updated after each phase with current status, completed features, and setup/deployment instructions

## Data Sources and Constraints

### Supported Endpoints and Response Handling

**Card Information** (`cardinfo.php`)
- Supports filters: name, fname, id, type, atk, def, level, race, attribute, link, linkmarker, scale, cardset, archetype, banlist, sort, format, misc, staple, has_effect, startdate, enddate, dateregion, num, offset, language
- Cache for 48 hours minimum; use appropriate pagination (num, offset)

**Random Card** (`randomcard.php`)
- No parameters, cache control disabled
- Rate limited: no more than once per 2 seconds per client
- Used for "Random Card" feature only

**Card Sets** (`cardsets.php`)
- Returns set names, codes, card counts, TCG dates
- Cache for 48 hours

**Card Set Details** (`cardsetsinfo.php?setcode=CODE`)
- Returns all cards within a specific set
- Cache for 48 hours

**Archetypes** (`archetypes.php`)
- Returns archetype names
- Cache for 48 hours

**Database Version** (`checkDBVer.php`)
- Returns current database version and last update date
- Used for staleness detection; refresh when local DB version < API version

### Image Handling

- `image_url`: Full-size card image for detail page display
- `image_url_small`: Thumbnail for lists/grids with lazy loading
- `image_url_cropped`: Cropped image for spoiler gallery view
- All images downloaded and hosted on Django; never served from `images.ygoprodeck.com`
- Implement image caching with appropriate HTTP cache headers

## Governance

This constitution is authoritative and supersedes all other development practices. All PRs and code reviews MUST verify compliance with these principles. Amendments require:
- Documented rationale with impact analysis
- Approval from project maintainers
- Migration plan for any breaking changes
- Version bump per semantic versioning rules (MAJOR for backward-incompatible changes; MINOR for new principles; PATCH for clarifications)

Principles marked NON-NEGOTIABLE are non-waivable constraints; exceptions require explicit written approval and board consensus.

Runtime development guidance is documented in `.github/copilot-instructions.md` and per-phase SpecKit artifacts (spec.md, plan.md, tasks.md). Refer to these files during implementation for detailed technical guidance aligned with this constitution.

**Version**: 1.0.1 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
