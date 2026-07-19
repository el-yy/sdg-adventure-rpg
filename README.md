# SDG Adventure RPG

A multiplayer role-playing game that educates players about the Sustainable Development Goals (SDGs) through interactive gameplay.

## Quick Start

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Set up Firebase (create a project at https://console.firebase.google.com)
cp client/.env.example client/.env
# Edit client/.env with your Firebase config

# Start development servers
cd client && npm run dev    # Client on :5173
cd server && npm run dev    # Socket.io on :3001
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend UI | React 19 + Vite 8 |
| Game Engine | Phaser 3 |
| Language | TypeScript |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Realtime | Socket.io |
| Server | Node.js + Express |

## Project Structure

```
SDG/
├── client/                    # React + Phaser frontend
│   ├── src/
│   │   ├── components/        # React UI (auth, dashboard, HUD, etc.)
│   │   ├── game/              # Phaser game code
│   │   │   ├── scenes/        # Game world scenes
│   │   │   ├── systems/       # XP, Quest, Achievement, Inventory
│   │   │   ├── data/          # Quest definitions, world configs
│   │   │   └── entities/      # Player, NPC
│   │   ├── services/          # Firebase, Socket.io clients
│   │   ├── hooks/             # React custom hooks
│   │   └── types/             # TypeScript types
│   └── dist/                  # Production build
├── server/                    # Socket.io multiplayer server
│   └── src/
│       ├── rooms/             # Room management
│       ├── types/             # Server types
│       └── index.ts           # Entry point
└── shared/                    # Shared types
    └── types/index.ts
```

## Game Features

- **4 SDG Worlds**: Forest, Health, Education, City
- **18 Quests**: Decision-based quests teaching SDG concepts
- **Character System**: 4 attributes (Environmental Knowledge, Health Awareness, Problem Solving, Community Impact)
- **XP & Leveling**: 20 levels from SDG Beginner to SDG Guardian
- **20 Achievements**: Unlockable badges for completing milestones
- **Multiplayer**: Co-op rooms for 2-4 players
- **SDG Guide**: In-game AI-style guide with facts and tips
- **Leaderboards**: Global rankings by XP

## Controls

- **WASD / Arrow Keys**: Move player
- **E**: Interact with NPCs / Close dialog
- **Tab**: Toggle quest log

## Environment Variables

```env
# client/.env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SOCKET_SERVER_URL=http://localhost:3001

# server/.env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Build Commands

```bash
# Client
cd client && npm run build    # Production build

# Server
cd server && npm run build    # Compile TypeScript
```
