# Feature Specification: Duel Archive – Yu-Gi-Oh! Card Database & Deck Management Web App

**Feature Branch**: `001-duel-archive`

**Created**: 2026-06-16

**Status**: Draft

**Input**: Build a Yu‑Gi‑Oh! card database and deck management web app named "Duel Archive". The app serves three user tiers: guests, registered users, and admins with extensive card search, filtering, deck building, collection management, trading, and community features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest Card Search and Browse (Priority: P1)

A guest user visits Duel Archive to research cards for a deck they're building offline. They search by card name, filter by type (Monster/Spell/Trap), attribute (Fire/Water/etc.), level/rank, ATK/DEF range, archetype, format, and date range. Results display in a paginated list with small thumbnail images (image_url_small). They click a card to view its detail page: a two-column layout with scrollable left panel (stats, description, card sets with prices, banlist status) and fixed full-size artwork (image_url) on the right. They can mark cards as recently viewed (stored in localStorage) and return to see them without searching again.

**Why this priority**: Card search is the foundation of the app; 100% of users (guests + registered) must search cards. Without functional search, the app has no value. This is the core MVP slice.

**Independent Test**: Can be fully tested by: (1) Search for a card by name, (2) Apply filters (type, attribute, level, archetype), (3) Paginate results, (4) Click a card and verify detail page renders with two-column layout, (5) Verify recently viewed list persists in localStorage after page reload. Delivers: functional card discovery without account.

**Acceptance Scenarios**:

1. **Given** a guest visits the search page, **When** they enter "Blue-Eyes" in the search box and press Enter, **Then** results matching that name appear in paginated list with image_url_small thumbnails within 2 seconds.
2. **Given** search results are displayed, **When** they filter by Type = "Synchro Monster" and Level >= 7, **Then** only Synchro Monsters level 7+ appear; filter controls show selected values.
3. **Given** results show 100+ matches, **When** they navigate to page 2, **Then** new cards load and URL reflects page parameter; page 1 button appears to navigate back.
4. **Given** they click on a card in the list, **When** the detail page loads, **Then** left panel shows full stats/description/sets/prices/banlist, right panel shows fixed full-size image, layout is two-column (responsive to mobile: single column).
5. **Given** they view 3 different card details, **When** they return to search and view recently viewed section, **Then** all 3 cards appear ordered newest-first; list persists after page reload.

---

### User Story 2 - User Authentication & Account Registration (Priority: P1)

A guest user decides to save decks and build a collection. They click "Register" and enter email, password, confirming password. Any guest data (recently viewed cards, deck drafts stored in localStorage) is migrated to their account via device_id parameter. After registration, they can log in with JWT tokens (access + refresh). Their session persists; logging out clears tokens and reverts to guest mode.

**Why this priority**: Registration enables all registered-user features (deck building, collection, trading, sharing). P1 because it's a hard prerequisite for 80% of app value. Without auth, users cannot save personal data.

**Independent Test**: Can be fully tested by: (1) Register new account with email/password, (2) Verify device_id sent to backend, (3) Log out and verify guest mode, (4) Log back in and verify previously created deck/wishlist items still exist, (5) Attempt login with wrong password and verify error message. Delivers: authenticated user session with persistent account data and guest data migration.

**Acceptance Scenarios**:

1. **Given** a guest with recently viewed cards in localStorage, **When** they register with email "user@example.com" and password "SecurePass123", **Then** registration endpoint receives X-Device-ID header with guest UUID; after confirmation, login works; previously viewed cards appear in account.
2. **Given** a new registered user, **When** they log in with correct email/password, **Then** access token is issued; they can access protected endpoints; refresh token persists for token renewal.
3. **Given** a logged-in user, **When** they click "Log Out", **Then** tokens are cleared from localStorage; they are redirected to home (guest mode); protected endpoints reject their requests.
4. **Given** a user attempts login with wrong password, **When** they submit the form, **Then** an error message "Invalid email or password" appears after <1 second; no token is issued.
5. **Given** they registered successfully, **When** they close and reopen the app after 1 day, **Then** refresh token is checked; if valid, access token is automatically refreshed; if expired, they are prompted to log in again.

---

### User Story 3 - Registered User Deck Building & Management (Priority: P2)

A registered user creates a new deck named "Blue-Eyes Control" and adds cards to main, extra, and side decks. The system validates deck size (main ≥ 40, extra ≤ 15, side ≤ 15) and banlist rules (banned cards disallowed, limited/semi-limited respects 1/2 limits). They edit the deck, remove cards, test-draw a hand of 5 random cards, then save. They can import/export decks in YDK format, delete decks, and view deck statistics (type distribution, attribute curve, estimated cost). The system suggests budget optimisations (cheaper alternative cards with same role).

**Why this priority**: Deck building is the core value for registered users (P2 because search is more foundational, but this is why users log in). Deck management directly enables trading, sharing, and collection features.

**Independent Test**: Can be fully tested by: (1) Create deck with valid card counts, (2) Attempt to add banned card and verify rejection, (3) Add 3 limited cards (should fail on 4th add), (4) Save and reload—verify deck persists, (5) Export as YDK file and re-import to same account—verify deck recreated identically, (6) View deck stats and cost estimate, (7) Test-draw 5 cards multiple times and verify randomness. Delivers: fully functional deck building with banlist enforcement and import/export.

**Acceptance Scenarios**:

1. **Given** a user creates a new deck, **When** they add 35 main deck cards and 5 extra deck cards, **Then** form shows main=35, extra=5, side=0 counts; save is disabled (main must be ≥40); adding more cards enables save.
2. **Given** they add "Blue-Eyes White Dragon" (TCG limited) to their main deck, **When** they attempt to add a 2nd copy, **Then** an error "Card limited to 1 copy (TCG)" appears; the 2nd copy is not added.
3. **Given** a saved deck exists, **When** they export as YDK, **Then** a .ydk file downloads with standard YDK format (main/extra/side cards listed by ID).
4. **Given** they import a .ydk file with 45 main, 10 extra, 15 side cards, **When** import completes, **Then** deck is created with correct structure; no data is lost; they can edit and save.
5. **Given** a 40-card main deck with 10 Spell cards, 5 Trap cards, 25 Monsters, **When** they view deck statistics, **Then** a bar chart shows type distribution; estimated total deck cost appears (sum of all card prices from API); budget suggestions show "Replace expensive Spell X with cheaper alternative Spell Y (same role)".

---

### User Story 4 - Card Detail Page with Two-Column Layout (Priority: P2)

All users (guest, registered, admin) view card details on a dedicated page. The layout is always two-column: left panel scrolls independently with card stats (ATK/DEF, level, attribute, archetype, description), card sets (set name, code, rarity, price), banlist status (TCG/OCG/Goat), and price history chart. Right panel is fixed, showing the full-size card image (image_url) with a reveal animation on first load (CSS Module).

**Why this priority**: Card detail is the central hub; every user navigates here. Multiple user stories depend on this (deck building links here, wishlist adds from here, collection logs from here). P2 because search (P1) drives traffic to detail, then detail enables P3 features.

**Independent Test**: Can be fully tested by: (1) Navigate to any card detail, (2) Verify left panel scrolls independently, right image stays fixed, (3) Verify all stats display correctly, (4) Verify banlist status appears (banned/limited/unlimited), (5) Check reveal animation triggers on first load (CSS-based), (6) Scroll left panel to bottom and verify price history chart renders, (7) Test on mobile—verify layout becomes single-column or adapts responsively. Delivers: responsive two-column detail layout with animation and all required card data.

**Acceptance Scenarios**:

1. **Given** they navigate to a Monster card detail page, **When** the page loads, **Then** left panel shows: card name, ATK, DEF, level, attribute, type, archetype, description text; right panel shows full-size image with fade-in animation; right panel does not scroll when left panel is scrolled.
2. **Given** they scroll left panel to bottom, **When** price history section appears, **Then** a line chart shows card price over the last 30 days; if no history exists, a message "No price history yet" appears.
3. **Given** they view a card that is TCG-banned, **When** the banlist status section loads, **Then** a red badge "BANNED (TCG)" appears; OCG/Goat status shows separately if different.
4. **Given** they view the card on a mobile device (< 768px), **When** the page renders, **Then** layout adapts to single column (image on top or below text, no fixed positioning).
5. **Given** they navigate to detail for 5 different cards, **When** each card loads, **Then** the reveal animation plays (fade, slide, or CSS keyframe) on every first load; re-visiting same card does not re-trigger animation (browser cache respected).

---

### User Story 5 - Wishlist and Favourite Cards (Priority: P3)

Registered users click a heart icon on any card to add to favourites/wishlist. The card is animated with a heart-fill reveal effect (CSS Module for keyframe animation). Wishlist updates appear in their profile. They can filter wishlist by price range and set email price alerts: "Alert me when [card] drops below [price threshold]".

**Why this priority**: Wishlist is a convenience feature for registered users, not essential for core search/deck building. P3 because it enhances user retention but doesn't block core functionality. Email alerts add value but require Celery integration (post-phase feature).

**Independent Test**: Can be fully tested by: (1) Click heart icon on a card, (2) Verify card is added to wishlist, (3) Verify heart icon fills with animation, (4) Reload page and verify wishlist persists, (5) Navigate to wishlist page and see all added cards, (6) Remove a card from wishlist and verify list updates, (7) Set price alert threshold and verify backend schedules Celery task. Delivers: wishlist with heart animation and basic price alert setup.

**Acceptance Scenarios**:

1. **Given** a registered user views a card detail, **When** they click the heart icon, **Then** the heart fills with a color (red/pink) and an animation plays (scale, glow, or bounce); the card is added to wishlist.
2. **Given** they reload the page, **When** the card detail loads again, **Then** the heart icon is already filled, indicating it's in the wishlist.
3. **Given** they navigate to their Profile > Wishlist, **When** the wishlist page loads, **Then** all favorited cards appear in a grid with image_url_small thumbnails; they can remove cards or set price alerts.
4. **Given** they set a price alert "Alert when price < $5.00", **When** the alert is saved, **Then** a confirmation message "Alert created. You'll receive an email if price drops below $5.00" appears; backend Celery task is scheduled.
5. **Given** the card price drops to $4.50 the next day, **When** Celery processes the price check, **Then** an email is sent to the user's registered address; clicking the email link takes them to the card detail.

---

### User Story 6 - Collection Manager & Card Ownership Tracking (Priority: P3)

Registered users log physical card ownership: quantity, condition (Mint/Near Mint/Lightly Played/etc.), set code, rarity. They can bulk import collections via CSV upload (columns: card_id, quantity, condition, set_code, rarity). Collection appears in their profile with filtering by condition, set, rarity. System calculates total collection value (card_price × quantity).

**Why this priority**: Collection tracking is a nice-to-have for collectors but not essential for core search/deck building. P3 because it appeals to subset of users (physical collectors) and CSV upload adds complexity. However, it doesn't block core features.

**Independent Test**: Can be fully tested by: (1) Add a card to collection with quantity=2, condition="NM", (2) Reload and verify card appears in collection, (3) Upload CSV file with 20 cards, (4) Verify all 20 cards imported and visible, (5) Filter by condition and verify results, (6) View total collection value and verify math is correct. Delivers: functional collection tracking with CSV import.

**Acceptance Scenarios**:

1. **Given** a registered user navigates to Collection Manager, **When** they click "Add Card to Collection" on a card detail, **Then** a modal appears with fields: Quantity, Condition (dropdown), Set Code, Rarity; clicking Save adds the card.
2. **Given** they have 3 cards in collection with conditions [NM, LP, MP], **When** they filter by Condition = "NM", **Then** only the 1 NM card displays; other cards are hidden.
3. **Given** they prepare a CSV file with columns [card_id, quantity, condition, set_code, rarity] and 50 rows, **When** they upload the file, **Then** all 50 cards are imported; duplicates update quantities; success message shows "50 cards imported".
4. **Given** they have a collection with cards worth $2, $5, $10, **When** they view the collection summary, **Then** total value displays "Total Collection Value: $17.00".
5. **Given** they navigate to collection and a card's price has changed since import, **When** the page loads, **Then** the total value is recalculated using current API prices; a "Last Updated: [date]" timestamp appears.

---

### User Story 7 - Visual Spoiler Gallery with Filterable Grid (Priority: P3)

Guests and registered users browse a visual spoiler gallery: a filterable grid of card artworks using image_url_cropped (smaller, focused artwork images). They filter by set, archetype, attribute, type. Clicking a card artwork loads the detail page. The gallery supports infinite scroll or pagination.

**Why this priority**: Spoiler gallery is aspirational—nice for browsing aesthetically but not essential. P3 because it's a secondary discovery method; search (P1) is primary. Gallery enhances UX for casual browsing but doesn't block features.

**Independent Test**: Can be fully tested by: (1) Navigate to Spoiler Gallery page, (2) Verify cards display in grid using image_url_cropped, (3) Filter by Set and verify grid updates, (4) Click a card artwork and verify detail page loads, (5) Test infinite scroll or pagination, (6) Verify gallery loads quickly using lazy loading on images. Delivers: responsive gallery with filtered browsing.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Spoiler Gallery, **When** the page loads, **Then** a grid of card artworks appears (using image_url_cropped); cards are displayed 4 per row on desktop, 2 on tablet, 1 on mobile.
2. **Given** the gallery is displayed, **When** they filter by Set = "Blue-Eyes" booster, **Then** only cards from that set appear; filter count shows "X cards match".
3. **Given** they scroll to the bottom of the visible gallery, **When** the page reaches the bottom, **Then** more cards load automatically (infinite scroll) or a "Load More" button appears.
4. **Given** they click on a card artwork, **When** the artwork is clicked, **Then** the card detail page loads with all info (not a modal popup—full page navigation).
5. **Given** they have selected multiple filters (Set + Attribute), **When** they click "Clear Filters", **Then** all filters reset and the full gallery reloads.

---

### User Story 8 - Random Card Pull with Reveal Animation (Priority: P3)

Guests and registered users click a "Pull Random Card" button, which fetches a random card from the API and displays it on a detail page with a celebratory reveal animation (CSS Module for particle effects, shine, scale keyframes). Registered users' random pull is added to their collection with a count increment and animated confirmation.

**Why this priority**: Random pull is a gamified, fun feature that increases engagement. P3 because it doesn't enable core features but adds entertainment. Reveal animation requires custom CSS (CSS Module) rather than Tailwind alone.

**Independent Test**: Can be fully tested by: (1) Click "Pull Random Card" button, (2) Verify animation plays (scale, particle effects, shine), (3) Verify a different card appears on each pull (within 2 seconds), (4) Verify pull respects 2-second rate limit (button disabled for 2 sec after pull), (5) If logged in, verify pull is added to collection and count increments, (6) Verify collect-animation plays (celebratory confetti or shine effect). Delivers: functional random pull with custom CSS animation.

**Acceptance Scenarios**:

1. **Given** a guest clicks "Pull Random Card", **When** the button is clicked, **Then** within 2 seconds, a random card detail page displays with a reveal animation (fade-in, scale, or particle effect); animation lasts 1–2 seconds.
2. **Given** the animation completes, **When** the user clicks the button again, **Then** it is disabled (greyed out) for 2 seconds to enforce rate limiting per API constraints (max once per 2 sec).
3. **Given** a registered user clicks "Pull Random Card" 3 times, **When** each pull completes, **Then** the pulled card is added to their collection; if already owned, quantity increments by 1; a celebratory animation (confetti shower or shine effect) plays for 1 second.
4. **Given** two consecutive pulls happen, **When** they complete, **Then** two different cards appear (randomness verified over multiple pulls).
5. **Given** they pull a card at 11:59 PM and another at 12:01 AM, **When** the second pull completes, **Then** both pulls succeed (backend rate limiting is per-IP/per-session, not per-day).

---

### User Story 9 - Trade Offers & Community Matching (Priority: P3)

Registered users post trade offers: "I have [cards] and want [cards]". The system finds other users whose wishlists/collection contain the wanted cards and whose collections contain the offered cards. Matches are displayed as suggested trades. Users can message trade partners or accept/decline offers. Trades update both users' collections.

**Why this priority**: Trading is a community feature that enhances engagement for collectors. P3 because it requires complex matching logic and requires both users to be registered; core features work without it. Feature is aspirational—nice to have but not essential.

**Independent Test**: Can be fully tested by: (1) Create trade offer "I have Blue-Eyes, want Red-Eyes", (2) Verify backend finds matching users, (3) Suggest match to other user, (4) Other user accepts or declines, (5) If accepted, verify both collections update (offer cards move to matched user; wanted cards move to original user), (6) Trade history appears in both profiles. Delivers: trade matching with collection updates.

**Acceptance Scenarios**:

1. **Given** a registered user posts trade offer "I have 2× Blue-Eyes White Dragon, I want 1× Red-Eyes Black Dragon", **When** the offer is saved, **Then** a trade post ID is created; the offer appears in a public Trade Marketplace.
2. **Given** the trade post is active, **When** the backend job runs (hourly), **Then** it searches for users whose collections have Red-Eyes and wishlists contain Blue-Eyes; matches are found and suggested to the original user.
3. **Given** User A sees a suggested match from User B, **When** User A clicks "Initiate Trade", **Then** User B receives a notification "User A wants to trade for your offer"; they can accept or decline.
4. **Given** User B accepts the trade, **When** they confirm, **Then** User A's collection loses the offered cards; User B's collection gains them; User B's collection loses wanted cards; User A gains them; trade is marked "Completed".
5. **Given** a trade is completed, **When** both users view their collection, **Then** the exchanged cards reflect the new counts; trade history shows "Traded with [User B] on [date]" with card details.

---

### User Story 10 - Shared Decks & Community Engagement (Priority: P3)

Registered users can mark decks as "Public" to share with the community. Other users browse shared decks, upvote/downvote, and comment. A leaderboard shows most upvoted decks. Community deck detail shows the author's profile, deck statistics, and comments. Users can copy shared decks to their own account (with or without cards owned).

**Why this priority**: Community sharing drives engagement and retention. P3 because core features (search, deck building) work without it, but sharing increases value once core features exist. Requires comment threading and voting backend logic.

**Independent Test**: Can be fully tested by: (1) Create and publish deck as "Public", (2) Search for it in Community Decks, (3) Upvote it and verify count increments, (4) Leave a comment and verify it appears, (5) Copy deck to own account and verify copy is created, (6) View leaderboard and verify deck ranks. Delivers: public deck browsing with voting and copying.

**Acceptance Scenarios**:

1. **Given** a registered user creates a deck and toggles "Public", **When** they save, **Then** the deck appears in the Community Decks browsable list; other users can view it.
2. **Given** they view a shared deck detail, **When** they click the upvote (thumbs-up) icon, **Then** a heart animation plays; the upvote count increments; the icon fills (indicating they've voted).
3. **Given** they leave a comment "Great deck! I love this combo", **When** the comment is posted, **Then** it appears under the deck with their username and timestamp; nested replies are supported.
4. **Given** they click "Copy to My Decks", **When** prompted, **Then** a new deck is created in their account with all main/extra/side cards; if they don't own a card, it's still added (they're notified which cards they lack).
5. **Given** decks are ranked by upvotes, **When** they view the Community Decks leaderboard, **Then** top 10 decks appear sorted by upvote count (newest first if tied); they can filter by archetype/format.

---

### User Story 11 - Admin Dashboard & API Monitoring (Priority: P3)

Admins access a dedicated dashboard showing:
- API usage metrics: total calls today, calls in last 7 days, requests/second
- Cache metrics: hit/miss ratios, cache size, cleared items count
- User metrics: total users, new signups today, total decks, most viewed cards
- Rate limiting status: calls to YGOPRODeck API, current rate (req/s), warnings if approaching 20 req/s limit

Admins can manually clear specific caches (e.g., all card data, banlist) or re-fetch the banlist immediately. Admin actions are logged.

**Why this priority**: Admin dashboard is operational tooling, not user-facing functionality. P3 because only admins access it and it doesn't block user features. Essential for monitoring API health and cache efficiency but not for MVP.

**Independent Test**: Can be fully tested by: (1) Log in as admin, (2) Navigate to Admin Dashboard, (3) Verify metrics display (API calls, cache hit ratio, user counts), (4) Click "Clear Card Cache" and verify action is logged and metrics reset, (5) Verify rate limit indicator shows current req/s and warning if above threshold. Delivers: admin monitoring with cache controls.

**Acceptance Scenarios**:

1. **Given** an admin navigates to the Admin Dashboard, **When** the page loads, **Then** metrics cards display: Total API Calls (today), Cache Hit Ratio (%), Active Users, Total Decks, Most Viewed Card Name, Rate Limit Status (X/20 req/s).
2. **Given** the metrics are displayed, **When** an admin clicks "Clear All Card Caches", **Then** all cached card data is deleted from PostgreSQL; frontend shows confirmation "Card cache cleared"; page metrics refresh.
3. **Given** they click "Re-fetch Banlist", **When** the action completes, **Then** the banlist endpoint is called immediately (not waiting for next scheduled task); response status and timestamp are logged; frontend shows "Banlist updated at HH:MM".
4. **Given** the backend is making API calls near the 20 req/s limit, **When** the rate indicator shows >= 18 req/s, **Then** a yellow warning badge appears: "⚠️ Approaching rate limit (18/20 req/s)"; if it hits 20 req/s, a red badge "🔴 Rate limit reached" appears.
5. **Given** an admin action is performed (clear cache, re-fetch banlist), **When** the action completes, **Then** an audit log entry is created: Admin username, action type, timestamp, status (success/failure).

---

### Edge Cases

- What happens when a user searches with empty query or filters with no results? → Display friendly message "No cards match your filters. Try broadening your search."
- How does system handle YGOPRODeck API outage or timeout? → Backend returns cached data if available and notifies user "Showing cached data (last updated HH:MM)". If no cache, error: "Unable to fetch card data. Please try again later."
- What if a user's refresh token expires? → On next API call, backend returns 401 Unauthorized; frontend clears tokens and redirects to login.
- What if a user tries to add a card to a deck that is now banned? → Deck validation rejects the add; error: "This card is currently banned in [Format]. Cannot add to deck."
- What if collection import CSV has invalid card IDs? → Import skips rows with invalid IDs and reports "X cards imported, Y rows skipped due to invalid IDs" with downloadable error log.
- What if a guest user's localStorage is cleared? → Previously viewed cards, draft decks are lost (no backend storage until registration). On registration after localStorage wipe, only newly viewed items are synced.
- What if a trade is initiated but one user deletes collection card before acceptance? → Trade validation checks both users' current collections; if offering user no longer owns card, trade is cancelled and user is notified.
- What if admin clears cache while a user is viewing card details? → User's page continues to display the now-cached (and possibly stale) card data; next navigation loads fresh data. No error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support guest card search by name, type, attribute, level/rank, ATK/DEF range, archetype, format, and date range with results in paginated lists using image_url_small.
- **FR-002**: System MUST display card details in a two-column layout (scrollable left panel with stats/sets/prices/banlist; fixed right image with image_url) and MUST NOT hotlink images—all must be hosted locally on Django.
- **FR-003**: System MUST support guest-to-registered user registration with email/password and MUST migrate guest data (recently viewed cards, draft decks) using UUIDv4 device_id header.
- **FR-004**: System MUST implement JWT authentication (access + refresh tokens) for registered users with automatic token refresh and logout-triggered token clearing.
- **FR-005**: System MUST enforce Yu-Gi-Oh! TCG deck validation rules: main deck ≥40 cards, extra ≤15, side ≤15, ban list compliance (no banned cards; limited/semi-limited ≤1/≤2), and MUST prevent violations with clear error messages.
- **FR-006**: System MUST support deck import/export in standard YDK format (text file with main/extra/side card IDs) and MUST perfectly recreate decks on re-import.
- **FR-007**: System MUST display deck statistics: card type distribution (bar chart), attribute/level curve, total estimated cost (sum of card prices), and budget optimization suggestions (cheaper alternatives).
- **FR-008**: System MUST support test-hand drawing: simulate a random hand of 5 cards from a deck; each draw call must be truly random; multiple draws must show different hands.
- **FR-009**: System MUST store recently viewed cards in guest localStorage and sync to account on registration; recently viewed list MUST persist and display in new sessions.
- **FR-010**: System MUST provide a visual spoiler gallery displaying cards in a grid using image_url_cropped; gallery MUST support infinite scroll and filtering by set, archetype, attribute, type.
- **FR-011**: System MUST support random card pull (endpoint: randomcard.php) with rate limiting (max once per 2 seconds per user) and reveal animation (CSS Module).
- **FR-012**: System MUST support registered user wishlist/favourite functionality with persistent storage, heart-fill animation, and price alert setup (email alerts via Celery).
- **FR-013**: System MUST support collection manager: add cards with quantity/condition/set/rarity; bulk import via CSV; filter by condition/set/rarity; calculate total collection value (price × quantity).
- **FR-014**: System MUST support theme toggling (light/dark) with smooth CSS transition persisted in localStorage; support dark: Tailwind variant and custom CSS Module if needed.
- **FR-015**: System MUST support UI language switching (English, French, German, Italian, Portuguese) with all text translatable; language preference MUST persist in account (registered) or localStorage (guest).
- **FR-016**: System MUST cache all YGOPRODeck API responses in PostgreSQL for minimum 48 hours aligned with API cache headers; cache MUST be validated and refreshed based on checkDBVer.php.
- **FR-017**: System MUST enforce backend rate limiting: maximum 15 API calls per second to YGOPRODeck (safely below 20 req/s limit); MUST implement exponential back-off and retry logic; MUST include meaningful User-Agent header.
- **FR-018**: System MUST NEVER expose external API to client; all communication server-side; client receives only formatted JSON from Django API.
- **FR-019**: System MUST provide admin dashboard displaying: API usage (calls/day, calls/week, req/s), cache metrics (hit/miss ratio, size), user metrics (total, new today), most viewed cards, rate limit status.
- **FR-020**: System MUST allow admins to manually clear specific caches and re-fetch banlist immediately; all admin actions MUST be logged with timestamp, admin username, action type, status.
- **FR-021**: System MUST support community deck sharing: users mark decks Public, others can upvote/downvote and comment; Public decks appear in leaderboard sorted by upvotes; users can copy Public decks.
- **FR-022**: System MUST support trade offers: registered users post "I have [cards], I want [cards]"; backend finds matching users; trades update both users' collections when accepted.
- **FR-023**: System MUST display price history for each card as a line chart (last 30 days) on detail page; price snapshots MUST be taken regularly via Celery background task.
- **FR-024**: System MUST validate all input (search terms, deck names, email, password) against injection attacks and render all user-generated content (comments, notes) as escaped text.
- **FR-025**: System MUST support user profile settings: password change, notification preferences, price alert thresholds, language selection, theme preference; profile settings MUST persist.
- **FR-026**: All pages MUST be fully responsive using Tailwind responsive prefixes (sm:, md:, lg:); detail page MUST adapt two-column layout to single-column on mobile; touch-friendly buttons (min 48px).
- **FR-027**: System MUST support accessibility: all interactive elements MUST have ARIA labels; keyboard navigation MUST work (Tab, Enter, Escape); images MUST have alt text; contrast ratios MUST meet WCAG AA.
- **FR-028**: Loading states MUST display skeleton placeholders or spinners; error states MUST show user-friendly messages with retry options; empty states MUST explain why no content is visible.

### Key Entities *(include if feature involves data)*

- **Guest**: Anonymous user with UUID device_id, localStorage for recently viewed/draft decks, no persistent backend storage until registration.
- **User Account**: Email, hashed password, created_at, updated_at, UUID device_id (for guest migration), preferred language, theme preference, JWT tokens (access/refresh).
- **Card**: id (from API), name, type, frameType, description, ATK, DEF, level, race, attribute, archetype, scale, linkval, linkmarkers; image URLs (image_url, image_url_small, image_url_cropped); card_sets, card_prices, banlist_info; local database copy with cache_updated_at, cache_ttl.
- **Card Set**: set_code, set_name, card_count, tcg_date, release_date; association to cards.
- **Card Price**: card_id, cardmarket_price, tcgplayer_price, ebay_price, amazon_price, coolstuffinc_price, updated_at; price_history (snapshots over time for charting).
- **Banlist Status**: card_id, ban_tcg (BANNED|LIMITED|SEMI_LIMITED|UNLIMITED), ban_ocg, ban_goat, updated_at.
- **Deck**: user_id, name, is_public, created_at, updated_at, description, format (TCG/OCG/Goat); deck_cards (card_id, quantity, section: main/extra/side).
- **Recently Viewed**: user_id, card_id, viewed_at (ordered newest-first, limit ~50).
- **Wishlist Item**: user_id, card_id, added_at, price_alert_threshold (optional), alert_active (boolean).
- **Collection Item**: user_id, card_id, quantity, condition (Mint/NM/LP/MP/HP), set_code, rarity, added_at.
- **Trade Offer**: user_id, offered_card_ids (list), wanted_card_ids (list), created_at, status (POSTED|MATCHED|COMPLETED|CANCELLED).
- **Shared Deck Comment**: user_id, deck_id, text, created_at, upvotes, replies (threaded).
- **API Cache Entry**: endpoint_path, request_params_hash, response_json, cached_at, cache_ttl, hit_count, miss_count.
- **Admin Audit Log**: admin_user_id, action_type (CLEAR_CACHE|REFETCH_BANLIST|etc.), action_detail (JSON), timestamp, status (SUCCESS|FAILURE).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search and filter cards with 10+ filter combinations; search results load within 2 seconds (p95); paginated results display 20–50 cards per page without lag.
- **SC-002**: Card detail page layout (two-column on desktop) maintains fixed right image while left panel scrolls; mobile adapts to single-column; layout renders within 1 second.
- **SC-003**: Registration and login complete within 3 seconds (p95); JWT tokens issue within 500ms; token refresh transparent to user without logout.
- **SC-004**: Deck validation (banlist + size check) completes within 500ms; adding a banned card shows error within 1 second; users cannot bypass validation.
- **SC-005**: YDK import/export preserves 100% of deck data; re-imported decks match originals byte-for-byte (identical card counts and sections).
- **SC-006**: Deck statistics (charts, cost estimates) generate within 2 seconds; suggested budget optimizations surface at least 3 valid alternatives per search term.
- **SC-007**: Backend rate limiting to YGOPRODeck API maintains ≤15 req/s; no calls exceed 20 req/s limit; rate limit warnings appear in admin dashboard before breaching limit.
- **SC-008**: API response cache hit ratio ≥85% (after warm-up period); cache misses trigger API calls within 500ms; cache TTL enforced at 48 hours minimum.
- **SC-009**: Random card pull endpoint (randomcard.php) completes within 1 second; rate limiting enforced (deny requests <2 seconds apart per user).
- **SC-010**: Reveal animations for random pull and wishlist heart complete within 1–2 seconds; animations use CSS keyframes (CSS Module, not JavaScript animations) for smooth 60 FPS performance.
- **SC-011**: Collection manager bulk CSV import (500+ rows) completes within 5 seconds; invalid rows reported with line numbers; total collection value calculated correctly (±$0.01).
- **SC-012**: Community deck leaderboard loads within 2 seconds; upvote/downvote updates appear instantly (optimistic UI update + server confirmation).
- **SC-013**: System handles 1000 concurrent users (load test: 90% of requests complete within 3 seconds; p99 under 5 seconds).
- **SC-014**: All user-generated content (deck names, comments, notes) rendered safely (escaped, no injection vulnerabilities); security scanning finds zero XSS/CSRF issues.
- **SC-015**: Wishlist and collection data persist across sessions (verified: add item, logout, login, item still present).
- **SC-016**: Guest data (recently viewed, draft decks) migrates 100% to registered account via device_id; post-migration, previous guest data accessible in account.
- **SC-017**: Admin dashboard metrics update in real-time (refresh <1 second); cache clear action shows updated stats within 2 seconds; all admin actions logged without exceptions.
- **SC-018**: All pages responsive on mobile (375px width), tablet (768px), desktop (1920px); no content overflow; touch interactions work (buttons min 48px).
- **SC-019**: Accessibility: keyboard-only navigation works on all pages; ARIA labels present on interactive elements; color contrast ≥4.5:1 (WCAG AA); screen reader testing passes (verified with NVDA/JAWS).
- **SC-020**: Frontend tests (React Testing Library + Jest) achieve ≥80% code coverage; backend tests (Django unittest/pytest) achieve ≥75% coverage; all tests pass before phase delivery.

## Assumptions

- **User Base**: Primary audience is English-speaking Yu-Gi-Oh! TCG players age 13+; secondary support for French, German, Italian, Portuguese speakers; mobile and desktop users present in equal measure.
- **Device Connectivity**: Users have stable internet; offline mode is out of scope for v1; intermittent connectivity is handled gracefully (cached data fallback, retry prompts).
- **API Availability**: YGOPRODeck API is operational ≥99% of the time; temporary outages (< 1 hour) are recoverable via cached data; prolonged outages show informative error messages.
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020+ support; IE11 is explicitly NOT supported; CSS Grid and Flexbox are available.
- **Data Scope**: v1 focuses on English card data; multi-language support is text UI only (card descriptions remain English from API); language switching is UI-only feature.
- **Scale**: v1 targets up to 10,000 concurrent active users; PostgreSQL + Django can handle this with basic caching; horizontal scaling is out of scope for MVP.
- **Payment**: v1 has NO premium tiers or payment processing; all features are free; monetization is future roadmap item.
- **Email Sending**: Celery background tasks send emails via SMTP; email delivery is best-effort (not guaranteed delivery SLA); email templates are basic text (no complex HTML).
- **Import Formats**: Only YDK format supported for deck import/export; other formats (e.g., Archetype XML) are future enhancements.
- **CSV Import**: Collection bulk import CSV must follow exact format (header row required; columns: card_id, quantity, condition, set_code, rarity); other column orders are not supported in v1.
- **Trading**: Trade matching is basic keyword/collection matching; no advanced AI-driven suggestions; trade agreements are asynchronous (not real-time bidding).
- **Community Moderation**: No built-in content moderation tools; admin review of comments/decks is manual or delegated to future moderation system; spam/abuse reports are logged but not auto-actioned.
- **Price Data**: Price information from YGOPRODeck API is for reference only; prices may be outdated; no price guarantee or purchase integration.
- **Performance Targets**: Success criteria assume single-region deployment (US); multi-region latency not considered; CDN for images is out of scope for v1.
- **Testing Environment**: Tests run on PostgreSQL (not SQLite); test database is recreated per test run (fast teardown); Celery tasks are mocked in tests (not run asynchronously).
- **Authentication & Sessions**: JWT tokens used exclusively (no session cookies); refresh tokens valid for 30 days (subject to change); forced logout after 60 minutes of inactivity is not implemented in v1.
- **Admin Access**: Admin dashboard requires explicit admin role in database (no self-signup to admin); admin credentials created via Django management command; no role-based access control (RBAC) hierarchy beyond admin/user.
