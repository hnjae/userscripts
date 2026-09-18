<!-- SPDX-FileCopyrightText: 2026 KIM Hyunjae -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# font-remap

Replace a fixed set of sans font families — Korean, Latin, and system UI — with Pretendard, and a fixed set of monospace families with Sarasa Gothic K, on every website.

Neither replacement font is distributed with the script. Both must be installed on the machine running the browser; with the Pretendard Variable edition installed every sans weight renders with true strokes, otherwise the browser synthesizes them from the installed static cut.

## Replaced sans family names

Text whose font stack names any of these families renders in Pretendard:

- Noto Sans KR: `Noto Sans KR`, `NotoSansKR`, `Noto Sans Korean`, `본고딕`
- Nanum Gothic: `Nanum Gothic`, `NanumGothic`, `나눔고딕`, `NanumGothicWebFont`
- Apple SD Gothic Neo: `Apple SD Gothic Neo`, `AppleSDGothicNeo`, `애플 SD 산돌고딕 Neo`, `애플 SD 산돌고딕 네오`
- 맑은 고딕: `Malgun Gothic`, `MalgunGothic`, `맑은 고딕`
- 돋움: `Dotum`, `돋움`
- Noto Sans: `Noto Sans`
- Inter: `Inter`
- San Francisco: `San Francisco`, `SF Pro`, `SF Pro Text`, `SF Pro Display`
- Helvetica: `Helvetica`, `Helvetica Neue`
- Arial: `Arial`
- Segoe UI: `Segoe UI`, `Segoe UI Variable`
- Roboto: `Roboto`
- Liberation Sans: `Liberation Sans`

## Replaced monospace family names

Text whose font stack names any of these families renders in Sarasa Gothic K:

- Editor and web fonts: `GitLab Mono`, `Fira Code`, `Fira Mono`, `JetBrains Mono`, `Cascadia Mono`, `Monospace Neon`
- Apple: `SF Mono`, `SFMono Regular`, `Menlo`, `Monaco`
- Windows: `Consolas`, `Segoe UI Mono`, `Courier New`
- Linux: `DejaVu Sans Mono`, `Ubuntu Mono`, `Liberation Mono`, `Noto Mono`
- Korean and CJK coding fonts: `D2Coding`, `NanumGothicCoding`, `Noto Sans Mono`, `Noto Sans Mono CJK KR`

Family name matching follows CSS semantics: names match exactly and ASCII case-insensitively, so derived names such as `Arial Narrow` or `Roboto Mono` are untouched.

`-apple-system`, `system-ui`, and the `monospace` generic keyword are CSS keywords rather than family names; the fonts they resolve to are not replaced.

## Behavior

- Replacement applies to every website, in the top document and in iframes.
- A target family is replaced whether the site uses it as a locally installed font or declares it as a webfont. All of its weights render in the replacement font; sans italics render with Pretendard glyphs and a synthesized slant, and monospace italics use the matching italic styles Sarasa Gothic K publishes.
- Replacement is in effect before the page renders text, including when the site registers its webfonts after the document has started loading.
- Text inside shadow DOM is replaced as well.
- Font stacks that name none of the replaced families are untouched; icon fonts and other site typography are unaffected.
- The monospace replacement, Sarasa Gothic K, is proportional rather than monospaced, so page content laid out against the replaced fonts' shared character grid, such as ASCII diagrams or web terminals, loses column alignment and may reflow.
- Characters Pretendard does not cover, such as CJK ideographs, Cyrillic, or Greek, fall through the site's remaining font stack.
- Without a replacement font installed, its affected sites render exactly as they would without the script.
