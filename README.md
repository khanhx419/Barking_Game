# 🐕 Barking Battle

A real-time multiplayer web game where two players compete by barking into their microphones!

## Features

- **Dual-Factor Power Scoring**: Volume × Sustain Multiplier
- **Tug-of-War Dynamic**: Push the battle line toward your opponent
- **Dog Avatar Scaling**: Winning dog grows, losing dog shrinks
- **5 Dog Breeds**: Husky, Shiba, Bulldog, Corgi, Poodle
- **Sandbox Mode**: Test solo against a bot
- **Real-time Multiplayer**: Socket.io powered rooms

## Quick Start

### Server
```bash
cd server
npm install
node index.js
```

### Client
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Create a room, share the code, and BARK!

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Socket.io
- **Audio**: Web Audio API
