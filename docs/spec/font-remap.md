<!-- SPDX-FileCopyrightText: 2026 KIM Hyunjae -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# font-remap

Replace a fixed set of Korean fonts with Pretendard on every website.

Pretendard itself is not distributed with the script. It must be installed on the machine running the browser; with the Variable edition installed every weight renders with true strokes, otherwise the browser synthesizes them from the installed static cut.

## Replaced family names

Text whose font stack names any of these families renders in Pretendard:

- Noto Sans KR: `Noto Sans KR`, `NotoSansKR`, `Noto Sans Korean`, `본고딕`
- Nanum Gothic: `Nanum Gothic`, `NanumGothic`, `나눔고딕`
- Apple SD Gothic Neo: `Apple SD Gothic Neo`, `AppleSDGothicNeo`, `애플 SD 산돌고딕 Neo`, `애플 SD 산돌고딕 네오`
- 맑은 고딕: `Malgun Gothic`, `MalgunGothic`, `맑은 고딕`

Family name matching ignores ASCII case, matching CSS semantics.

## Behavior

- Replacement applies to every website, in the top document and in iframes.
- A target family is replaced whether the site uses it as a locally installed font or declares it as a webfont. All of its weights render in Pretendard; italic text renders with Pretendard glyphs and a synthesized slant.
- Replacement is in effect before the page renders text, including when the site registers its webfonts after the document has started loading.
- Text inside shadow DOM is replaced as well.
- Font stacks that name none of the replaced families are untouched; icon fonts and other site typography are unaffected.
- Without Pretendard installed, affected sites render exactly as they would without the script.
