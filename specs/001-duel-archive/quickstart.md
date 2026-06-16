# Quickstart: Duel Archive

**Created**: 2026-06-16  
**Phase**: 1 (Design & Contracts)  
**Purpose**: Setup instructions, deployment checklist, and manual validation scenarios

## Local Development Environment Setup

### Prerequisites

- Node.js 18+ with npm/pnpm
- Python 3.11+
- PostgreSQL 13+
- Redis (optional; Celery broker)
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Duel Archive
EOF

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/duel_archive
REDIS_URL=redis://localhost:6379/0
YGOPRODECK_API_URL=https://db.ygoprodeck.com/api/v7/
ALLOWED_HOSTS=localhost,127.0.0.1
EOF

# Create PostgreSQL database
createdb duel_archive

# Run migrations
python manage.py migrate

# Load initial data (optional; YGOPRODeck data fetched on-demand)
# python manage.py loaddata fixtures/initial_banlist.json

# Create superuser (admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
# API runs at http://localhost:8000/api
```

### Database Setup

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
# Windows: Download installer from postgresql.org

# Start PostgreSQL service
pg_ctl -D /usr/local/var/postgres start

# Verify connection
psql -U postgres -c "SELECT version();"
```

### Redis Setup (for Celery)

```bash
# Install Redis
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
# Windows: Use WSL or Docker

# Start Redis
redis-server

# Verify connection
redis-cli ping  # Should return "PONG"
```

### Start Celery (Background Tasks)

```bash
# In backend directory (with venv activated)
celery -A src worker -l info

# Optional: Start Celery Beat (scheduler)
celery -A src beat -l info
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (frontend: Jest/RTL ≥80%; backend: Django ≥75%)
- [ ] ESLint and Prettier checks passing (no formatting issues)
- [ ] Environment variables configured (.env.production)
- [ ] Database migrations ready and tested
- [ ] Static files collected (`python manage.py collectstatic --noinput`)
- [ ] Media storage configured (AWS S3, Backblaze B2, or local)
- [ ] Figma layouts validated against responsive breakpoints

### Environment Variables

**Backend (.env.production)**:
```
DEBUG=False
SECRET_KEY=<generate strong random key>
DATABASE_URL=postgresql://user:password@db.example.com:5432/duel_archive
REDIS_URL=redis://:password@redis.example.com:6379/0
YGOPRODECK_API_URL=https://db.ygoprodeck.com/api/v7/
ALLOWED_HOSTS=duel-archive.com,www.duel-archive.com
CSRF_TRUSTED_ORIGINS=https://duel-archive.com,https://www.duel-archive.com
CORS_ALLOWED_ORIGINS=https://duel-archive.com,https://www.duel-archive.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@duel-archive.com
EMAIL_HOST_PASSWORD=<email password>
AWS_STORAGE_BUCKET_NAME=duel-archive-media
AWS_S3_REGION_NAME=us-east-1
AWS_S3_ACCESS_KEY_ID=<AWS access key>
AWS_S3_SECRET_ACCESS_KEY=<AWS secret>
```

**Frontend (.env.production)**:
```
VITE_API_URL=https://api.duel-archive.com/api
VITE_APP_NAME=Duel Archive
```

### Deployment Platforms

#### Option 1: Railway / Heroku (Simple)
- Push code to Git
- Railway/Heroku auto-deploys
- PostgreSQL add-on provided
- Redis add-on provided

#### Option 2: Docker + Docker Compose (Recommended)
```bash
# Build images
docker-compose build

# Start services (frontend, backend, PostgreSQL, Redis)
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

#### Option 3: Traditional VPS (AWS EC2, DigitalOcean, Linode)
- Ubuntu 22.04 LTS
- Install dependencies (Node, Python, PostgreSQL, Redis, Nginx)
- Setup systemd services for backend, Celery, Celery Beat
- Use Nginx as reverse proxy
- Setup SSL with Let's Encrypt

### Post-Deployment

- [ ] Database migrations completed
- [ ] Superuser created for admin dashboard access
- [ ] Health check endpoint responding (`GET /api/health/`)
- [ ] Frontend assets cached (browser cache headers set)
- [ ] Monitoring configured (error logging, metrics)
- [ ] Backups scheduled (PostgreSQL daily, media files)
- [ ] Documentation updated (deployment, rollback procedures)

---

## Manual Validation Scenarios

### Scenario 1: Guest Card Search

**Objective**: Verify guest can search, filter, and view card details without authentication

**Steps**:
1. Open browser to `http://localhost:5173` (frontend)
2. Homepage loads with search bar
3. Enter "Blue-Eyes" in search box
4. Results display in paginated list (20 cards per page)
5. Each result shows thumbnail image (image_url_small)
6. Click first result → Detail page loads
7. **Verify**: 
   - Left panel scrolls independently
   - Right panel shows fixed full-size image (image_url)
   - Card stats display (ATK 3000, DEF 2500, Level 8, etc.)
   - Banlist status shows "Not Banned"
   - Price history shows (if data exists)
8. Navigate back to search
9. **Verify**: First card appears in recently viewed list

**Expected Duration**: 2 minutes

---

### Scenario 2: User Registration & Guest Data Migration

**Objective**: Verify guest data is migrated on registration

**Steps**:
1. As guest, view 2–3 cards and add to draft deck (localStorage)
2. Click "Register"
3. Fill form: email = "testuser@example.com", password = "TestPass123"
4. **Verify**: 
   - POST /api/auth/register/ receives X-Device-ID header (guest UUID)
   - Redirect to login (or auto-login)
5. Log in with same credentials
6. **Verify**:
   - Recently viewed cards appear in profile
   - Draft deck appears in "My Decks"
   - User profile shows email address

**Expected Duration**: 3 minutes

---

### Scenario 3: Deck Building & Validation

**Objective**: Verify deck building with banlist compliance

**Steps**:
1. Log in as registered user
2. Click "Create Deck" → name it "Blue-Eyes Control"
3. Search for "Blue-Eyes White Dragon" → add 3 copies to main deck
4. Search for "Blue-Eyes Jet Dragon" (limited card) → attempt to add 2 copies
5. **Verify**: Error message "This card is limited to 1 copy. Cannot add a 2nd copy."
6. Adjust to 1 copy → add succeeds
7. Add more cards until main deck = 42 cards
8. Click "Save Deck"
9. **Verify**:
   - Deck persists
   - Deck statistics display (type distribution chart, estimated cost, etc.)
10. Export as YDK file → download completes
11. **Verify**: File named "blue-eyes-control.ydk" contains main/extra/side sections

**Expected Duration**: 5 minutes

---

### Scenario 4: Card Detail Two-Column Layout

**Objective**: Verify responsive detail page layout

**Steps**:
1. Navigate to any card detail page
2. **Desktop (1920px)**:
   - Left panel occupies ~50% width (scrollable)
   - Right panel occupies ~50% width (sticky, stays fixed while left scrolls)
   - Both panels visible side-by-side
3. Scroll left panel → right image stays fixed
4. Scroll down to price history section
5. **Verify**: Line chart renders (last 30 days of prices)
6. **Tablet (768px)**:
   - Resize browser to 768px width
   - Layout adapts to stacked (image on top or below text)
   - Left panel full width, scrollable
7. **Mobile (375px)**:
   - Resize to mobile width
   - Image and stats stack vertically
   - Both fully scrollable

**Expected Duration**: 3 minutes

---

### Scenario 5: Wishlist & Price Alerts

**Objective**: Verify wishlist heart animation and price alert setup

**Steps**:
1. Log in as registered user
2. Navigate to card detail page
3. Click heart icon next to card name
4. **Verify**:
   - Heart fills with color
   - Heartbeat animation plays (scales up/down 1–2 times)
   - Animation completes in <1 second
5. Reload page → heart remains filled
6. On detail page, set price alert: "Alert when price < $8.00"
7. Click "Save Alert"
8. **Verify**: Confirmation message "Alert created. You'll be notified if price drops below $8.00"

**Expected Duration**: 2 minutes

---

### Scenario 6: Collection Manager & CSV Import

**Objective**: Verify collection tracking and bulk import

**Steps**:
1. Log in as registered user
2. Navigate to Collection Manager
3. Add card manually:
   - Search "Blue-Eyes White Dragon"
   - Click "Add to Collection"
   - Quantity = 2, Condition = "Near Mint", Set = "LEDE-EN", Rarity = "Secret Rare"
   - Click Save
4. **Verify**: Card appears in collection with correct details
5. Prepare CSV file:
   ```
   card_id,quantity,condition,set_code,rarity
   25955203,1,Mint,LEDE-EN,Secret Rare
   12345678,2,Lightly Played,SAST-EN,Ultra Rare
   87654321,3,Moderately Played,LED7-EN,Rare
   ```
6. Click "Bulk Import" → upload CSV file
7. **Verify**: 
   - Success message "3 cards imported"
   - All 3 cards appear in collection
   - Total collection value calculated and displayed

**Expected Duration**: 4 minutes

---

### Scenario 7: Admin Dashboard

**Objective**: Verify admin can monitor API metrics and manage cache

**Steps**:
1. Log in as superuser (created with `python manage.py createsuperuser`)
2. Navigate to `/admin` (Admin Dashboard)
3. **Verify**:
   - API metrics card shows: total calls today, calls last 7 days, current req/s
   - Cache metrics card shows: hit ratio (%), cache size (MB)
   - User metrics card shows: total users, active decks, most viewed cards
   - Rate limit indicator shows current requests/second
4. Click "Clear All Card Caches"
5. **Verify**: 
   - Action is logged (audit log created)
   - Metrics refresh (cache size drops to 0)
   - Confirmation message "Card cache cleared"
6. Click "Re-fetch Banlist"
7. **Verify**: Timestamp updates; banlist refreshed immediately

**Expected Duration**: 3 minutes

---

### Scenario 8: Responsive Mobile (iPhone 12)

**Objective**: Verify mobile UX is functional and accessible

**Steps**:
1. Open Chrome DevTools → toggle device toolbar → iPhone 12 (390px × 844px)
2. Navigate to search page
3. **Verify**:
   - Search bar has ≥48px height (touch-friendly)
   - Results display in 1 column
   - Pagination buttons ≥48px × 48px
4. Click card detail → loads correctly
5. **Verify**:
   - Image displays full width
   - Info panel below image, scrollable
   - No horizontal scroll overflow
6. Attempt dark mode toggle (if implemented)
7. **Verify**: Smooth CSS transition; no flicker

**Expected Duration**: 3 minutes

---

### Scenario 9: JWT Token Refresh

**Objective**: Verify automatic token refresh on expiry

**Steps**:
1. Log in as registered user
2. Open DevTools → Network tab
3. Trigger API call (e.g., load My Decks)
4. **Verify**: Authorization header sent: `Authorization: Bearer eyJ...`
5. (Simulate token expiry by manually setting token to expired value in localStorage)
6. Trigger another API call
7. **Verify**:
   - First request returns 401 Unauthorized
   - Background request to `/api/auth/refresh/` is made
   - New access token issued
   - Original request retried with new token
   - Response succeeds (no error shown to user)

**Expected Duration**: 2 minutes

---

### Scenario 10: Random Card Pull with Animation

**Objective**: Verify random pull and reveal animation

**Steps**:
1. Log in as registered user
2. Click "Pull Random Card" button
3. **Verify**:
   - Within 2 seconds, a random card detail page loads
   - Reveal animation plays: fade-in + scale or particle effect (1–2 seconds)
   - Animation smooth, no stutter (60 FPS)
4. Card appears in collection with count = 1
5. Click "Pull Random Card" again
6. **Verify**: Button is disabled for 2 seconds (rate limiting enforced)
7. After 2 seconds, button re-enables
8. Click again → different random card loads

**Expected Duration**: 3 minutes

---

## Health Check Endpoints

```bash
# Backend health
curl http://localhost:8000/api/health/
# Response: {"status": "ok", "database": "connected", "redis": "connected"}

# Frontend health (page load)
curl http://localhost:5173/
# Response: HTML page loads successfully

# API search endpoint
curl "http://localhost:8000/api/cards/?name=Blue-Eyes&page=1"
# Response: {"count": 50, "next": null, "previous": null, "results": [...]}
```

---

## Troubleshooting

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run dev
```

### Backend migrations fail
```bash
# Check migration history
python manage.py showmigrations

# Revert to previous migration (if needed)
python manage.py migrate decks 0001_initial

# Create new migration for schema changes
python manage.py makemigrations
python manage.py migrate
```

### PostgreSQL connection error
```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# Check DATABASE_URL format
# Expected: postgresql://user:password@localhost:5432/duel_archive
```

### Redis connection error
```bash
# Verify Redis is running
redis-cli ping  # Should return PONG

# Check REDIS_URL in .env
# Expected: redis://localhost:6379/0
```

### CSS animations not smooth
- Check GPU acceleration: DevTools → Performance → record and look for long frames
- Ensure animations use `transform` and `opacity` (not layout properties)
- Check `will-change: transform` is set on animated elements

---

**Quickstart Complete** ✅

All setup, deployment, and manual validation scenarios documented. Ready for Phase 2 implementation.

**Version**: 1.0.0 | **Updated**: 2026-06-16
