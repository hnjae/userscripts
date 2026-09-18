<!-- SPDX-FileCopyrightText: 2026 KIM Hyunjae -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# font-remap

Replace a fixed set of Korean, Latin, and system UI fonts with Pretendard on every website.

Pretendard itself is not distributed with the script. It must be installed on the machine running the browser; with the Variable edition installed every weight renders with true strokes, otherwise the browser synthesizes them from the installed static cut.

## Replaced family names

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

Family name matching follows CSS semantics: names match exactly and ASCII case-insensitively, so derived names such as `Arial Narrow` or `Roboto Mono` are untouched.

`-apple-system` and `system-ui` are CSS keywords rather than family names; the system fonts they resolve to are not replaced.

## Behavior

- Replacement applies to every website, in the top document and in iframes.
- A target family is replaced whether the site uses it as a locally installed font or declares it as a webfont. All of its weights render in Pretendard; italic text renders with Pretendard glyphs and a synthesized slant.
- Replacement is in effect before the page renders text, including when the site registers its webfonts after the document has started loading.
- Text inside shadow DOM is replaced as well.
- Font stacks that name none of the replaced families are untouched; icon fonts and other site typography are unaffected.
- Characters Pretendard does not cover, such as CJK ideographs, Cyrillic, or Greek, fall through the site's remaining font stack.
- Without Pretendard installed, affected sites render exactly as they would without the script.
