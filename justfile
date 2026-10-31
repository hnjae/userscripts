# SPDX-FileCopyrightText: 2026 KIM Hyunjae
# SPDX-License-Identifier: AGPL-3.0-or-later

# Local CI chain, mirroring what a pull request must pass.
ci: typecheck lint build hooks

typecheck:
    bun run --filter '*' typecheck

lint:
    biome check .

build:
    bun run --filter '*' build

hooks:
    prek run --all-files

# Format the whole tree with the formatters declared in treefmt.toml.
format:
    treefmt
