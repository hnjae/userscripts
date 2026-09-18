// SPDX-FileCopyrightText: 2026 KIM Hyunjae
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Remap a fixed set of Korean font family names to locally installed
 * Pretendard.
 *
 * Each target name gets one @font-face rule per weight plus a broad italic
 * rule, all whose src resolve only to a local Pretendard installation.
 * Font-family declarations are never rewritten, so icon fonts and site
 * fallback chains stay intact, and the replacement reaches shadow DOM
 * automatically because font faces are matched at the document level.
 *
 * For overlapping unicode ranges the last defined @font-face rule is checked
 * first (CSS Fonts 4), so the style element is kept as the last child of
 * head: webfont faces the site registers later in the document would
 * otherwise win the tie and leak through on the characters their subsets
 * cover.
 */

const STYLE_ELEMENT_ID = "font-remap";

const REPLACEMENT = "Pretendard";

// Font family name matching ignores ASCII case, so entries must be genuinely
// distinct names rather than case variants.
const TARGET_FAMILIES = [
  "Noto Sans KR",
  "NotoSansKR",
  "Noto Sans Korean",
  "본고딕",
  "Nanum Gothic",
  "NanumGothic",
  "나눔고딕",
  "Apple SD Gothic Neo",
  "AppleSDGothicNeo",
  "애플 SD 산돌고딕 Neo",
  "애플 SD 산돌고딕 네오",
  "Malgun Gothic",
  "MalgunGothic",
  "맑은 고딕",
] as const;

// local() matches full font names, not family names, and the static edition
// of Pretendard ships one full name per weight. One face per weight gives
// static installs true strokes; listing the Variable face first in every src
// lets Variable installs resolve every weight from a single source.
const WEIGHT_STATIC_NAMES = [
  [100, "Thin"],
  [200, "ExtraLight"],
  [300, "Light"],
  [400, "Regular"],
  [500, "Medium"],
  [600, "SemiBold"],
  [700, "Bold"],
  [800, "ExtraBold"],
  [900, "Black"],
] as const;

function replacementCss(family: string): string {
  const faces = WEIGHT_STATIC_NAMES.map(
    ([weight, staticName]) =>
      `@font-face {
	font-family: "${family}";
	src: local("${REPLACEMENT} Variable"), local("${REPLACEMENT} ${staticName}");
	font-weight: ${weight};
	font-style: normal;
}`,
  );
  // Pretendard ships no italic; this face keeps italic text in Pretendard
  // with a synthesized slant instead of leaking the site's italic webfont.
  faces.push(`@font-face {
	font-family: "${family}";
	src: local("${REPLACEMENT} Variable"), local("${REPLACEMENT} Regular");
	font-weight: 100 900;
	font-style: italic;
}`);
  return faces.join("\n");
}

/**
 * Keep `style` as the last child of head. Re-inserting the element makes the
 * browser re-resolve its rules as the newest definitions, so webfonts the
 * site registers later lose the unicode-range tie again.
 */
function keepLast(style: HTMLStyleElement): void {
  const moveToEnd = () => {
    const head = document.head;
    if (
      head &&
      (style.parentNode !== head || head.lastElementChild !== style)
    ) {
      head.append(style);
    }
  };

  new MutationObserver(moveToEnd).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  moveToEnd();
}

const style = document.createElement("style");
style.id = STYLE_ELEMENT_ID;
style.textContent = TARGET_FAMILIES.map(replacementCss).join("\n");
keepLast(style);
