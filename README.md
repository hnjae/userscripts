# userscripts

<div align="center">

*Personal Violentmonkey userscripts, built with Vite and shipped through GitHub Releases*

[![Release](https://github.com/hnjae/userscripts/actions/workflows/release.yml/badge.svg)](https://github.com/hnjae/userscripts/actions/workflows/release.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue?style=flat-square)](LICENSE)

[Scripts](#scripts) · [Installation](#installation) · [Development](#development)

</div>

A personal monorepo of browser userscripts written for [Violentmonkey](https://violentmonkey.github.io/). Each script lives in its own bun workspace package, is built with [vite-plugin-monkey](https://github.com/vite-plugin/vite-plugin-monkey), and is published automatically as a GitHub release — installs and updates always resolve to the same stable URL.

## Scripts

| Script | Description | Install |
| --------------------------------- | ------------------------------------------------------------------------------------------- | -----------------------------------------------------------------------------------------------------: |
| [font-remap](scripts/font-remap/) | Ignore site fonts and use the operating system's default UI, sans, serif, and monospace fonts | [font-remap.user.js](https://github.com/hnjae/userscripts/releases/latest/download/font-remap.user.js) |

### font-remap

Ignores the sans, serif, and monospace families a site asks for — Noto Sans KR, Nanum Gothic, Malgun Gothic, Roboto, Segoe UI, Inter, Arial, Helvetica, Dotum, Times New Roman, Georgia, Batang, Nanum Myeongjo, Hack, Roboto Mono, Consolas, SF Mono, Menlo, and more — and renders that text in the operating system's default fonts: `system-ui, ui-sans-serif, sans-serif` for system UI families, `ui-sans-serif, sans-serif` for older sans faces such as Arial, Helvetica, and Dotum, `ui-serif, serif` for serif faces, and `ui-monospace, monospace` for monospace text.

- Each reader sees their own system fonts; the script ships no font data and needs nothing installed.
- Rewriting wins over the site's stylesheets, including cross-origin ones, and over inline styles it sets later.
- It reaches iframes and open shadow roots, applies before first paint, and keeps working for content added after load.
- Families outside the four lists — icon fonts, cursive text, site-specific fallbacks — keep their place in the stack.
- Monospace replacement changes character advance widths, so metric-sensitive content (ASCII diagrams, web terminals) may reflow.

The full behavior contract is specified in [`docs/spec/font-remap.md`](docs/spec/font-remap.md).

## Installation

1. Install the [Violentmonkey](https://violentmonkey.github.io/) extension (any userscript manager works; the scripts use plain DOM APIs only).
2. Click an install link above and confirm the installation prompt.
3. Done — scripts keep themselves up to date.

Every script points its `@updateURL` and `@downloadURL` at `releases/latest/download/<name>.user.js`, which always serves the newest release. Each release contains **every** script's current build, so one URL per script is stable for both installing and updating.

## Development

The toolchain (Bun, Node, Biome, treefmt, prek, reuse) is declared in `shell.nix` and provided by `nix-shell`:

```sh
git clone https://github.com/hnjae/userscripts.git
cd userscripts
nix-shell # installs dependencies and git hooks
```

Common commands (run them inside the shell, or prefix them with `nix-shell --run`):

| Command | What it does |
| --------------------------------------------- | ----------------------------------------------- |
| `just ci` | Full CI chain: typecheck → lint → build → hooks |
| `bun run --filter '*' build` | Build all userscripts |
| `bun run --filter @userscripts/font-remap build` | Build a single userscript |
| `just format` | Format everything |

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
