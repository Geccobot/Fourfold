# Fourfold

Fourfold is a local two-player elemental strategy card game. The repository is a
TypeScript workspace with a React/Vite frontend in `apps/web` and the independent
game engine in `Packages/game-engine`.

## Frontend setup

Install dependencies from the repository root and start the frontend:

```sh
npm install
npm run dev
```

The app opens at the Vite URL printed in the terminal. It includes a local match
interface and a browser-persisted deck forge. Without `VITE_API_BASE_URL`, the
deck forge uses the bundled card catalog; when the backend is available, set
that variable to its base URL to load cards from `GET /api/cards`.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

The initial game interface supports the game-engine actions currently exposed:
placing creatures in a player's module, passing response windows, revealing
creatures at turn end, and displaying lane scores. Spell play and additional
round/match progression can be connected when those engine rules are available.
