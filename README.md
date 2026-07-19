# SDG Adventure RPG

> Explore. Decide. Make an impact.

SDG Adventure RPG is a cozy multiplayer adventure game that turns the United Nations Sustainable Development Goals into interactive stories, quests, and choices. Explore themed worlds, help their communities, and learn practical ways to build a more sustainable future.

## Why play?

- Learn through action: every quest turns an SDG concept into a playable decision.
- Explore four distinct worlds: Forest, Health, Education, and City.
- Grow your Guardian: earn XP, unlock achievements, and develop four impact attributes.
- Play together: join co-op rooms and compare progress on global leaderboards.

## Highlights

| Feature | Details |
| --- | --- |
| Worlds | Forest, Health, Education, and City |
| Progression | 20 levels, from SDG Beginner to SDG Guardian |
| Quests | Decision-based missions with practical SDG lessons |
| Multiplayer | Co-op rooms for 2–4 players |
| Learning tools | In-game SDG Guide with facts and practical tips |

## Quick start

## Quick Start

```bash
# Install client dependencies
cd client && npm install

# Set up Firebase (create a project at https://console.firebase.google.com)
cp client/.env.example client/.env
# Edit client/.env with your Firebase config

# Start the client
cd client && npm run dev    # http://localhost:5173
```

The Firebase configuration must be available in `client/.env`; see [Environment variables](#environment-variables). The server is optional for local legacy room-management flows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend UI | React 19 + Vite 8 |
| Game Engine | Phaser 3 |
| Language | TypeScript |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Realtime | Firebase Realtime Database |
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
│   │   ├── services/          # Firebase and Realtime Database clients
│   │   ├── hooks/             # React custom hooks
│   │   └── types/             # TypeScript types
│   └── dist/                  # Production build
├── server/                    # Legacy local server (not required for production)
│   └── src/
│       ├── rooms/             # Room management
│       ├── types/             # Server types
│       └── index.ts           # Entry point
└── shared/                    # Shared types
    └── types/index.ts
```

## How to Play

1. Create a Guardian account and choose an unlocked world from the dashboard.
2. Select **Enter World** to load the map.
3. Move with **WASD** or the **Arrow Keys**.
4. Walk near a resident or quest area and press **E** to interact.
5. Follow the dialogue, explore task areas, collect items, and make SDG-informed decisions.
6. Open **Quest Log** from the game’s top bar to review active and available quests.
7. Complete quests to earn XP, items, achievements, and access to additional worlds.

The application also includes a dedicated **How to Play** field manual from the dashboard and game toolbar.

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

## Development checks

```bash
cd client
npm run lint
npm test
npm run build
```

## Contributing

Improvements to quest design, accessibility, gameplay systems, and SDG learning content are welcome. Keep changes focused, run the client checks above, and describe the player-facing impact in your pull request.

## License

No license has been specified for this repository.
