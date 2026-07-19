# SDG Adventure RPG

> Explore. Decide. Make an impact.

[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Phaser](https://img.shields.io/badge/Phaser-4.2.1-0D47A1)](https://phaser.io/)
[![Firebase](https://img.shields.io/badge/Firebase-12.16.0-FFCA28?logo=firebase&logoColor=111827)](https://firebase.google.com/)

## Overview

SDG Adventure RPG is a cozy multiplayer learning adventure that turns the United Nations Sustainable Development Goals into interactive stories, quests, and meaningful choices. Players explore themed worlds, help virtual communities, and learn practical ways to build a more sustainable future.

> [!WARNING]
> **Local demonstration project:** Do not enter real personal, health, or other sensitive information into local development environments. Review and harden authentication, authorization, data protection, dependencies, and deployment configuration before considering any public or production use.

## Supports

The game currently includes worlds and quests connected to these Sustainable Development Goals:

- **SDG 3 — Good Health and Well-being:** Explore health and well-being practices in a virtual community.
- **SDG 4 — Quality Education:** Help communities improve access to learning and knowledge.
- **SDG 7 — Affordable and Clean Energy:** Make responsible energy choices in the Forest World.
- **SDG 10 — Reduced Inequalities:** Address inequality and inclusion in the City World.
- **SDG 11 — Sustainable Cities and Communities:** Help build a resilient and equitable urban community.
- **SDG 12 — Responsible Consumption and Production:** Learn about waste reduction and sustainable choices.
- **SDG 13 — Climate Action:** Investigate climate challenges and reduce environmental impact.
- **SDG 15 — Life on Land:** Protect and restore forests, wildlife, and terrestrial ecosystems.

## Highlights

- **Four themed worlds:** Forest, Health, Education, and City.
- **Decision-based quests:** Turn SDG concepts into playable choices and outcomes.
- **Guardian progression:** Earn XP, unlock achievements, and develop four impact attributes.
- **Co-op play:** Join multiplayer rooms and compare progress on leaderboards.
- **SDG Guide:** Review in-game facts and practical tips while exploring.

## Quick start

```bash
# Install client dependencies
cd client
npm install

# Create local Firebase configuration
cp .env.example .env
# Edit client/.env with your Firebase configuration

# Start the client
npm run dev    # http://localhost:5173
```

The optional server can be built with `cd server && npm run build` for local room-management flows.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend UI | React + Vite |
| Game engine | Phaser |
| Language | TypeScript |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Realtime data | Firebase Realtime Database |
| Server | Node.js + Express |

## Project structure

```text
SDG/
├── client/                    # React + Phaser frontend
│   ├── src/
│   │   ├── components/        # React UI, dashboard, HUD, and guides
│   │   ├── game/              # Phaser scenes, systems, maps, and quest data
│   │   ├── services/          # Firebase and realtime service clients
│   │   ├── hooks/             # React custom hooks
│   │   └── types/             # Client-side types
├── server/                    # Local room-management server
│   └── src/
│       ├── rooms/             # Room management
│       ├── types/             # Server types
│       └── index.ts           # Entry point
└── shared/                    # Shared types
    └── types/index.ts
```

## How to play

1. Create a Guardian account and choose an unlocked world from the dashboard.
2. Select **Enter World** to load the map.
3. Move with **WASD** or the **Arrow Keys**.
4. Walk near a resident or quest area and press **E** to interact.
5. Follow the dialogue, explore task areas, collect items, and make SDG-informed decisions.
6. Open **Quest Log** from the game’s top bar to review active and available quests.
7. Complete quests to earn XP, items, achievements, and access to additional worlds.

The dashboard and game toolbar also include a dedicated **How to Play** field manual.

## Environment variables

```env
# client/.env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_realtime_database_url
VITE_SOCKET_SERVER_URL=http://localhost:3001

# server/.env
PORT=3001
CORS_ORIGIN=http://localhost:5173
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
