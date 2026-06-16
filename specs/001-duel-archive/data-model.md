# Data Model: Duel Archive

**Created**: 2026-06-16  
**Phase**: 1 (Design & Contracts)  
**Purpose**: Define entity structure, relationships, validation rules, and state transitions

## Entity Definitions

### Guest User

**Purpose**: Unauthenticated user with temporary session

**Attributes**:
- `device_id` (UUIDv4, string): Unique identifier stored in localStorage; sent as `X-Device-ID` header
- `created_at` (timestamp): Session start time
- `recently_viewed` (JSON array, localStorage): [{card_id, name, viewed_at}, ...]
- `draft_decks` (JSON array, localStorage): [{deck_data, created_at}, ...]

**Storage**: Browser localStorage (client-side only)

**Lifecycle**:
1. User visits app → generate UUID device_id if not in localStorage
2. Browsing actions (search, view cards) tracked in device_id session
3. On registration → device_id sent to backend; existing draft decks/recently_viewed migrated to account
4. On logout → tokens cleared; app reverts to guest mode

**Validation**: device_id must be valid UUIDv4

---

### User Account

**Purpose**: Registered user with persistent backend storage

**Attributes**:
- `id` (int, PK): Database primary key
- `email` (string, unique): Email address; used for login
- `password_hash` (string): bcrypt hash; never stored as plaintext
- `profile` (ForeignKey → UserProfile):
  - `avatar_url` (string, nullable): User profile picture
  - `bio` (text, nullable): Personal description
  - `preferred_language` (choice): EN/FR/DE/IT/PT; default EN
  - `theme_preference` (choice): light/dark; default light
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- `device_id` (UUIDv4, nullable): For guest-to-user data migration
- `notifications_enabled` (boolean): Email notification preference
- `is_staff` (boolean): Django admin user
- `is_superuser` (boolean): Superuser flag
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `last_login` (timestamp, nullable)

**Storage**: PostgreSQL `auth_user` and `auth_userprofile` tables

**Validation**:
- Email: Must be valid email format; unique constraint
- Password: Minimum 8 characters; no simple patterns (checked via regex or library)

**State Transitions**:
- Unverified → Verified (if email verification implemented in v2)
- Active → Suspended (admin action for ToS violation)
- Active → Deleted (user deletes account; soft delete recommended)

---

### Card

**Purpose**: Yu-Gi-Oh! card data from YGOPRODeck API; cached locally

**Attributes** (from YGOPRODeck API):
- `id` (int, PK): YGOPRODeck card ID
- `name` (string): Card name
- `type` (string): "Normal Monster" / "Effect Monster" / "Synchro Monster" / "Spell Card" / "Trap Card" / etc.
- `frameType` (string): Internal Konami frame type (normal, effect, synchro, etc.)
- `desc` (text): Card text/description
- `atk` (int, nullable): Attack points
- `def` (int, nullable): Defense points
- `level` (int, nullable): Monster level (1–12)
- `rank` (int, nullable): Xyz rank
- `race` (string, nullable): Monster race (Warrior, Spellcaster, Dragon, etc.)
- `attribute` (string, nullable): Attribute (LIGHT, DARK, WATER, FIRE, WIND, EARTH, DIVINE)
- `archetype` (string, nullable): Archetype name (Blue-Eyes, Red-Eyes, Lightsworn, etc.)
- `scale` (int, nullable): Pendulum scale (1–13)
- `linkval` (int, nullable): Link rating
- `linkmarkers` (JSON array): Link marker directions (Top, Bottom-Left, etc.)

**Related Models**:
- `card_sets` (reverse ForeignKey → CardSet): Many-to-many; card appears in multiple sets with different rarities/prices
- `card_images` (reverse ForeignKey → CardImage): One card → multiple images (different printings)
- `card_prices` (reverse ForeignKey → CardPrice): Price snapshots over time
- `banlist_info` (OneToOneField → BanlistStatus): Current banlist status (banned/limited/unlimited)

**Storage**: PostgreSQL `cards_card` table

**Cache Control**:
- `cache_updated_at` (timestamp): When data was last fetched from API
- `cache_ttl` (int, seconds): 48 hours = 172,800 seconds
- Validation: If `now() > cache_updated_at + cache_ttl` → cache miss → re-fetch from API

**Validation**:
- `id`: Must match YGOPRODeck API id (unique constraint)
- `name`: Non-empty string
- `atk`, `def`, `level`: Non-negative integers or NULL
- `linkmarkers`: Valid JSON array

---

### Card Set

**Purpose**: Physical card set/booster box from TCG; card belongs to one or more sets

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `set_code` (string, unique): YGOPRODeck set code (e.g., "LEDE-EN001", "SAST-EN")
- `set_name` (string): Display name (e.g., "Legend of the Dragon Mist")
- `card_count` (int): Number of cards in set
- `tcg_date` (date, nullable): TCG release date
- `ocg_date` (date, nullable): OCG release date
- `series` (string, nullable): Booster series name

**Relationships**:
- Through `CardSet` (many-to-many with Card): `cards` (reverse ForeignKey)

**Storage**: PostgreSQL `cards_cardset` table

**Validation**:
- `set_code`: Non-empty, unique
- `card_count`: Positive integer

---

### Card Image

**Purpose**: Store multiple artwork variants per card (different printings)

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `card_id` (ForeignKey → Card): Reference to card
- `image_url` (string, URL): Full-size image from YGOPRODeck CDN; downloaded and re-hosted locally
- `image_url_small` (string, URL): Thumbnail for lists/grids; downloaded and re-hosted locally
- `image_url_cropped` (string, URL): Cropped artwork for gallery; downloaded and re-hosted locally
- `local_image_path` (string): Path on Django media storage (e.g., "cards/25955203/full.jpg")
- `local_image_small_path` (string): Path to thumbnail
- `local_image_cropped_path` (string): Path to cropped version
- `downloaded_at` (timestamp): When image was downloaded
- `set_code` (string, nullable): Set this artwork is from

**Storage**: PostgreSQL `cards_cardimage` table + Django media storage

**Image Storage Rules**:
- Never hotlink to `images.ygoprodeck.com`
- On card fetch, download images from API URLs to Django media directory
- Store local paths in model
- Serve all images via Django media URL: `/media/cards/...`

**Validation**:
- `image_url`: Must be valid HTTP URL (starts with https://images.ygoprodeck.com)
- `local_image_path`: Non-empty string pointing to existing file

---

### Card Price

**Purpose**: Price history snapshots for charting and price alerts

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `card_id` (ForeignKey → Card): Reference to card
- `cardmarket_price` (decimal, nullable): Cardmarket.com price (currency: EUR)
- `tcgplayer_price` (decimal, nullable): TCGPlayer.com price (currency: USD)
- `ebay_price` (decimal, nullable): eBay price (currency: USD)
- `amazon_price` (decimal, nullable): Amazon price (currency: USD)
- `coolstuffinc_price` (decimal, nullable): CoolStuff Inc price (currency: USD)
- `snapshot_date` (date): Date of snapshot (for charting)
- `created_at` (timestamp)

**Storage**: PostgreSQL `cards_cardprice` table

**Price Snapshot Schedule**:
- Celery task runs daily (midnight UTC) → captures current prices
- Stores one row per card per day
- Frontend queries last 30 days of data for line chart

**Validation**:
- Prices: Non-negative decimals or NULL
- `snapshot_date`: Must be date (no time component)

---

### Banlist Status

**Purpose**: Current banlist restrictions per card (TCG/OCG/Goat formats)

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `card_id` (OneToOneField → Card): Reference to card
- `ban_tcg` (choice): "Not Banned" / "Limited" / "Semi-Limited" / "Banned"
- `ban_ocg` (choice): Same options
- `ban_goat` (choice): Same options (Goat format = older ruleset)
- `updated_at` (timestamp): Last fetch from YGOPRODeck API

**Storage**: PostgreSQL `cards_banliststatus` table

**Update Schedule**:
- Celery task runs weekly (Monday 00:00 UTC) → checks YGOPRODeck banlist endpoint
- Updates `ban_tcg`, `ban_ocg`, `ban_goat` fields
- Deck validation uses these values to reject banned cards

**Validation**:
- `ban_tcg`, `ban_ocg`, `ban_goat`: Must be one of allowed choices

---

### Deck

**Purpose**: User's custom deck (main/extra/side sections)

**Attributes**:
- `id` (int, PK): Auto-incrementing UUID
- `user_id` (ForeignKey → User): Owner
- `name` (string): Deck name (e.g., "Blue-Eyes Control")
- `description` (text, nullable): Deck strategy notes
- `is_public` (boolean): Whether visible to community; default False
- `is_locked` (boolean): Locked decks cannot be edited (optional feature)
- `format` (choice): "TCG" / "OCG" / "Goat" for banlist validation
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `upvotes` (int): Number of community upvotes (if public)
- `downvotes` (int): Number of community downvotes (if public)

**Related Models**:
- `deck_cards` (reverse ForeignKey → DeckCard): Main/extra/side cards

**Storage**: PostgreSQL `decks_deck` table

**Validation**:
- `name`: Non-empty; ≤100 characters
- Main deck size: Must be ≥40 cards
- Extra deck size: Must be ≤15 cards
- Side deck size: Must be ≤15 cards
- Banlist compliance: No banned cards; limited ≤1; semi-limited ≤2 per card

---

### Deck Card

**Purpose**: Individual card instance in a deck (card + quantity + section)

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `deck_id` (ForeignKey → Deck): Parent deck
- `card_id` (ForeignKey → Card): Card reference
- `quantity` (int): Number of this card (1–3 for most; 1 for limited)
- `section` (choice): "main" / "extra" / "side"
- `position` (int, nullable): Order in deck (for preserving user's arrangement)

**Storage**: PostgreSQL `decks_deckcard` table

**Validation**:
- `quantity`: Must be 1–3 (adjusted for card's banlist status)
- `section`: Must be valid choice

---

### Recently Viewed

**Purpose**: Track user's browsing history (persistent for registered users; localStorage for guests)

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `user_id` (ForeignKey → User): Owner (NULL for guests; stored in localStorage)
- `card_id` (ForeignKey → Card): Viewed card
- `viewed_at` (timestamp): When viewed
- `view_count` (int): Number of times viewed (aggregate metric)

**Storage**: PostgreSQL `cards_recentlyviewed` table (for registered users only); browser localStorage (for guests)

**Limits**:
- Keep latest 50 recently viewed cards per user
- Oldest entries deleted when limit exceeded

**Validation**:
- `card_id`: Must exist and be valid

---

### Wishlist Item

**Purpose**: User's favorite/watchlist cards with optional price alerts

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `user_id` (ForeignKey → User): Owner
- `card_id` (ForeignKey → Card): Card in wishlist
- `added_at` (timestamp)
- `price_alert_threshold` (decimal, nullable): Alert when card price drops below this USD amount
- `alert_active` (boolean): Whether price alert is enabled; default False
- `last_alerted_at` (timestamp, nullable): When last alert was sent (prevent duplicate alerts)

**Storage**: PostgreSQL `wishlists_wishlistitem` table

**Price Alert Logic**:
- Celery task runs daily → checks current card prices
- If price < threshold AND last_alerted_at was >24h ago → send email
- Update `last_alerted_at` timestamp

**Validation**:
- `price_alert_threshold`: Non-negative decimal or NULL
- Unique constraint: (user_id, card_id) — one wishlist entry per card per user

---

### Collection Item

**Purpose**: Physical cards user owns (collection manager)

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `user_id` (ForeignKey → User): Owner
- `card_id` (ForeignKey → Card): Card owned
- `quantity` (int): Number of copies owned (1–100)
- `condition` (choice): "Mint" / "Near Mint" / "Lightly Played" / "Moderately Played" / "Heavily Played"
- `set_code` (string, nullable): Which set this card is from
- `rarity` (string, nullable): Rarity code (e.g., "Ultimate Rare", "Secret Rare")
- `added_at` (timestamp)
- `updated_at` (timestamp)

**Storage**: PostgreSQL `collections_collectionitem` table

**Collection Value Calculation**:
- For each collection item: `total_value += quantity × (current_card_price)`
- Uses latest price from `CardPrice` table for each card

**Bulk Import**:
- CSV format: card_id, quantity, condition, set_code, rarity (header row required)
- Parser validates each row; invalid rows skipped with error log
- All valid rows inserted in batch (for performance)

**Validation**:
- `quantity`: Positive integer
- `condition`: Must be valid choice
- Unique constraint: (user_id, card_id, set_code) — multiple copies of same card in different conditions allowed
- CSV parsing: card_id must exist in Card table; condition must be valid

---

### Trade Offer

**Purpose**: User's trade proposal; system finds matches

**Attributes**:
- `id` (int, PK): Auto-incrementing UUID
- `user_id` (ForeignKey → User): User posting offer
- `offered_card_ids` (JSON array): List of card IDs user is offering
- `wanted_card_ids` (JSON array): List of card IDs user wants
- `status` (choice): "POSTED" / "MATCHED" / "PENDING_ACCEPTANCE" / "COMPLETED" / "CANCELLED"
- `matched_user_id` (ForeignKey → User, nullable): User matched for trade
- `created_at` (timestamp)
- `completed_at` (timestamp, nullable)

**Storage**: PostgreSQL `trading_tradeoffer` table

**Trade Matching Flow**:
1. User A posts: "I have Blue-Eyes, I want Red-Eyes"
2. Celery job (hourly) finds User B whose collection has Red-Eyes and wants Blue-Eyes
3. Create TradeMatch record; notify both users
4. Users accept/decline
5. If accepted: both users' collections updated; TradeOffer status = COMPLETED

**Validation**:
- `offered_card_ids`: Non-empty array; each ID must exist in Card table
- `wanted_card_ids`: Non-empty array; each ID must exist in Card table

---

### Shared Deck Comment

**Purpose**: User comments on public decks

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `deck_id` (ForeignKey → Deck): Parent public deck
- `user_id` (ForeignKey → User): Comment author
- `parent_comment_id` (ForeignKey → self, nullable): For threaded replies
- `text` (text): Comment body (1–1000 characters)
- `upvotes` (int): Community upvotes
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Storage**: PostgreSQL `community_deckcomment` table

**Validation**:
- `text`: Non-empty; 1–1000 characters max; escaped before rendering (XSS prevention)

---

### Admin Audit Log

**Purpose**: Track all admin actions for compliance

**Attributes**:
- `id` (int, PK): Auto-incrementing
- `admin_user_id` (ForeignKey → User): Admin who performed action
- `action_type` (choice): "CLEAR_CACHE" / "REFETCH_BANLIST" / "DELETE_USER" / "SUSPEND_DECK" / etc.
- `action_detail` (JSON): Details (e.g., {cleared: "all", count: 12500})
- `status` (choice): "SUCCESS" / "FAILURE"
- `error_message` (text, nullable): If status=FAILURE
- `created_at` (timestamp)

**Storage**: PostgreSQL `admin_auditlog` table

**Validation**:
- `admin_user_id`: Must be superuser
- `action_type`: Must be valid choice

---

## Relationships Summary

```
User (1) ─── (N) Deck
      ├─ (N) RecentlyViewed → Card
      ├─ (N) WishlistItem → Card
      ├─ (N) CollectionItem → Card
      ├─ (N) TradeOffer
      └─ (N) DeckComment

Card (1) ─── (N) CardSet (M:M via through table)
     ├─ (N) CardImage
     ├─ (N) CardPrice
     ├─ (1) BanlistStatus
     ├─ (N) DeckCard → Deck
     └─ (N) RecentlyViewed

Deck (1) ─── (N) DeckCard → Card
     ├─ (N) DeckComment
     └─ (N) SharedDeckUpvote / SharedDeckDownvote

TradeOffer (N) ─── (1) User (offerer)
           └─ (1) User (matched_user_id, accepter)
```

---

## State Transitions & Invariants

### Deck Validation State Machine

```
┌─────────┐
│ DRAFT   │
│ (local) │
└─────────┘
    ↓ Save
┌─────────────────┐
│ PENDING_VALIDATION │
└─────────────────┘
    ↓ Validate
    ├→ ✓ Valid → VALID state
    └→ ✗ Invalid (banlist/size) → ERROR (show errors, stay DRAFT)
    
┌──────────────┐
│ VALID        │ Can be used to play, shared publicly
└──────────────┘
    ↓ Add/remove card
    ├→ Still valid → remain VALID
    └→ No longer valid (e.g., added banned card) → ERROR (disallow add)
```

### Collection Item Condition Classification

- **Mint**: Unplayed, perfect condition (highest value)
- **Near Mint**: Minimal wear, premium condition
- **Lightly Played**: Slight wear, visible but minimal
- **Moderately Played**: Obvious wear, playable condition
- **Heavily Played**: Significant wear, heavily used

---

**Phase 1 Complete** ✅

Data model fully defined. Ready for API contract specifications and quickstart guide.

**Version**: 1.0.0 | **Updated**: 2026-06-16
