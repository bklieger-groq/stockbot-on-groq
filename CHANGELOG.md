# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

 ## [1.1.2] - 2024-08-05
  
Add annotations to chart widget, add vercel deploy button, clean dependencies 

### Added

### Changed

- README.md
- components/tradingview/stock-chart.tsx
- package.json
- pnpm-lock.yaml


 ## [1.1.1] - 2024-07-30
  
Remove legacy local storage handling of API key in favor of server-side

[GitHub PR](https://github.com/bklieger-groq/stockbot-on-groq/pull/17)

### Added

### Changed

- components/chat-panel.tsx
- components/empty-screen.tsx
- components/missing-api-key-banner.tsx
- lib/chat/actions.tsx

### Fixed

### Removed

- components/api-key-input.tsx

---

## [1.1.0] - 2024-07-29
  
Updated functionality to load GROQ_API_KEY from .env and hide local storage management of API key if provided.

[GitHub PR](https://github.com/bklieger-groq/stockbot-on-groq/pull/15)

### Added

### Changed

- .env.example
- app/actions.ts
- components/api-key-input.tsx
- components/chat.tsx
- components/empty-screen.tsx
- components/missing-api-key-banner.tsx
- lib/chat/actions.tsx

### Fixed

---

## [1.0.0] - 2024-06-26
  
Initial release of the StockBot project.

### Added
 
All files.

### Changed

### Fixed
 
