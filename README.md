

## Toolchain

- **roblox-ts** — compiles TypeScript to Luau
- **Flamework** — dependency injection, lifecycle, and networking framework
- **@rbxts/react** — React 17 for Roblox UI
- **Rojo** — syncs the compiled output into Roblox Studio (managed via Aftman)

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Aftman](https://github.com/LPGhatguy/aftman) for Rojo (`aftman install` in this directory)
- The [Rojo plugin](https://create.roblox.com/store/asset/13916111004/Rojo) inside Roblox Studio

## Setup

```bash
npm install     # install TypeScript dependencies
aftman install  # install Rojo (pinned in aftman.toml)
```

## Development workflow

Run these in two terminals:

```bash
npm run watch   # compile TS -> Luau on change (outputs to out/)
rojo serve      # serve the project to Roblox Studio
```

Then in Studio, open the Rojo plugin and click **Connect**. The compiled code
in `out/` is synced live into the place.

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run build`  | Compile once (`rbxtsc`)                       |
| `npm run watch`  | Compile in watch mode                        |
| `npm run lint`   | Lint with ESLint + roblox-ts rules           |
| `npm run format` | Format with Prettier                         |
| `rojo build default.project.json -o game.rbxlx` | Build a standalone place file |

## Project structure

```
src/
├── client/                 -> StarterPlayer.StarterPlayerScripts
│   ├── controllers/        Flamework controllers (client singletons)
│   ├── ui/                 React components
│   └── runtime.client.ts   Client entry point (Flamework.ignite)
├── server/                 -> ServerScriptService
│   ├── services/           Flamework services (server singletons)
│   └── runtime.server.ts   Server entry point (Flamework.ignite)
└── shared/                 -> ReplicatedStorage (shared by both)
    └── network.ts          Flamework networking definitions
```
