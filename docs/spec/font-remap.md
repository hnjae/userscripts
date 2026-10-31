<!-- SPDX-FileCopyrightText: 2026 KIM Hyunjae -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# font-remap

Ignore the font families a site specifies and render text in the operating system's default fonts: the system UI font or the system sans font for sans text, the system serif font for serif text, and the system monospace font for monospace text. Two readers on different systems see different fonts, because rendering follows each system's own font preferences.

Nothing is bundled with the script and no font needs to be installed.

## Replaced sans family names

Any element whose font stack names one of these families renders in the system UI font, `system-ui, ui-sans-serif, sans-serif`:

- Noto Sans KR: `Noto Sans KR`, `NotoSansKR`, `Noto Sans Korean`, `본고딕`
- Nanum Gothic: `Nanum Gothic`, `NanumGothic`, `나눔고딕`, `NanumGothicWebFont`
- Nanum Barun Gothic: `NanumBarunGothic`
- Apple SD Gothic Neo: `Apple SD Gothic Neo`, `AppleSDGothicNeo`, `애플 SD 산돌고딕 Neo`, `애플 SD 산돌고딕 네오`
- 맑은 고딕: `Malgun Gothic`, `MalgunGothic`, `맑은 고딕`
- Noto Sans: `Noto Sans`
- San Francisco: `San Francisco`, `SF Pro`, `SF Pro Text`, `SF Pro Display`
- Segoe UI: `Segoe UI`, `Segoe UI Variable`, `Segoe UI Adjusted`
- Roboto: `Roboto`

Any element whose font stack names one of these instead renders in the system sans font, `ui-sans-serif, sans-serif`:

- Inter: `Inter`
- Arial: `Arial`
- Helvetica: `Helvetica`, `Helvetica Neue`
- 돋움: `Dotum`, `돋움`
- Liberation Sans: `Liberation Sans`

## Replaced serif family names

Text whose font stack names any of these families renders in the system serif font, `ui-serif, serif`:

- Korean: `Batang`, `바탕`, `BatangChe`, `AppleMyungjo`, `애플명조`, `Nanum Myeongjo`, `NanumMyeongjo`, `나눔명조`, `Noto Serif KR`, `NotoSerifKR`, `본명조`
- Latin: `Times New Roman`, `Times`, `New York`, `Georgia`, `Liberation Serif`, `DejaVu Serif`, `Noto Serif`

## Replaced monospace family names

Text whose font stack names any of these families renders in the system monospace font, `ui-monospace, monospace`:

- Named code faces: `Hack`, `Roboto Mono`
- Apple: `SF Mono`, `SFMono Regular`, `Menlo`, `Monaco`
- Windows: `Consolas`, `Segoe UI Mono`, `Courier New`
- Linux: `DejaVu Sans Mono`, `Ubuntu Mono`, `Liberation Mono`, `Noto Mono`
- Korean and CJK coding fonts: `Noto Sans Mono`

## Stack rewriting

- A stack resolves by the first replaced family it names. That family's list picks the chain: `system-ui, ui-sans-serif, sans-serif` for the system UI list, `ui-sans-serif, sans-serif` for the system sans list, `ui-serif, serif` for the serif list, and `ui-monospace, monospace` for the monospace list.
- Replaced family names and generic keywords are dropped from the stack. Families matching no list keep their order, so icon fonts and site-specific fallbacks still resolve.
- Stacks that name no replaced family — cursive, icon-font-only — are left alone. So are family names derived from a target, such as `Arial Narrow` or `Roboto Slab`, because names match exactly and ASCII case-insensitively.

## Behavior

- Replacement applies to every website, in the top document and in iframes.
- It is in effect before the page renders text, and is re-applied when the site adds content, changes class names, or writes inline styles.
- It wins over author stylesheets, including cross-origin ones whose rules a script cannot read, and over inline styles the site sets later.
- Text inside open shadow roots is replaced; closed shadow roots are out of reach.
- Font stacks that name none of the replaced families are untouched, so icon fonts, cursive text, and other site typography render as the site intends.
- Monospace replacement changes character advance widths, so metric-sensitive content, such as ASCII diagrams or web terminals, may reflow.
- Characters the system font does not cover fall through to the rest of the rewritten stack.
