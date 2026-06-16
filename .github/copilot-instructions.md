<!-- SPECKIT START -->
## Duel Archive: Yu-Gi-Oh! Card Database & Deck Management Web App

**Feature Spec**: [specs/001-duel-archive/spec.md](specs/001-duel-archive/spec.md)  
**Implementation Plan**: [specs/001-duel-archive/plan.md](specs/001-duel-archive/plan.md)  
**Research Document**: [specs/001-duel-archive/research.md](specs/001-duel-archive/research.md)  
**Data Model**: [specs/001-duel-archive/data-model.md](specs/001-duel-archive/data-model.md)  
**API Contracts**: [specs/001-duel-archive/contracts/api.md](specs/001-duel-archive/contracts/api.md)  
**Quickstart**: [specs/001-duel-archive/quickstart.md](specs/001-duel-archive/quickstart.md)  

### Technology Stack

**Frontend**: React (JavaScript only, no TypeScript) with Vite, Tailwind CSS, Redux Toolkit, React Router v6  
**Backend**: Django + Django REST Framework, PostgreSQL, Celery + Redis, JWT authentication  
**External API**: YGOPRODeck API v7 (https://db.ygoprodeck.com/api/v7/)  
**Design Authority**: Figma Make source files in `/design/` (read-only, authoritative layout templates)  

### Key Constraints

- **JavaScript-Only Frontend**: No TypeScript anywhere in frontend (explicitly prohibited)
- **Figma Layout Authority**: All component layouts must replicate exact HTML/CSS from Figma exports; CSS Modules only for complex animations (60 FPS keyframes)
- **YGOPRODeck API Compliance**: 48-hour cache TTL, 15 req/s rate limit (safely below 20 req/s), no hotlinking images
- **Testing Gate**: Every implementation phase requires ≥80% frontend coverage (Jest/RTL) and ≥75% backend coverage (Django tests) with all tests passing before phase delivery
- **Two-Column Card Detail**: Left panel scrolls (stats/sets/prices/banlist), right panel sticky (full-size image_url)
- **README.md Updates**: Create/update after each phase with status, completed features, setup instructions

### Feature Priorities

**P1 (Core MVP)**: Guest card search/filter (with pagination & recent views), user auth & registration (with guest data migration), basic deck building (with banlist validation), card detail page (two-column layout)  
**P2 (Value-Add)**: Deck import/export (YDK format), wishlist/favorites (heart animation), collection manager (CSV bulk import), deck statistics & analysis  
**P3 (Nice-to-Have)**: Spoiler gallery, random card pull (with reveal animation), trading marketplace, community deck sharing, admin dashboard  

### Development Workflow

1. **Phase 0 (Complete)**: Research document generated; all technical unknowns resolved
2. **Phase 1 (Complete)**: Design artifacts created (data-model.md, API contracts, quickstart)
3. **Phase 2 (Upcoming)**: Run `/speckit.tasks` to generate tasks.md; implement per task; write tests end-of-phase
4. Each phase includes comprehensive tests before delivery; tests must pass (green output) before proceeding

### Important Notes for AI

- Figma files in `/design/` define the authoritative layout for every component; read them first before writing any component code
- All frontend files must use `.jsx/.js` extensions; JSDoc comments for props (no TypeScript interfaces)
- Tailwind CSS is primary styling; CSS Modules (*.module.css) only for: keyframe animations, complex gradients, scrollbar styling, pseudo-elements, backdrop filters, or any style with no Tailwind equivalent
- CSS Modules must be co-located with components (e.g., CardDetail.module.css next to CardDetail.jsx)
- Card images: never hotlink to images.ygoprodeck.com; use locally hosted copies via Django media storage
- All tests written in Jest (frontend) and Django unittest/pytest (backend); tests must achieve coverage targets before phase completion
- Constitution (project rules): see [.specify/memory/constitution.md](.specify/memory/constitution.md) for non-negotiable constraints and governance

**Current Status**: Phase 1 complete. Ready for Phase 2 implementation planning via `/speckit.tasks`.

Last Updated: 2026-06-16
<!-- SPECKIT END -->
