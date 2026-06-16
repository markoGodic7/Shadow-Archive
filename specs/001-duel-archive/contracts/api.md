# API Contracts: Duel Archive

**Created**: 2026-06-16  
**Phase**: 1 (Design & Contracts)  
**Purpose**: Define request/response specifications for all API endpoints

---

## Card Search Endpoint

**Endpoint**: `GET /api/cards/`

**Purpose**: Search and filter cards with pagination

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `name` | string | No | Card name (substring match) | "Blue-Eyes" |
| `fname` | string | No | Fuzzy name search | "Blue Eyes" |
| `type` | string | No | Card type filter | "Synchro Monster" |
| `attribute` | string | No | Attribute (LIGHT, DARK, etc.) | "LIGHT" |
| `level` | int | No | Monster level (1–12) | 8 |
| `race` | string | No | Monster race | "Dragon" |
| `archetype` | string | No | Archetype name | "Blue-Eyes" |
| `atk_min` | int | No | Minimum ATK | 2500 |
| `atk_max` | int | No | Maximum ATK | 3500 |
| `def_min` | int | No | Minimum DEF | 2000 |
| `def_max` | int | No | Maximum DEF | 3000 |
| `banlist` | string | No | Banlist status | "Forbidden" / "Limited" / "Semi-Limited" / "Unlimited" |
| `format` | string | No | Format (TCG/OCG/Goat) | "TCG" |
| `sort` | string | No | Sort order | "name" / "-atk" / "-views" |
| `page` | int | No | Page number (1-indexed) | 1 |
| `page_size` | int | No | Results per page (20–100) | 20 |
| `language` | string | No | Language (EN/FR/DE/IT/PT) | "EN" |

**Response (200 OK)**:
```json
{
  "count": 1250,
  "next": "http://localhost:8000/api/cards/?page=2",
  "previous": null,
  "results": [
    {
      "id": 25955203,
      "name": "Blue-Eyes White Dragon",
      "type": "Normal Monster",
      "frameType": "normal",
      "atk": 3000,
      "def": 2500,
      "level": 8,
      "attribute": "LIGHT",
      "race": "Dragon",
      "archetype": "Blue-Eyes",
      "desc": "This legendary dragon...",
      "card_images": [
        {
          "id": 25955203,
          "image_url": "https://example.com/media/cards/25955203/full.jpg",
          "image_url_small": "https://example.com/media/cards/25955203/small.jpg",
          "image_url_cropped": "https://example.com/media/cards/25955203/cropped.jpg"
        }
      ],
      "banlist_info": {
        "ban_tcg": "Unlimited",
        "ban_ocg": "Unlimited",
        "ban_goat": "Unlimited"
      }
    },
    ...
  ]
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Invalid filter value",
  "detail": "level must be between 1 and 12"
}
```

**Error (404 Not Found)**:
```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

## Card Detail Endpoint

**Endpoint**: `GET /api/cards/{id}/`

**Purpose**: Retrieve full card details with related data

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | int | YGOPRODeck card ID |

**Response (200 OK)**:
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
      "set_code": "LEDE-EN",
      "set_name": "Legend of the Dragon Mist",
      "set_rarity": "Secret Rare",
      "set_price": 12.50
    },
    {
      "set_code": "SDK-EN",
      "set_name": "Starter Deck: Kaiba",
      "set_rarity": "Ultra Rare",
      "set_price": 5.00
    }
  ],
  "card_images": [
    {
      "id": 25955203,
      "image_url": "https://example.com/media/cards/25955203/full.jpg",
      "image_url_small": "https://example.com/media/cards/25955203/small.jpg",
      "image_url_cropped": "https://example.com/media/cards/25955203/cropped.jpg"
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
  "price_history": [
    {
      "date": "2026-06-16",
      "tcgplayer_price": 11.50,
      "cardmarket_price": 9.99
    },
    {
      "date": "2026-06-15",
      "tcgplayer_price": 11.75,
      "cardmarket_price": 10.00
    },
    ...
  ],
  "banlist_info": {
    "ban_tcg": "Not Banned",
    "ban_ocg": "Not Banned",
    "ban_goat": "Not Banned"
  }
}
```

**Error (404 Not Found)**:
```json
{
  "error": "Card not found",
  "detail": "Card with ID 9999999 does not exist"
}
```

---

## Registration Endpoint

**Endpoint**: `POST /api/auth/register/`

**Purpose**: Create new user account; migrate guest data

**Request Headers**:
```
Content-Type: application/json
X-Device-ID: (optional) 550e8400-e29b-41d4-a716-446655440000
```

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "email": "newuser@example.com",
  "profile": {
    "avatar_url": null,
    "bio": "",
    "preferred_language": "en",
    "theme_preference": "light"
  },
  "created_at": "2026-06-16T12:00:00Z"
}
```

**Backend Actions**:
1. Validate email format and uniqueness
2. Hash password with bcrypt
3. Extract X-Device-ID from headers (if present)
4. If device_id exists → query Guest data (recently viewed, draft decks) and associate with new user
5. Create User record
6. Return 201 with user details

**Error (400 Bad Request)**:
```json
{
  "error": "Registration failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## Login Endpoint

**Endpoint**: `POST /api/auth/login/`

**Purpose**: Authenticate user and issue JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "profile": {
      "avatar_url": null,
      "preferred_language": "en",
      "theme_preference": "light"
    }
  }
}
```

**Token Details**:
- `access`: JWT token, 15 minutes expiry. Sent in the Authorization header for all authenticated requests: `Authorization: Bearer {access_token}`
- `refresh`: JWT token, 30 days expiry (can be rotated). Sent in the request body to `/api/auth/refresh/` only. Not used as a Bearer token.

**Error (401 Unauthorized)**:
```json
{
  "error": "Invalid credentials",
  "detail": "Email or password is incorrect"
}
```

---

## Token Refresh Endpoint

**Endpoint**: `POST /api/auth/refresh/`

**Purpose**: Issue new access token using refresh token

**Request Headers**:
```
Authorization: Bearer {refresh_token}
```

**Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401 Unauthorized)**:
```json
{
  "error": "Token is invalid or expired"
}
```

---

## Deck Creation Endpoint

**Endpoint**: `POST /api/decks/`

**Purpose**: Create new deck (main/extra/side sections)

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Blue-Eyes Control",
  "description": "A control-focused Blue-Eyes deck with negation",
  "format": "TCG",
  "is_public": false,
  "deck_cards": [
    {"card_id": 25955203, "quantity": 3, "section": "main"},
    {"card_id": 12345678, "quantity": 2, "section": "main"},
    {"card_id": 87654321, "quantity": 1, "section": "extra"}
  ]
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 1,
  "name": "Blue-Eyes Control",
  "description": "A control-focused Blue-Eyes deck with negation",
  "format": "TCG",
  "is_public": false,
  "deck_cards": [
    {
      "card_id": 25955203,
      "card_name": "Blue-Eyes White Dragon",
      "quantity": 3,
      "section": "main"
    },
    ...
  ],
  "statistics": {
    "main_count": 42,
    "extra_count": 15,
    "side_count": 0,
    "type_distribution": {
      "Monster": 28,
      "Spell": 7,
      "Trap": 5
    },
    "estimated_cost": 245.99,
    "is_valid": true,
    "validation_errors": []
  },
  "created_at": "2026-06-16T12:00:00Z"
}
```

**Validation**:
- Main deck: 40–60 cards (typical 40)
- Extra deck: ≤15 cards
- Side deck: ≤15 cards
- Banlist compliance: No banned cards; limited ≤1; semi-limited ≤2
- Card must exist in database

**Error (400 Bad Request)**:
```json
{
  "error": "Deck validation failed",
  "errors": {
    "main_count": ["Main deck must have at least 40 cards"],
    "banlist": ["Card 'Card Name' is banned in TCG format"]
  }
}
```

---

## Deck Validation Endpoint

**Endpoint**: `POST /api/decks/validate/`

**Purpose**: Check deck for banlist compliance and size violations (without saving)

**Request Body**:
```json
{
  "format": "TCG",
  "deck_cards": [
    {"card_id": 25955203, "quantity": 3, "section": "main"},
    ...
  ]
}
```

**Response (200 OK)**:
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": ["Card 'X' is semi-limited; your deck has 2 copies (limit is 2)"]
}
```

**Response (200 OK - Invalid)**:
```json
{
  "is_valid": false,
  "errors": [
    "Main deck has 38 cards (minimum: 40)",
    "Card 'Pot of Greed' is banned in TCG format"
  ],
  "warnings": []
}
```

---

## Deck Import/Export Endpoints

**Endpoint**: `POST /api/decks/import/`

**Purpose**: Import deck from YDK file format

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:
```
file: (binary YDK file content)
deck_name: (optional) "Imported Deck"
```

**Response (201 Created)**:
```json
{
  "id": "deck-id",
  "name": "Imported Deck",
  "deck_cards": [
    {"card_id": 25955203, "quantity": 3, "section": "main"},
    ...
  ],
  "statistics": {
    "main_count": 42,
    "extra_count": 15,
    "side_count": 0
  }
}
```

---

**Endpoint**: `GET /api/decks/{id}/export/`

**Purpose**: Export deck to YDK file format

**Response (200 OK - File Download)**:
```
Content-Type: text/plain
Content-Disposition: attachment; filename="deck-name.ydk"

#main
25955203
25955203
25955203
12345678
...
!extra
87654321
...
!side
11111111
...
```

---

## Wishlist Endpoints

**Endpoint**: `POST /api/wishlist/`

**Purpose**: Add card to user's wishlist

**Request**:
```json
{
  "card_id": 25955203,
  "price_alert_threshold": 8.00
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "card_id": 25955203,
  "card_name": "Blue-Eyes White Dragon",
  "price_alert_threshold": 8.00,
  "alert_active": false,
  "added_at": "2026-06-16T12:00:00Z"
}
```

---

**Endpoint**: `DELETE /api/wishlist/{id}/`

**Purpose**: Remove card from wishlist

**Response (204 No Content)**

---

## Collection Endpoints

**Endpoint**: `POST /api/collection/bulk-import/`

**Purpose**: Bulk import collection from CSV file

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:
```
file: (CSV file with columns: card_id, quantity, condition, set_code, rarity)
```

**CSV Format**:
```
card_id,quantity,condition,set_code,rarity
25955203,1,Mint,LEDE-EN,Secret Rare
12345678,2,Near Mint,SAST-EN,Ultra Rare
87654321,3,Lightly Played,LED7-EN,Rare
```

**Response (200 OK)**:
```json
{
  "imported_count": 3,
  "skipped_count": 0,
  "total_collection_value": 145.50,
  "imported_items": [
    {"card_id": 25955203, "quantity": 1, "set_code": "LEDE-EN"},
    ...
  ],
  "errors": []
}
```

**Error (400 Bad Request - Invalid CSV)**:
```json
{
  "imported_count": 2,
  "skipped_count": 1,
  "errors": [
    "Row 3: Invalid card_id (9999999)"
  ]
}
```

---

## Admin Dashboard Endpoints

**Endpoint**: `GET /api/admin/metrics/`

**Purpose**: Retrieve API usage and cache metrics (admin only)

**Response (200 OK)**:
```json
{
  "api_metrics": {
    "calls_today": 450,
    "calls_last_7_days": 3200,
    "current_req_per_sec": 5.3,
    "avg_response_time_ms": 145
  },
  "cache_metrics": {
    "hit_ratio": 0.87,
    "cache_size_mb": 125.5,
    "total_cached_cards": 8950
  },
  "user_metrics": {
    "total_users": 342,
    "active_today": 95,
    "total_decks": 1250,
    "most_viewed_cards": [
      {"card_id": 25955203, "card_name": "Blue-Eyes White Dragon", "views": 5430}
    ]
  },
  "rate_limit_status": {
    "current_req_per_sec": 5.3,
    "max_req_per_sec": 15,
    "warning_threshold": 12
  }
}
```

---

**Endpoint**: `POST /api/admin/cache/clear/`

**Purpose**: Clear all card caches (admin only)

**Request Body**:
```json
{
  "cache_type": "all"  // or "cards", "sets", "archetypes"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Banlist cache cleared and re-fetched",
  "cleared_items": 1
}
```

---

## Error Responses (Global)

**401 Unauthorized** (missing/invalid token):
```json
{
  "error": "Unauthorized",
  "detail": "Missing or invalid authentication token"
}
```

**403 Forbidden** (insufficient permissions):
```json
{
  "error": "Forbidden",
  "detail": "You do not have permission to access this resource"
}
```

**429 Too Many Requests** (rate limited):
```json
{
  "error": "Rate limit exceeded",
  "detail": "Too many requests. Please try again in 60 seconds."
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "detail": "An unexpected error occurred. Please try again later."
}
```

---

**API Contracts Complete** ✅

All endpoints documented with request/response examples. Ready for implementation.

**Version**: 1.0.0 | **Updated**: 2026-06-16
