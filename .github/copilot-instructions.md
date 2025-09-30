# Copilot Instructions for FirevolX (firevolxapp)

## Project Overview
- **Purpose:** Industrial safety monitoring system with AI-powered fire detection, emergency alerts, and robot/camera integration.
- **Frontend:** React 18 + TypeScript, Vite, shadcn/ui (Radix UI), Tailwind CSS, React Query, Capacitor (for mobile).
- **Backend/Services:** Node.js WebSocket-to-Telnet proxy, ROS 2 Humble integration (via @foxglove/ws-protocol), no external DB.
- **Deployment:** Static build (Vite), can be opened via `index.html` or deployed to Lovable.

## Key Directories & Files
- `src/` — Main app code (components, hooks, pages, services, utils)
  - `components/` — UI and logic components (e.g., `CameraFeed.tsx`, `FireAlertNotification.tsx`)
  - `pages/` — Route-level pages (e.g., `Home.tsx`, `Settings.tsx`)
  - `services/` — ROS2, Telnet, and network service logic
  - `hooks/` — Custom React hooks
  - `lib/` — Utility functions
- `android/` — Capacitor/Android native project for mobile builds
- `public/` — Static assets
- `vite.config.ts` — Vite config (note: uses `@` alias for `src/`)
- `capacitor.config.ts` — Capacitor mobile config

## Architecture & Patterns
- **Routing:** Uses React Router with HashRouter for static compatibility.
- **State:** React Query for server state, custom hooks for local state.
- **UI:** Shadcn/ui (Radix primitives) + Tailwind for consistent, accessible design.
- **Streaming:** Camera feeds via HLS.js; robot/camera comms via WebSocket (see `ros2Service.ts`, `telnetService.ts`).
- **Settings:** Local storage for persistent config (no backend DB).
- **Mobile:** Capacitor enables mobile builds; webDir is `dist`.
- **Aliases:** Use `@/` for imports from `src/` (see `vite.config.ts`).

## Developer Workflows
- **Install:** `npm install`
- **Dev server:** `npm run dev` (Vite, port 5000)
- **Build (static):** `npm run build` → outputs to `dist/`
- **Preview build:** `npm run preview`
- **Lint:** `npm run lint`
- **Android:** Use Capacitor/Android Studio for mobile builds (see `android/`)
- **Deploy:** Open `index.html` in `dist/` for static, or use Lovable's Share/Publish

## Integration Points
- **ROS 2:** WebSocket bridge via `@foxglove/ws-protocol` (see `ros2Service.ts`)
- **Telnet:** Node.js proxy (`telnetProxy.js`), client in `telnetService.ts`
- **Cameras:** HLS.js for video feeds, config in `CameraConfigDialog.tsx`
- **UI:** All UI should use shadcn/ui components for consistency

## Project Conventions
- **TypeScript everywhere** (strict mode)
- **Functional React components** only
- **No direct DOM manipulation**; use React refs/effects
- **All stateful logic in hooks or React Query**
- **Use `@/` alias for imports from `src/`**
- **No external DBs**; use local storage for persistence
- **Keep all network/service logic in `services/`**
- **UI logic in `components/`, not in pages**

## Examples
- Importing a component: `import CameraFeed from '@/components/CameraFeed'`
- Using a service: `import { sendCommand } from '@/services/ros2Service'`
- Adding a new page: Place in `src/pages/`, add route in main app

## References
- See `README.md` and `replit.md` for more details on architecture and dependencies.
- For deployment, see `README-DEPLOYMENT.md`.

---

**For AI agents:**
- Always follow the above conventions and directory structure.
- When in doubt, prefer patterns already used in `src/components/` and `src/services/`.
- Document any new patterns or workflows in this file for future agents.
