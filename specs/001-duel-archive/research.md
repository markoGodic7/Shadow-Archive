# Research Document: Duel Archive Technical Deep Dive

**Created**: 2026-06-16  
**Phase**: 0 (Research & Clarification)  
**Purpose**: Resolve all technical unknowns and document findings for Phase 1 design

## 1. YGOPRODeck API Deep Dive

### Finding: API Structure & Endpoints

The YGOPRODeck API v7 at `https://db.ygoprodeck.com/api/v7/` provides card data with the following structure:

**Endpoints:**
- `cardinfo.php` – Main endpoint for card search and filtering
  - Supports: `name`, `fname` (fuzzy name), `id`, `type`, `atk`, `def`, `level`, `race`, `attribute`, `link`, `linkmarker`, `scale`, `cardset`, `archetype`, `banlist`, `sort`, `format` (TCG/OCG/Goat), `misc` (additional metadata), `staple`, `has_effect`, `startdate`, `enddate`, `dateregion`, `num` (limit), `offset`, `language` (EN/FR/DE/IT/PT)
  - Response: JSON array of card objects
  - Rate limit: 20 req/s per IP (per API documentation)
  - Caching headers: Respects standard HTTP cache headers

- `randomcard.php` – Returns single random card
  - No parameters; cache control disabled (not cacheable on CDN)
  - Rate limit: Informal (no hard limit stated); best practice: 1 request per 2 seconds
  - Response: Single card object in JSON

- `cardsets.php` – Lists all available card sets
  - No parameters
  - Response: Array of set objects (set_code, set_name, card_count, tcg_date, ocg_date)
  - Caching: Recommended 48h (low-frequency change)

- `cardsetsinfo.php?setcode=CODE` – Cards in specific set
  - Parameter: `setcode` (e.g., "LEDE-EN001" format or set code only)
  - Response: Array of card objects filtered to set

- `archetypes.php` – Lists all archetypes
  - No parameters
  - Response: Simple string array of archetype names
  - Caching: Recommended 48h

- `checkDBVer.php` – Database version info
  - No parameters
  - Response: `{version: "X.Y", lastUpdate: "YYYY-MM-DD"}`
  - Use to detect staleness of local cache

### Card Response Field Structure

```json
{
  "id": 25955203,
  "name": "Blue-Eyes White Dragon",
  "type": "Normal Monster",
  "frameType": "normal",
  "desc": "This legendary dragon is a powerful engine of destruction...",
  "atk": 3000,
  "def": 2500,
  "level": 8,
  "race": "Dragon",
  "attribute": "LIGHT",
  "archetype": "Blue-Eyes",
  "scale": null,
  "linkval": null,
  "linkmarkers": [],
  "card_sets": [
    {
      "set_name": "Blue-Eyes Alternative Ultimate Dragon",
      "set_code": "DUOV-EN001",
      "set_rarity": "Ultra Rare",
      "set_price": 12.50
    }
  ],
  "card_images": [
    {
      "id": 25955203,
      "image_url": "https://images.ygoprodeck.com/images/cards/...",
      "image_url_small": "https://images.ygoprodeck.com/images/cards_small/...",
      "image_url_cropped": "https://images.ygoprodeck.com/images/cards_cropped/..."
    }
  ],
  "card_prices": [
    {
      "cardmarket_price": 9.99,
      "tcgplayer_price": 11.50,
      "ebay_price": 10.00,
      "amazon_price": null,
      "coolstuffinc_price": 8.99
    }
  ],
  "banlist_info": {
    "ban_tcg": "Not Banned",
    "ban_ocg": "Not Banned",
    "ban_goat": "Not Banned"
  }
}
```

(With `misc=yes` parameter, additional fields available: `beta_name`, `views`, `upvotes`, `downvotes`, `formats`, `treated_as`, `tcg_date`, `ocg_date`, `konami_id`, `has_effect`)

### Decision: Cache Strategy

**Chosen**: PostgreSQL-based caching in Django

**Rationale**: 
- Simple implementation (one database layer)
- Sufficient for MVP (10,000 concurrent users)
- Cache TTL: 48 hours (aligns with API documentation and typical TCG data update cycles)
- Invalidation: Cache the API database version separately with its own TTL (24 hours). A Celery background job checks `checkDBVer.php` every 24 hours and updates the cached version. On each card info request, compare against this cached version without making an additional API call. Only re-fetch card data if the background job has detected a version increment since the last cache refresh.

**Alternatives Considered**:
- Redis caching – Rejected for MVP due to additional infrastructure complexity; deferred to v2 scale-up
- CDN caching – Rejected because API has CORS/CORS-preflight headers; static CDN doesn't support dynamic queries
- In-memory Python caching – Rejected because doesn't survive app restarts; unsuitable for multi-instance deployment

### Decision: Rate Limiting Strategy

**Chosen**: Custom Django throttle (15 req/s to YGOPRODeck API)

**Rationale**:
- 15 req/s safely below 20 req/s hard limit (33% buffer)
- Implemented in backend only (client never calls API directly)
- Prevents 1-hour IP ban if rate limit exceeded
- Exponential backoff + retry logic: 1s → 2s → 4s → 8s with random jitter

**Alternatives Considered**:
- Redis-based rate limiting – Deferred to v2; requires additional Redis instance
- Distributed rate limiting (across multiple instances) – Deferred to v2; requires coordination layer

---

## 2. Figma Layout Review

### Finding: Design System & Component Patterns

Figma Make source files in `/design/` directory define authoritative layout templates. Key findings:

**Layout Patterns**:
- Card detail page: Two-column flex layout (50%/50% split on desktop; responsive)
  - Left column: Scrollable (overflow-y: auto) with card metadata (stats, description, sets, prices, banlist)
  - Right column: Sticky (position: sticky; top: 0) with full-size card image
  - Mobile (<768px): Stacked single-column (image on top or below)

- Search results: Grid layout with cards using `image_url_small` thumbnails
  - Desktop: 4 columns (each 200px + gap)
  - Tablet: 2 columns
  - Mobile: 1 column

- Gallery/spoiler: Grid with `image_url_cropped` artworks
  - Desktop: 6 columns; Tablet: 4 columns; Mobile: 2 columns
  - Lazy loading on scroll

**Tailwind Usage**:
- Figma exports CSS with Tailwind class names (e.g., `flex`, `items-center`, `gap-4`, `p-6`)
- Responsive prefixes: `sm:`, `md:`, `lg:` for breakpoint-specific styles
- Dark mode: `dark:` prefix for dark theme variants

**Animation Candidates (CSS Module)**:
- Card reveal animation (on random pull): Fade-in + scale keyframe
- Wishlist heart fill: Heartbeat + color-fill keyframe
- Price drop notification: Slide-in + scale pulse keyframe
- Tab transitions: Fade in/out between deck sections

**Decision**: Adopt Figma exports as-is; CSS Modules for animations

**Rationale**: 
- Figma HTML/CSS is authoritative source of truth
- Tailwind classes already defined; no additional abstraction layer needed
- CSS Modules reserved for complex keyframe animations (60 FPS requirement)
- No layout modification without explicit accessibility/responsive requirement

---

## 3. Redux State Architecture

### Finding: Global State Shape

**Redux store structure** (organized by feature):

```javascript
{
  auth: {
    user: {id, email, profile_url, language, theme, ...},
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    tokens: {
      access: "eyJ...",
      refresh: "eyJ...",
      access_expires_at: timestamp
    }
  },
  cards: {
    searchResults: [{id, name, image_url_small, ...}, ...],
    filters: {
      name: string,
      type: string,
      attribute: string,
      level: [min, max],
      atk: [min, max],
      def: [min, max],
      archetype: string,
      format: string,
      sort: "name|newest|popularity"
    },
    pagination: {
      currentPage: 1,
      pageSize: 20,
      total: 1250,
      totalPages: 63
    },
    selectedCard: {id, name, type, desc, image_url, card_sets, card_prices, banlist_info, ...},
    isLoading: boolean,
    error: string | null,
    recentlyViewed: [{id, name, viewed_at}, ...] // Also in localStorage for guests
  },
  deck: {
    current: {
      id: "deck-123",
      name: "Blue-Eyes Control",
      description: "...",
      mainDeck: [
        {card_id: 25955203, name: "Blue-Eyes", quantity: 3},
        ...
      ],
      extraDeck: [{card_id: 12345678, quantity: 1}, ...],
      sideDeck: [{card_id: 87654321, quantity: 3}, ...],
      isValid: true,
      validationErrors: []
    },
    decks: [{id, name, is_public, created_at}, ...],
    deckStats: {
      cardTypeDistribution: {Monster: 28, Spell: 7, Trap: 5},
      attributeCurve: {Light: 10, Fire: 5, ...},
      levelCurve: {1: 2, 2: 3, ..., 8: 5},
      estimatedCost: 245.99,
      mostExpensiveCards: [{name, price}, ...]
    },
    isImporting: boolean,
    error: string | null
  },
  wishlist: {
    items: [{card_id, name, price_alert_threshold, alert_active}, ...],
    isLoading: boolean
  },
  collection: {
    items: [{card_id, quantity, condition, set_code, rarity}, ...],
    filters: {condition: "NM", set_code: "", rarity: ""},
    totalValue: 1250.50,
    isLoading: boolean
  },
  ui: {
    theme: "light" | "dark",
    language: "en" | "fr" | "de" | "it" | "pt",
    sidebarOpen: boolean,
    notificationQueue: [{type, message, duration}, ...]
  },
  admin: {
    apiMetrics: {
      callsToday: 450,
      callsLastWeek: 3200,
      currentReqPerSec: 5.3,
      cacheHitRatio: 0.87,
      avgResponseTime: 145
    },
    cacheSize: 125.5, // MB
    usersOnline: 342,
    isLoading: boolean
  }
}
```

**Decision**: Use Redux Toolkit with feature-based slices

**Rationale**:
- Redux Toolkit simplifies reducer/action boilerplate (createSlice)
- Immer library for immutable updates built-in
- DevTools support for debugging state changes
- Feature-based organization scales to multiple teams

---

## 4. React Router Lazy Loading & Code Splitting

### Finding: Route Structure

**Route configuration** (with lazy loading):

```javascript
const routes = [
  { path: "/", element: <HomePage /> }, // Home/search
  { path: "/cards/:id", element: <CardDetailPage /> }, // Card detail
  { path: "/search", element: <SearchPage /> }, // Advanced search
  { path: "/gallery", element: <GalleryPage /> }, // Spoiler gallery
  { path: "/login", element: <LoginPage /> }, // Auth pages
  { path: "/register", element: <RegisterPage /> },
  { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: "/decks", element: <ProtectedRoute><MyDecksPage /></ProtectedRoute> },
  { path: "/decks/new", element: <ProtectedRoute><DeckBuilderPage /></ProtectedRoute> },
  { path: "/decks/:id/edit", element: <ProtectedRoute><DeckBuilderPage /></ProtectedRoute> },
  { path: "/decks/:id", element: <DeckDetailPage /> }, // Public view
  { path: "/wishlist", element: <ProtectedRoute><WishlistPage /></ProtectedRoute> },
  { path: "/collection", element: <ProtectedRoute><CollectionPage /></ProtectedRoute> },
  { path: "/trading", element: <ProtectedRoute><TradingMarketplacePage /></ProtectedRoute> },
  { path: "/community/decks", element: <CommunityDecksPage /> },
  { path: "/admin", element: <ProtectedRoute isAdmin><AdminDashboardPage /></ProtectedRoute> }
];
```

**Code splitting strategy**: 
- Home, SearchPage: Critical (no lazy load)
- CardDetail, Gallery, CommunityDecks: Route-level lazy load (React.lazy + Suspense)
- Admin, Profile, Deck pages: Protected route lazy load
- UI components: Bundled with page (no separate chunk)

**Decision**: Route-level code splitting with React.lazy

**Rationale**:
- Reduces initial bundle size (users without admin access don't download admin components)
- Lazy loading applied to protected routes and secondary pages
- Loading fallback shows spinner while chunk downloads
- Search/Home loaded immediately (critical path)

---

## 5. JWT Token Refresh Flow & API Interceptor

### Finding: Session Management Architecture

**Token lifecycle**:
1. User logs in → API returns `{access_token, refresh_token, access_expires_in: 900}` (15 min expiry as example) and sets refresh token as an httpOnly, Secure, SameSite cookie
2. Access token stored in-memory only (Redux store); never persisted to sessionStorage or localStorage
3. Refresh token stored exclusively in httpOnly cookie (inaccessible to JavaScript, survives app restart)
4. On access token expiry → API interceptor catches 401 → calls refresh endpoint (cookie sent automatically) → receives new access token
5. If refresh succeeds → update in-memory access token and retry original request
6. If refresh fails → clear in-memory token, backend clears refresh cookie, redirect to login

**API Client Configuration** (axios interceptor):

```javascript
// Request interceptor: add Authorization header
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.tokens.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token refresh
// Refresh token is sent automatically via httpOnly cookie; no manual token handling needed
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._isRetry) {
      error.config._isRetry = true;
      try {
        // Refresh endpoint reads httpOnly cookie automatically
        const response = await axios.post('/api/auth/refresh/', {}, { withCredentials: true });
        const newAccessToken = response.data.access;
        store.dispatch(setAccessToken(newAccessToken));
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(error.config); // Retry original request
      } catch {
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Decision**: Refresh token in httpOnly, Secure, SameSite cookie; access token in Redux memory only

**Rationale**:
- httpOnly cookie prevents XSS token theft
- Samite/Secure flags prevent CSRF and unencrypted transmission
- Backend rotates refresh token on each use (optional security enhancement for v2)

---

## 6. YDK Format Specification & Deck Import/Export

### Finding: Deck Serialization Format

**YDK format** (standard Yu-Gi-Oh! Deck file format):

```
#main
25955203
25955203
25955203
12345678
...
!side
87654321
87654321
...
!extra
11111111
...
```

- `#main` section: main deck card IDs (40+ cards)
- `!extra` section: extra deck card IDs (≤15 cards)
- `!side` section: side deck card IDs (≤15 cards)
- One card ID per line
- Comments (lines starting with `//`) are ignored
- Blank lines ignored

**Import/Export logic**:
1. Export: Loop through deck_cards; write card IDs to file in sections; download as `.ydk` file
2. Import: Parse `.ydk` file; extract card IDs; validate deck size and banlist; create or update deck

**Decision**: Accept YDK format as-is; no custom formats in v1

**Rationale**:
- YDK is standard across deck-building tools
- User familiarity high (can import from EDOPro, YGOProDeck editors)
- No additional format complexity needed for MVP

---

## 7. Django Serializer Patterns & Nested Relationships

### Finding: API Response Serialization

**Card serializer** (nested structure):

```python
class CardSerializer(serializers.ModelSerializer):
    card_sets = CardSetSerializer(many=True, read_only=True)
    card_images = CardImageSerializer(many=True, read_only=True)
    card_prices = CardPriceSerializer(many=True, read_only=True)
    banlist_info = BanlistStatusSerializer(read_only=True)
    
    class Meta:
        model = Card
        fields = [
            'id', 'name', 'type', 'frameType', 'desc', 'atk', 'def', 
            'level', 'race', 'attribute', 'archetype', 'scale', 
            'linkval', 'linkmarkers', 'card_sets', 'card_images', 
            'card_prices', 'banlist_info'
        ]
```

**Pagination**: DRF PageNumberPagination (simple page-number based)
- Example: `GET /api/cards/?page=1&page_size=20`
- Response includes: `{count, next, previous, results: []}`

**Filtering**: django-filter with SearchFilter for name/fname; ChoiceFilter for type/attribute/etc.

**Decision**: Nested serializers for related data; pagination via DRF

**Rationale**:
- Nested structure matches API response format (reduces client-side data transformation)
- PageNumberPagination simpler than cursor-based for UI (users expect "Page X" controls)
- SearchFilter handles fuzzy matching and field mapping

---

## 8. Celery Task Scheduling & Background Jobs

### Finding: Async Task Architecture

**Background tasks required**:

1. **Price snapshot collection** (daily, midnight UTC)
   - Fetch current card prices from YGOPRODeck
   - Store price history for charting
   - Task: `celery_tasks.py:collect_price_snapshots()`

2. **Price drop alerts** (on-demand)
   - Check wishlist items against current prices
   - If price < threshold → send email
   - Task: `celery_tasks.py:send_price_alerts()`

3. **Trade matching** (hourly)
   - Find pending trade offers
   - Match based on offered/wanted cards and user collections
   - Notify matched users
   - Task: `celery_tasks.py:match_trades()`

4. **Random card of the day** (daily, if feature added)
   - Fetch and cache random card
   - Task: `celery_tasks.py:fetch_random_card_of_day()`

5. **Banlist update** (weekly)
   - Check YGOPRODeck for updated banlist
   - Update local banlist_info records
   - Task: `celery_tasks.py:update_banlist()`

6. **API metrics collection** (every 5 minutes)
   - Count API calls, cache hits, current req/s
   - Store for admin dashboard
   - Task: `celery_tasks.py:collect_api_metrics()`

**Celery Configuration**:
- Broker: Redis (or RabbitMQ in v2)
- Beat scheduler: Celery Beat (periodic task schedule)
- Worker: Single process (v1); multi-process in v2
- Result backend: Redis or database

**Decision**: Celery + Redis for async tasks

**Rationale**:
- Celery is industry standard for Python background tasks
- Redis broker is lightweight and fast for MVP
- Beat scheduler handles periodic tasks elegantly
- Email sending deferred (no blocking API calls)

---

## 9. CSS Module Animation Performance & 60 FPS Target

### Finding: Animation Implementation Strategy

**CSS keyframe animations** (for 60 FPS):

```css
@keyframes cardReveal {
  from {
    opacity: 0;
    transform: scale(0.95) rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

@keyframes heartFill {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
```

**Performance considerations**:
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `position` (layout thrashing)
- CSS animations run on GPU; JavaScript setTimeout animations on CPU (slower)
- Use `will-change: transform` for animations (hints browser to optimize)

**Decision**: CSS Modules for all animations; no JavaScript animations

**Rationale**:
- CSS animations GPU-accelerated → 60 FPS guaranteed
- Simpler implementation (no React animation libraries needed)
- Better performance on mobile devices
- Figma exports include animation specs (replicate in CSS Modules)

**Alternatives Considered**:
- React Spring – Rejected; adds complexity; CSS Modules sufficient for MVP
- Framer Motion – Same reason; overkill for card reveals and heart fills
- CSS-in-JS (styled-components) – Rejected; CSS Modules more standard and lighter

---

## 10. Mobile Responsive Breakpoints & Accessibility

### Finding: Responsive Design Strategy

**Tailwind breakpoints** (from Figma):
- `sm`: 640px (small phone)
- `md`: 768px (tablet, iPad mini)
- `lg`: 1024px (desktop, iPad pro)
- `xl`: 1280px (large desktop)

**Responsive patterns**:
- Card detail: 2-column desktop (50/50) → 1-column mobile (<768px)
- Search results: 4-column desktop → 2-column tablet → 1-column mobile
- Gallery: 6-column desktop → 4-column tablet → 2-column mobile

**Accessibility requirements**:
- ARIA labels on all interactive elements: `aria-label="Add to wishlist"`, `aria-describedby="help-text"`
- Semantic HTML: `<button>`, `<input>`, `<label>` (not divs styled as buttons)
- Keyboard navigation: Tab focus visible, Enter activates buttons, Escape closes modals
- Color contrast: ≥4.5:1 for normal text, ≥3:1 for large text (WCAG AA)
- Images: `alt` text required; alt="" for decorative images

**Decision**: Tailwind responsive + semantic HTML + ARIA labels

**Rationale**:
- Tailwind's `sm:`/`md:`/`lg:` prefixes handle breakpoints without media queries
- Semantic HTML improves screen reader experience
- ARIA attributes provide additional context for assistive tech
- Lighthouse accessibility score target: ≥90

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Caching** | PostgreSQL, 48h TTL; version check via background job every 24h | Avoids burning rate limit on version checks; aligns with API standards |
| **Rate Limiting** | Django throttle, 15 req/s, exponential backoff | Safe margin below 20 req/s limit; prevents IP ban |
| **Figma Authority** | Use exports as-is; CSS Modules only for animations | Figma is source of truth; no layout overrides |
| **Redux State** | Feature-based slices with Redux Toolkit | Scalable, immer support, devtools integration |
| **Routing** | React Router v6 with lazy loading on secondary pages | Reduces initial bundle; fast critical path |
| **Token Refresh** | httpOnly cookie + in-memory access token | Prevents XSS; transparent refresh |
| **Deck Format** | YDK only; standard format | User familiarity; interop with other tools |
| **Serialization** | Nested DRF serializers; PageNumberPagination | Matches API response; simple pagination |
| **Async Tasks** | Celery + Redis; 5 background jobs | Industry standard; handles all async needs |
| **Animations** | CSS Modules; GPU-accelerated keyframes | 60 FPS guaranteed; simple implementation |
| **Responsive** | Tailwind breakpoints + semantic HTML + ARIA | Standard accessibility; lightweight |

---

**Phase 0 Complete** ✅

All research questions resolved. No NEEDS CLARIFICATION remains. Ready to proceed to Phase 1 design.

**Version**: 1.0.0 | **Updated**: 2026-06-16
