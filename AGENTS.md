# AGENTS.md

Personal monorepo of Violentmonkey userscripts (browser user scripts). License: AGPL-3.0-or-later with REUSE metadata.

## Layout

- One pnpm workspace package per userscript in `scripts/<name>/`: `package.json` + `vite.config.ts` (vite-plugin-monkey) + `src/main.ts`.
- Shared code goes in `packages/lib/` when first needed (already covered by the workspace glob).
- Toolchain is declared in `shell.nix` (nix-shell): node, pnpm, just, prek, biome, treefmt, cocogitto, typos, deadnix, statix, reuse. These tools are only on PATH inside the shell.
- Task recipes live in `justfile`; git hooks in `prek.toml`; formatters in `treefmt.toml`.

## Commands

Run everything inside `nix-shell` — linters/formatters are declared in `shell.nix`:

```sh
nix-shell --run 'just ci'      # full chain: typecheck -> lint -> build -> prek run --all-files
nix-shell --run 'pnpm -r build'                        # build all userscripts
nix-shell --run 'pnpm --filter @userscripts/<name> build'  # single script
nix-shell --run 'just format'  # format (biome/nixfmt/yamlfmt/rumdl/taplo)
```

Entering `nix-shell` runs `pnpm install` and `prek install --force` automatically. The CI chain does NOT run on entry — invoke it with `just ci`.

## Adding a userscript

1. Create `scripts/<name>/` with `package.json` (`name: @userscripts/<name>`; its `version` IS the userscript `@version`), `vite.config.ts`, `src/main.ts`.
2. `nix-shell --run 'pnpm --filter @userscripts/<name> add -D vite vite-plugin-monkey typescript'`
3. Set `build: { fileName: '<name>.user.js' }` in the monkey config — it must match the release asset name.
4. Auto-update contract: `@updateURL`/`@downloadURL` point to `https://github.com/hnjae/userscripts/releases/latest/download/<name>.user.js`; bump the package `version` to publish (see Releasing) and keep the asset filename identical.

## Releasing

Releases are automated by `.github/workflows/release.yml` on every push to `main` (manual trigger: `gh workflow run release`).

- A userscript is released exactly when its `scripts/<name>/package.json` `version` has no matching `<name>-v<semver>` tag; pushes without a version bump are no-ops.
- Each run publishes one snapshot release containing **every** userscript's `dist/<name>.user.js` and tags every released version. This is required by the install/auto-update contract: `releases/latest/download/<name>.user.js` resolves inside the single latest release only, so a release missing any script's asset would 404 for that script.
- Release notes list each script's version and the commits touching `scripts/<name>/` since its previous tag.

## Gotchas

- `prek install --force` writes `.git/hooks`; the hook commands come from `prek.toml` and resolve tools from the shell's PATH, so commit from inside `nix-shell`.
- reuse lint scans nested gitignored dirs (Git `--no-empty-directory` bug drops them from `git ls-files --ignored --others --directory`). The `**/node_modules/**` and `**/dist/**` annotations in REUSE.toml are the workaround — keep them.
- Every tracked file needs an SPDX header or REUSE.toml coverage. JSON files cannot carry comments — cover them in REUSE.toml instead.
- treefmt's root marker is `treefmt.toml` at the repository root.
- treefmt runs `biome format --write` from the repository root, so `biome.json` is the single source of truth for Biome's formatter, VCS ignore handling, and linter config.
- biome.json is biome 2.5 schema: `vcs.clientKind` (not `client`), `linter.rules.preset` (not `recommended`).
- Commit messages must pass `cog verify` (conventional commits, enforced by the commit-msg hook).
