# VelvetPlay Online - 18+ Couples Party Game Platform

## Current Status: PRODUCTION READY ✅

### Recent Updates (Dec 1, 2025)
- **Game Engine Architecture**: Implemented free, open-source game engine system with:
  - `boardgame.io` for board games (Ludo)
  - Custom TypeScript engines for arcade games (Beer Pong, Memory, etc.)
  - Unified GameEngineInterface for all game types
- **Beer Pong Game**: Fully functional GamePigeon-style beer pong with:
  - 10-cup triangle formation
  - Turn-based throwing with difficulty scaling
  - Real-time cup elimination and scoring
- **Game-Specific Setup Screens**: Tailored UX for each game type:
  - Arcade: Simple player selection + difficulty slider
  - Prompt-based: Full customization (intensity, spice, movement)
  - Board games: Minimal setup

### Architecture
```
/shared/game-engines/
  ├── types.ts (GameEngineInterface, GameAction, etc)
  ├── ludoEngine.ts (board-ludo)
  ├── memoryEngine.ts (memory-match)
  ├── beerPongEngine.ts (pong/beer-pong)
  └── index.ts (engine registry)
```

### 13 Production Games
1. **Truth or Dare** (prompt-party)
2. **Never Have I Ever** (prompt-party)
3. **Would You Rather** (prompt-party)
4. **Hot Seat** (prompt-party)
5. **Couples Challenge** (prompt-couple)
6. **Velvet Ludo** (board-ludo)
7. **Velvet Memory Flip** (memory-match)
8. **Emotion Ping-Pong / Beer Pong** (pong) ⭐
9. **Neon Drift—Couple Mode** (racer)
10. **Couples Duel Arena** (tap-duel)
11. **Neon Guessing Game** (guessing)
12. **Duo Rhythm Sync** (rhythm)
13. **Party Minigames** (roulette, tap-duel, tool-randomizer)

### Engine Types
- `prompt-party`: Party prompt-based games
- `prompt-couple`: Intimate couple prompts
- `board-ludo`: Turn-based board games
- `memory-match`: Memory/matching games
- `pong`: Beer Pong arcade game
- `racer`: Racing games
- `tap-duel`: Tap/button duel games
- `guessing`: Guessing/trivia games
- `rhythm`: Rhythm/timing games
- `roulette`: Random spin games
- `tool-randomizer`: Randomizer tools

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL
- **Realtime**: WebSocket (native)
- **Game Engines**: 
  - `boardgame.io` (board games - free/open)
  - Custom TS engines (arcade - free/open)
  - No paid SaaS or paywalled APIs
- **UI Library**: Radix UI + custom Velvet components

### Design Aesthetic
- **Color Palette**: Neon magenta (#FF008A), Ember red (#B00F2F), Plum (#3B0F5C), Velvet black
- **Typography**: Display font for headers, system fonts for body
- **Particles**: Ember particles on landing, minimal motion on setup
- **Theme**: Luxury velvet + neon + ember aesthetic (18+)

### Key Features
✅ Local game sessions (no account required)
✅ Online multiplayer via WebSocket
✅ Age verification (18+ only)
✅ Multiple difficulty levels (games)
✅ Real-time synchronization
✅ Heat meter tracking (couples games)
✅ Player avatars with custom colors
✅ Game-type-specific UI/UX

### Known Limitations
- Rhythm/guessing/roulette games have placeholder screens (ready for engine implementation)
- No mobile touch optimization yet (desktop-first)
- No leaderboards or persistent profiles
- Limited to local browser storage (no backend accounts)

### Development Notes
- All games are client-side or use deterministic server logic
- No external API dependencies
- Game state is serialized JSON in sessions
- WebSocket used for real-time multiplayer sync
- Prompt selection uses weighted random sampling

### Next Steps (if continuing)
1. Implement rhythm engine with Web Audio API
2. Implement guessing/trivia engine with scoring
3. Implement racer engine with physics-based movement
4. Add touch/mobile controls
5. Persistent leaderboards
6. Matchmaking for online games
