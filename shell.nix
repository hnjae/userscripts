# SPDX-FileCopyrightText: 2026 KIM Hyunjae
# SPDX-License-Identifier: AGPL-3.0-or-later

let
  nixpkgs = fetchTarball "https://flakehub.com/f/DeterminateSystems/nixpkgs-weekly/0.1";
  pkgs = import nixpkgs {
    config = { };
    overlays = [ ];
  };
in
pkgs.mkShellNoCc {
  packages = with pkgs; [
    # JavaScript toolchain. Bun installs dependencies and runs workspace
    # scripts; Node stays for Vite, which only supports the Node runtime.
    bun
    nodejs

    # Task runner and git hook manager
    just
    prek

    # Git hooks (prek.toml)
    cocogitto
    deadnix
    editorconfig-checker
    statix
    typos

    # Formatters (treefmt.toml)
    biome
    nixfmt
    rumdl
    taplo
    treefmt
    yamlfmt

    # License metadata
    reuse
  ];

  shellHook = ''
    bun install
    # --force replaces hook shims left behind by other managers (for example
    # the pre-commit shims devenv installed before this repo moved to prek).
    prek install --force
  '';
}
