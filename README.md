# userscripts

<div align="center">

*Personal Violentmonkey userscripts, built with Vite and shipped through GitHub Releases*

[![Release](https://github.com/hnjae/userscripts/actions/workflows/release.yml/badge.svg)](https://github.com/hnjae/userscripts/actions/workflows/release.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue?style=flat-square)](LICENSE)

[Scripts](#scripts) · [Installation](#installation) · [Development](#development)

</div>

A personal monorepo of browser userscripts written for [Violentmonkey](https://violentmonkey.github.io/). Each script lives in its own pnpm workspace package, is built with [vite-plugin-monkey](https://github.com/vite-plugin/vite-plugin-monkey), and is published automatically as a GitHub release — installs and updates always resolve to the same stable URL.

## Scripts

| Script                            | Description                                                                    |                                                                                                Install |
| --------------------------------- | ------------------------------------------------------------------------------ | -----------------------------------------------------------------------------------------------------: |
| [font-remap](scripts/font-remap/) | Replace Korean, Latin, and system UI fonts with a locally installed Pretendard | [font-remap.user.js](https://github.com/hnjae/userscripts/releases/latest/download/font-remap.user.js) |

### font-remap

Remaps a fixed set of Korean, Latin, and system UI font family names — Noto Sans KR, Nanum Gothic, Malgun Gothic, Dotum, Inter, Roboto, Segoe UI, Helvetica, Arial, and more — to Pretendard through document-level `@font-face` rules.

- Font stacks are never rewritten, so icon fonts and site fallback chains stay intact.
- Replacement reaches shadow DOM and iframes, applies before first paint, and keeps winning against webfonts the site registers later.
- Every weight renders with true strokes from a Pretendard Variable install; italic text gets Pretendard glyphs with a synthesized slant.
- Glyphs Pretendard does not cover (e.g. Cyrillic, CJK ideographs) fall through the site's remaining font stack.

The full behavior contract is specified in [`docs/spec/font-remap.md`](docs/spec/font-remap.md).

> [!IMPORTANT]
> The script ships no font data. Install [Pretendard](https://github.com/orioncactus/pretendard) on your system first — without it, affected sites render exactly as they would without the script.

## Installation

1. Install the [Violentmonkey](https://violentmonkey.github.io/) extension (any userscript manager works; the scripts use plain DOM APIs only).
2. Click an install link above and confirm the installation prompt.
3. Done — scripts keep themselves up to date.

Every script points its `@updateURL` and `@downloadURL` at `releases/latest/download/<name>.user.js`, which always serves the newest release. Each release contains **every** script's current build, so one URL per script is stable for both installing and updating.

## Development

The toolchain (Node, pnpm, Biome, treefmt, prek, reuse) runs inside [devenv](https://devenv.sh):

```sh
git clone https://github.com/hnjae/userscripts.git
cd userscripts
devenv shell # installs dependencies and git hooks
```

Common commands:

| Command                                       | What it does                                    |
| --------------------------------------------- | ----------------------------------------------- |
| `devenv tasks run ci`                         | Full CI chain: typecheck → lint → build → hooks |
| `pnpm build`                                  | Build all userscripts                           |
| `pnpm --filter @userscripts/font-remap build` | Build a single userscript                       |
| `devenv shell -- treefmt`                     | Format everything                               |

Build output lands in `scripts/<name>/dist/<name>.user.js`.

### Layout

- `scripts/<name>/` — one package per userscript: `package.json` (its `version` is the userscript `@version`), `vite.config.ts`, `src/main.ts`
- `packages/` — shared libraries, added when first needed
- `docs/spec/` — user-facing behavior specs, one file per script

### Adding a userscript

1. Create `scripts/<name>/` with a `package.json` (`@userscripts/<name>`), a `vite.config.ts` with `build: { fileName: '<name>.user.js' }`, and `src/main.ts`.
2. Point `@updateURL` / `@downloadURL` at `https://github.com/hnjae/userscripts/releases/latest/download/<name>.user.js`.
3. Document the user-visible behavior in `docs/spec/<name>.md`.

See [`AGENTS.md`](AGENTS.md) for the full checklist.

### Releasing

Releases are fully automated by [`.github/workflows/release.yml`](.github/workflows/release.yml):

1. Bump the `version` in `scripts/<name>/package.json` and push to `main`.
2. The workflow builds all userscripts and publishes one snapshot release containing every script, tagging each released version as `<name>-v<semver>`.
3. Pushes without a version bump are no-ops.

> [!NOTE]
> A release is always a snapshot of all scripts, because `releases/latest/download/<name>.user.js` resolves within the single latest release only. A release missing any script's asset would break that script's install and update URLs.
