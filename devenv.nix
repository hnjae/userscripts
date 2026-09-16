# SPDX-FileCopyrightText: 2026 KIM Hyunjae
# SPDX-License-Identifier: AGPL-3.0-or-later

{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  packages = with pkgs; [
    biome

    # Configured in treefmt:
    nixfmt
    rumdl
    yamlfmt
  ];

  treefmt.enable = true;
  treefmt.config = {
    projectRootFile = "devenv.yaml";
    settings.excludes = [
      "*.lock"
      "pnpm-lock.yaml"
    ];
    programs = {
      biome = {
        enable = true;

        # treefmt-nix validates against a pinned old Biome schema (2.1.2)
        # that does not know keys from the Biome we actually run (2.5.x).
        # Biome validates its own config at runtime, so skip it here.
        validate.enable = false;

        # treefmt-nix generates its own Biome config from this option and
        # never reads the repository's biome.json — feed it the formatter
        # section of the same file so that `treefmt` and direct `biome`
        # runs format identically. The `vcs` section must stay out: Biome
        # resolves the ignore file relative to the config file's directory,
        # and the generated config lives in the Nix store.
        formatCommand = "format";
        settings.formatter = (builtins.fromJSON (builtins.readFile ./biome.json)).formatter or { };
      };
      nixfmt.enable = true;
      rumdl-format.enable = true;
      yamlfmt.enable = true;
    };
  };

  # https://devenv.sh/git-hooks/
  git-hooks = {
    package = pkgs.prek;
    excludes = [ ".*\\.lock$" ];
    hooks = {
      # Static checkers
      detect-private-keys.enable = true;
      cocogitto = {
        enable = true;
        name = "cog verify";
        description = "Lint commit messages with Cocogitto.";
        package = pkgs.cocogitto;
        entry = "${lib.getExe pkgs.cocogitto} verify --file";
        stages = [ "commit-msg" ];
      };
      typos.enable = true;

      # Formatter check
      treefmt.enable = true;

      # Miscellaneous Checkers/Linters:
      deadnix.enable = true;
      statix.enable = true;
      rumdl.enable = true;
      reuse = {
        enable = true;
        name = "reuse lint";
        description = "Check REUSE license metadata.";
        package = pkgs.reuse;
        entry = "${lib.getExe pkgs.reuse} lint";
        always_run = true;
        pass_filenames = false;
      };
    };
  };

  # https://devenv.sh/tasks/
  tasks = {
    "ci:typecheck" = {
      exec = "pnpm -r typecheck";
    };

    "ci:lint" = {
      exec = "biome check .";
      after = [ "ci:typecheck@succeeded" ];
    };

    "ci:build" = {
      exec = "pnpm -r build";
      after = [ "ci:lint@succeeded" ];
    };

    "ci:git-hooks" = {
      exec = "${lib.getExe config.git-hooks.package} run --all-files";
      after = [ "ci:build@succeeded" ];
    };
  };
}
