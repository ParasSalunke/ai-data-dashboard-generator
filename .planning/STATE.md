# State — AI Data Dashboard Generator

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-28)

**Core value:** A user can drag-and-drop a CSV file and immediately see auto-generated charts and AI insights about their data — no configuration required.

**Current focus:** Phase 1 — Backend Foundation + File Upload

## Current Status

- **Milestone:** 1 (MVP)
- **Phase:** 1 of 5
- **Status:** Ready to plan

## Phase Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Backend Foundation + File Upload | ⬜ Not started |
| 2 | Data Analysis + Chart Generation | ⬜ Not started |
| 3 | AI Insights + Filtering | ⬜ Not started |
| 4 | AI Q&A + Drag-and-Drop | ⬜ Not started |
| 5 | Export + Polish | ⬜ Not started |

## Notes

- Frontend scaffold already exists in `/frontend` (Next.js 16, shadcn/ui, Tailwind CSS v4)
- Backend directory does not exist yet — needs `mkdir backend` in Phase 1
- OpenAI API key must be provided by user as environment variable `OPENAI_API_KEY`
- Dataset storage uses `/tmp/datasets/{uuid}/` — no database required for MVP

---
*Last updated: 2026-03-28 after initialization*
