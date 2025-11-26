# VelvetPlay Online - Design Guidelines

## Design Philosophy
**Luxury velvet + neon + ember aesthetic with cinematic motion.** This is NOT a generic Tailwind template - every screen must feel premium, layered, and alive. No basic card-with-border looks, no flat backgrounds, no plain gray boxes.

## Brand Identity

**Keywords:** Velvet • Neon • Ember • Silk • Night Lounge • Desire • Luxury

**Color Palette:**
- Velvet Red: #B00F2F
- Noir Black: #050509
- Deep Plum: #3B0F5C
- Ember Orange: #FF5E33
- Neon Magenta: #FF008A
- Champagne Gold: #E3C089
- Heat Pink: #FF2E6D

**Typography:**
- Headings: Modern elegant sans (Epilogue or equivalent)
- Body: Inter
- Accent: Optional italic serif for sensual emphasis

## Layout System
Use Tailwind spacing units: 2, 4, 8, 12, 16, 20, 24 for consistency.

## Core Components

**Cards:**
- 3D tilt effect on hover using Framer Motion (rotateX/Y)
- Inner glow and light sweep animations
- Layered gradients with subtle noise texture (no flat colors)
- Custom shadow presets (shadow-velvet, shadow-ember)

**Buttons:**
- Primary: Velvet gradient with glow
- Secondary: Outlined with neon accent
- Ghost: Minimal with hover glow
- Icon: Circular with backdrop blur when over images

**Heat Meter:**
- Rounded neon tube design
- Animated liquid fill using gradients + background position
- Pulsing outline on intensity changes
- Dynamic labels: "Warm" → "Blushing" → "Danger Zone"

**Prompt Cards:**
- Real card flip animation with spring physics
- Soft ambient glow behind card (intensity-based color)
- Blurred colored halo suggesting heat level

**Input Fields:**
- Dark backgrounds with neon borders
- Glow effect on focus
- Elegant placeholder text

## Screen Specifications

**Splash/18+ Gate:**
- Velvet gradient background
- Floating ember particle animations
- Smooth entrance animation
- Centered disclaimer with elegant typography

**Home Screen:**
- Grid/carousel of glowing 3D-ish game cards
- Each card: title, tags, spice indicator
- Hover: tilt, shadow expansion, glow intensification
- Filters with custom styled controls
- Quick access tools in prominent position

**Game Detail:**
- Large featured card with animated reveal
- Spice indicators as glowing badges
- Prominent CTAs with gradient backgrounds

**Setup Screens (Local/Online):**
- Visual heat slider with real-time animation
- Pack selection as interactive cards
- Player input with character count/validation feedback
- Join code display with animated copy button

**Online Lobby:**
- Room code prominently displayed with glow effect
- Player list with animated avatar placeholders
- Ready state toggles with smooth transitions
- Rising heat meter ambient animation as players join

**Gameplay Screen:**
- Center prompt card with flip/slide animations
- Heat glow pulse on high-intensity prompts
- Sidebar with current player indicator (neon highlight)
- Navigation controls with icon + text labels

**Tools Screen:**
- **Heat Dice:** 3D roll with multi-axis rotation, easing curves
- **Spin Bottle:** Rotational inertia with deceleration
- **Coin Flip:** 3D flip illusion with shadow scaling
- Each tool in dedicated card with animated background

**Summary Screen:**
- Celebratory gradient background
- Animated stat reveals
- Distribution charts with neon styling
- CTAs with glow effects

**Admin Panel:**
- Dark sophisticated dashboard
- Data tables with hover states
- Form controls matching main app aesthetic
- Success/error states with animations

## Animation Principles

**Page Transitions:**
- Continuous cinematic experience
- Fade + slide + slight blur between routes
- No jarring cuts

**Micro-interactions:**
- Button press: scale down slightly
- Card hover: lift with shadow expansion
- Success actions: pulse with color shift
- Loading states: smooth skeleton screens or elegant spinners

**Physics:**
- Spring animations for cards (bounce feel)
- Easing curves for tools (natural deceleration)
- Smooth 60fps throughout

## Image Strategy
No images required - pure gradient, particle, and CSS-based visuals maintain the neon/velvet aesthetic. All visual impact comes from layered gradients, glows, and motion.

## Responsive Behavior
- Mobile: Single column layouts, bottom sheets for modals
- Tablet: 2-column grids where appropriate
- Desktop: Full multi-column layouts with expanded animations
- Touch targets: Minimum 44px for all interactive elements

## Critical Requirements
- NO generic Tailwind demo look
- NO plain flat backgrounds anywhere
- ALL cards must have depth (gradients, shadows, glows)
- Consistent velvet/neon theme across every screen
- Smooth, physics-based animations (not choppy)
- Clean, elegant spacing and alignment
- Premium feel on every interaction