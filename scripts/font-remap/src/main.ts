// SPDX-FileCopyrightText: 2026 KIM Hyunjae
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Remap fixed sets of sans and monospace font family names to locally
 * installed replacements: Korean, Latin, and system UI sans families to
 * Pretendard, and monospace families to Sarasa Gothic K.
 *
 * Each target name gets one @font-face rule per available style, all whose
 * src resolve only to a local installation of the replacement font.
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

// Font family name matching ignores ASCII case, so entries must be genuinely
// distinct names rather than case variants.
const TARGET_SANS_FAMILIES = [
  // Korean.
  "Noto Sans KR",
  "NotoSansKR",
  "Noto Sans Korean",
  "본고딕",
  "Nanum Gothic",
  "NanumGothic",
  "나눔고딕",
  "NanumGothicWebFont",
  "NanumBarunGothic",
  "Apple SD Gothic Neo",
  "AppleSDGothicNeo",
  "애플 SD 산돌고딕 Neo",
  "애플 SD 산돌고딕 네오",
  "Malgun Gothic",
  "MalgunGothic",
  "맑은 고딕",
  "Dotum",
  "돋움",
  // Latin and system UI.
  "Noto Sans",
  "Inter",
  "GitLab Sans",
  "San Francisco",
  "SF Pro",
  "SF Pro Text",
  "SF Pro Display",
  "Helvetica",
  "Helvetica Neue",
  "Arial",
  "Segoe UI",
  "Segoe UI Variable",
  "Segoe UI Adjusted",
  "Roboto",
  "Liberation Sans",
] as const;

const TARGET_MONO_FAMILIES = [
  // Editor and web fonts.
  "GitLab Mono",
  "Fira Code",
  "Fira Mono",
  "JetBrains Mono",
  "Cascadia Mono",
  "Monospace Neon",
  // Apple.
  "SF Mono",
  "SFMono Regular",
  "Menlo",
  "Monaco",
  // Windows.
  "Consolas",
  "Segoe UI Mono",
  "Courier New",
  // Linux.
  "DejaVu Sans Mono",
  "Liberation Mono",
  "Noto Mono",
  "Roboto Mono",
  "Ubuntu Mono",
  // Korean and CJK coding fonts.
  "D2Coding",
  "NanumGothicCoding",
  "Noto Sans Mono",
  "Noto Sans Mono CJK KR",
] as const;

/**
 * One @font-face rule per entry: `weight` is the CSS font-weight range the
 * face claims and `locals` are the local() full names tried in order.
 */
interface FaceSpec {
  readonly weight: string;
  readonly style: "normal" | "italic";
  readonly locals: readonly string[];
}

// local() matches full font names, not family names, and the static edition
// of Pretendard ships one full name per weight.
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

// One face per weight gives static installs true strokes; listing the
// Variable face first in every src lets Variable installs resolve every
// weight from a single source.
const PRETENDARD_FACES: FaceSpec[] = [
  ...WEIGHT_STATIC_NAMES.map(
    ([weight, staticName]): FaceSpec => ({
      weight: String(weight),
      style: "normal",
      locals: ["Pretendard Variable", `Pretendard ${staticName}`],
    }),
  ),
  // Pretendard ships no italic; this face keeps italic text in Pretendard
  // with a synthesized slant instead of leaking the site's italic webfont.
  {
    weight: "100 900",
    style: "italic",
    locals: ["Pretendard Variable", "Pretendard Regular"],
  },
];

// Sarasa Gothic K ships no variable edition, so each face resolves to the
// static full name of a weight it publishes; weights it does not publish
// fall to the nearest declared face. Italics exist and get their own faces.
const SARASA_GOTHIC_K_FACES: FaceSpec[] = [
  { weight: "200", style: "normal", locals: ["Sarasa Gothic K XLight"] },
  { weight: "300", style: "normal", locals: ["Sarasa Gothic K Light"] },
  { weight: "400", style: "normal", locals: ["Sarasa Gothic K"] },
  { weight: "600", style: "normal", locals: ["Sarasa Gothic K SemiBold"] },
  { weight: "700", style: "normal", locals: ["Sarasa Gothic K Bold"] },
  { weight: "200", style: "italic", locals: ["Sarasa Gothic K XLight Italic"] },
  { weight: "300", style: "italic", locals: ["Sarasa Gothic K Light Italic"] },
  { weight: "400", style: "italic", locals: ["Sarasa Gothic K Italic"] },
  {
    weight: "600",
    style: "italic",
    locals: ["Sarasa Gothic K SemiBold Italic"],
  },
  { weight: "700", style: "italic", locals: ["Sarasa Gothic K Bold Italic"] },
];

function replacementCss(family: string, faces: readonly FaceSpec[]): string {
  return faces
    .map(
      (face) => `@font-face {
	font-family: "${family}";
	src: ${face.locals.map((name) => `local("${name}")`).join(", ")};
	font-weight: ${face.weight};
	font-style: ${face.style};
}`,
    )
    .join("\n");
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
style.textContent = [
  ...TARGET_SANS_FAMILIES.map((family) =>
    replacementCss(family, PRETENDARD_FACES),
  ),
  ...TARGET_MONO_FAMILIES.map((family) =>
    replacementCss(family, SARASA_GOTHIC_K_FACES),
  ),
].join("\n");
keepLast(style);
