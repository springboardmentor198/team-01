# Recent Searches Improvements — Task Tracker

## Backend (add delete capability, existing APIs untouched)

- [x] 1. SearchHistoryRepository.java — add `deleteByIdAndUser_UserId` + `deleteByUser_UserId`
- [x] 2. SearchHistoryService.java — add `deleteSearch(email, searchId)` + `clearSearchHistory(email)`
- [x] 3. SearchHistoryServiceImpl.java — implement delete + clear
- [x] 4. SearchHistoryController.java — add `DELETE /api/search-history/{searchId}` + `DELETE /api/search-history`

## Frontend

- [x] 5. api.js — add `deleteSearchHistory` + `clearSearchHistory`
- [x] 6. useRecentSearches.js — add `removeSearch` + `clearAll`
- [x] 7. RecentSearchesTable.jsx — accept `onDelete`/`onClearAll`, per-row delete + Clear All button
- [x] 8. RecentSearchesTable.css — fixed-height scroll + sticky header + button styles
- [x] 9. PropertySearch.jsx — wire `onDelete` + `onClearAll`
- [x] 10. Dashboard.jsx — add per-row delete + Clear All + Actions column
- [x] 11. Dashboard.css — fixed-height scroll + sticky header + button styles

## Verify

- [x] 12. Build backend (mvnw compile) — BUILD SUCCESS
- [x] 13. Build frontend (vite) — built successfully
