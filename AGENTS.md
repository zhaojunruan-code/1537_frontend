# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only UniApp + Vue 3 template project. There is no backend server in this repository.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| H5 Dev Server | `pnpm run dev:h5` | 9003 | Primary way to test in browser; Vite-based with HMR |

### Key caveats

- **`vue-tsc` type-check is broken**: `pnpm run type-check` fails due to a compatibility issue between `vue-tsc@1.8.27` and the bundled TypeScript version (search string mismatch). This is a pre-existing issue in the repo, not an environment problem.
- **No backend API**: `VITE_SERVER_BASEURL` and `VITE_UPLOAD_BASEURL` are empty in `env/.env`. Features requiring API calls (login, user profile, dict data, file upload) will not work without an external backend.
- **Package manager**: Use `pnpm` (lockfile is `pnpm-lock.yaml`; `packageManager` field specifies `pnpm@9.15.3`).
- **No lint command**: There is no dedicated ESLint or lint script in `package.json`. Only `prettier` is installed as a dev dependency.
- **Environment files** live in `env/` directory (not project root).
- **Dev commands reference**: See `CLAUDE.md` and `package.json` scripts for the full list of platform-specific dev/build commands.
