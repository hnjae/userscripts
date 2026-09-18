// SPDX-FileCopyrightText: 2026 KIM Hyunjae
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      build: {
        // Must match the release asset name; see AGENTS.md.
        fileName: "font-remap.user.js",
      },
      userscript: {
        name: "font-remap",
        namespace: "https://github.com/hnjae/userscripts",
        description:
          "Replace Korean system/web fonts with locally installed Pretendard.",
        license: "AGPL-3.0-or-later",
        match: ["*://*/*"],
        "run-at": "document-start",
        updateURL:
          "https://github.com/hnjae/userscripts/releases/latest/download/font-remap.user.js",
        downloadURL:
          "https://github.com/hnjae/userscripts/releases/latest/download/font-remap.user.js",
      },
    }),
  ],
});
