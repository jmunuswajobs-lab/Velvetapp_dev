
# VelvetPlay Online - Advanced Adult Couples Game Universe

A premium, AAA-quality multiplayer game platform featuring flirty, PG-17 content with zero memory leaks and full real-time synchronization.

## 🎮 Features

### Game Collection
- **Classic Party Games**: Truth or Dare, Never Have I Ever, Hot Seat, Spin the Bottle, Would You Rather
- **Couples-Focused Games**: 
  - Deep Sync - Emotional connection builder
  - Temptation Trails - Progressive intimacy game
  - Fantasy Signals - Non-verbal communication
  - Dare or Devotion - Choice-based romance
  - Heat Check - Intensity escalation
  - Velvet Roulette - Wheel of desire
  - Neon Conspiracy - Cooperative missions
- **Velvet Ludo**: Romantic board game with special challenge spaces
- **CrazyGames-Inspired Remixes**:
  - Couples Duel Arena - Quick combat battles
  - Neon Drift - Couple Mode racing
  - Truth Bomb Run - Obstacle runner
  - Emotion Ping-Pong - Competitive pong
  - Velvet Memory Flip - Memory matching
  - Neon Guessing Game - Partner trivia
  - Duo Rhythm Sync - Rhythm game

### Technical Features
- ✅ **Zero Memory Leaks**: Proper cleanup of WebSockets, timers, and effects
- ✅ **Real-time Sync**: WebSocket-based multiplayer with sub-100ms latency
- ✅ **Performance Optimized**: GPU-friendly transforms, memoized components
- ✅ **Mobile Responsive**: Works seamlessly on all devices
- ✅ **AAA Graphics**: Velvet-neon aesthetic with particle effects
- ✅ **Secure**: Input sanitization, rate limiting, validation

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

### Production
```bash
npm run build
npm start
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Wouter** for routing
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Tailwind CSS** with custom velvet theme

### Backend Stack
- **Express** server
- **WebSocket (ws)** for real-time communication
- **In-memory storage** (easily replaceable with DB)
- **TypeScript** throughout

### Real-Time Engine
The multiplayer system uses WebSocket connections with:
- Authoritative server model (server validates all moves)
- Room-based connections
- Automatic reconnection handling
- Rate limiting (100ms minimum between actions)
- Player state synchronization

## 🎲 Adding New Games

### 1. Define Game Schema
Add to `server/storage.ts` in the `seedData()` method:

```typescript
{
  id: randomUUID(),
  slug: "my-new-game",
  name: "My New Game",
  description: "Description here",
  minPlayers: 2,
  maxPlayers: 4,
  supportsOnline: true,
  supportsLocal: true,
  tags: ["couples", "fun"],
  isSpicy: true,
  isCoupleFocused: true,
  iconName: "heart",
  createdAt: new Date(),
}
```

### 2. Add Prompts
Still in `seedData()`:

```typescript
const myGameId = games[X].id;
const myGamePrompts: Omit<Prompt, "id" | "createdAt">[] = [
  { 
    gameId: myGameId, 
    packId: null, 
    text: "Your prompt text", 
    type: "dare", 
    intensity: 3, 
    flags: { isFlirty: true } 
  },
  // ... more prompts
];
```

### 3. Create Gameplay Component
Add to `client/src/pages/` or use the standard `Gameplay.tsx` component.

### 4. Add Route (if custom component)
In `client/src/App.tsx`:

```typescript
<Route path="/games/my-new-game/play" component={MyGameComponent} />
```

## 🎯 Velvet Ludo System

The Ludo board game uses a custom implementation:

### Board Structure
- 52-space circular track
- 4 home bases (red, blue, green, yellow)
- 6-space home stretch for each player
- Special Velvet Spaces at positions [6, 13, 20, 27, 34, 41, 48]

### Game Flow
1. Players roll dice (1-6)
2. Rolling 6 allows piece to leave home or gives extra roll
3. Landing on Velvet Space triggers romantic prompt
4. First player to get all pieces home wins

### WebSocket Events
- `ludo_roll_dice` - Request dice roll
- `ludo_dice_result` - Server sends dice value
- `ludo_move_piece` - Request piece movement
- `ludo_piece_moved` - Server validates and broadcasts
- `ludo_next_turn` - Advance to next player
- `ludo_prompt_complete` - Finish prompt and continue
- `ludo_game_over` - Game finished

## 🔒 Safety & Guidelines

### PG-17 Standards
- ✅ Flirty, spicy, bold content
- ✅ Teasing and suggestive themes
- ❌ No explicit content
- ❌ No nudity
- ❌ No minors
- ❌ No illegal content

### Security Measures
- Input sanitization on all user data
- Rate limiting (100ms minimum between actions)
- WebSocket message validation
- Room access control
- Idempotent server actions

## 🎨 Visual Design System

### Color Palette
- `noir-black`: #050509
- `plum-deep`: #3B0F5C
- `neon-magenta`: #FF008A
- `crimson-velvet`: #B00F2F
- `champagne-gold`: #E3C089

### Components
- `VelvetButton` - Premium button with multiple variants
- `VelvetCard` - 3D tilt-enabled cards with glow
- `HeatMeter` - Animated intensity indicator
- `EmberParticles` - Floating particle effects
- `PlayerAvatar` - Animated player indicators

### Animations
All animations use Framer Motion with:
- Page transitions (fade, slide)
- Card flips and reveals
- Micro-interactions on hover/tap
- Smooth state changes
- GPU-accelerated transforms

## 📊 Performance Optimizations

### Memory Management
- Proper useEffect cleanup
- WebSocket connection disposal
- Timer and interval clearance
- No stale closures
- Memoized expensive computations

### Rendering
- React.memo for static components
- useMemo for derived state
- useCallback for stable functions
- Debounced inputs
- Virtualized long lists

### Network
- Rate limiting
- Optimistic updates
- Minimal payload sizes
- Connection pooling
- Automatic reconnection

## 🐛 Known Limitations

- In-memory storage (data lost on restart)
- No user authentication (guest-only)
- Limited to 10 players per room
- WebSocket requires stable connection

## 🔮 Future Enhancements

- Database persistence
- User accounts and profiles
- Custom game creation
- Advanced statistics
- Achievements system
- More game modes
- Voice/video integration
- Mobile native apps

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Contact the repository owner for contribution guidelines.

---

Built with ❤️ using modern web technologies for couples who want to connect and have fun together.
