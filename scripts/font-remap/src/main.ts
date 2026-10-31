// SPDX-FileCopyrightText: 2026 KIM Hyunjae
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Ignore the font families a site specifies and render text in the operating
 * system's default fonts: the system UI font for system UI families, the
 * system sans font for families the user mapped there, the system serif font
 * for serif families, and the system monospace font for monospace families.
 *
 * The lists below decide which chain a stack resolves to. For every element
 * whose computed stack names one of those families, the stack is rewritten in
 * place: target families and generic keywords are dropped, families matching
 * no list (icon fonts, site-specific fallbacks) keep their position, and the
 * chain for the detected kind is appended.
 *
 * The rewrite is an inline `font-family` declaration marked `!important`, which
 * is why it wins over author stylesheets even when their rules cannot be read
 * (cross-origin sheets) and over inline styles the site sets later. A
 * MutationObserver re-applies it to content added after the initial scan, and
 * open shadow roots are walked explicitly because document queries do not
 * reach into them.
 */

const SYSTEM_CHAIN = "system-ui, ui-sans-serif, sans-serif";
const SANS_CHAIN = "ui-sans-serif, sans-serif";
const SERIF_CHAIN = "ui-serif, serif";
const MONO_CHAIN = "ui-monospace, monospace";

// Families that resolve through the user's font settings rather than through a
// name the site picked; they are dropped when the chain is rebuilt.
const GENERIC_FAMILIES = new Set([
  "-apple-system",
  "blinkmacsystemfont",
  "cursive",
  "fantasy",
  "fangsong",
  "math",
  "monospace",
  "sans-serif",
  "serif",
  "system-ui",
  "ui-monospace",
  "ui-rounded",
  "ui-sans-serif",
  "ui-serif",
]);

// Family name matching ignores ASCII case, so entries must be genuinely
// distinct names rather than case variants.
const SYSTEM_FAMILIES = [
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
  // Latin and system UI.
  "Noto Sans",
  "San Francisco",
  "SF Pro",
  "SF Pro Text",
  "SF Pro Display",
  "Segoe UI",
  "Segoe UI Variable",
  "Segoe UI Adjusted",
  "Roboto",
] as const;

// Old and generic sans faces that should land on the system's sans default
// rather than on its UI font.
const SANS_FAMILIES = [
  "Arial",
  "Dotum",
  "돋움",
  "Inter",
  "Liberation Sans",
] as const;

// Serif faces: the default serif of each platform, plus the legacy families
// sites still name explicitly.
const SERIF_FAMILIES = [
  // Korean.
  "Batang",
  "바탕",
  "BatangChe",
  "AppleMyungjo",
  "애플명조",
  "Nanum Myeongjo",
  "NanumMyeongjo",
  "나눔명조",
  "Noto Serif KR",
  "NotoSerifKR",
  "본명조",
  // Latin.
  "Times New Roman",
  "Times",
  "New York",
  "Georgia",
  "Liberation Serif",
  "DejaVu Serif",
  "Noto Serif",
] as const;

const MONO_FAMILIES = [
  // Android.
  "Roboto Mono",
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
  "Hack",
  "DejaVu Sans Mono",
  "Ubuntu Mono",
  "Liberation Mono",
  "Noto Mono",
  "Noto Sans Mono",
] as const;

type Kind = "mono" | "sans" | "serif" | "system";

const normalized = (name: string) => name.trim().toLowerCase();

const TARGET_KINDS = new Map<string, Kind>([
  ...SYSTEM_FAMILIES.map((name): [string, Kind] => [
    normalized(name),
    "system",
  ]),
  ...SANS_FAMILIES.map((name): [string, Kind] => [normalized(name), "sans"]),
  ...SERIF_FAMILIES.map((name): [string, Kind] => [normalized(name), "serif"]),
  ...MONO_FAMILIES.map((name): [string, Kind] => [normalized(name), "mono"]),
]);

/** Split a computed `font-family` value into family names. */
function splitStack(value: string): string[] {
  const families: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (const character of value) {
    if (quote !== null) {
      current += character;
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === ",") {
      families.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  families.push(current);

  return families.map((family) => family.trim()).filter((family) => family);
}

const unquoted = (family: string) => family.replace(/^["']|["']$/g, "");

/**
 * Rewrite one computed stack, or return null when it names no target family.
 */
function replacementFor(stack: string): string | null {
  let kind: Kind | null = null;
  const kept: string[] = [];

  for (const family of splitStack(stack)) {
    const name = normalized(unquoted(family));
    const target = TARGET_KINDS.get(name);
    if (target !== undefined) {
      kind ??= target;
    } else if (!GENERIC_FAMILIES.has(name)) {
      kept.push(family);
    }
  }

  if (kind === null) return null;

  const chain =
    kind === "mono"
      ? MONO_CHAIN
      : kind === "sans"
        ? SANS_CHAIN
        : kind === "serif"
          ? SERIF_CHAIN
          : SYSTEM_CHAIN;
  return kept.length === 0 ? chain : `${kept.join(", ")}, ${chain}`;
}

/**
 * What this script last wrote to an element: the chain it applied, the site's
 * own inline declaration that the chain replaced, and the whole `style`
 * attribute produced. The attribute tells our own write apart from the site's
 * so an observed mutation cannot re-enter; the site's declaration is restored
 * before every re-read so a later class or inline change is seen.
 */
interface Applied {
  readonly attribute: string;
  readonly chain: string;
  readonly sitePriority: string;
  readonly siteValue: string;
}

const applied = new WeakMap<Element, Applied>();

function setFamily(
  style: CSSStyleDeclaration,
  value: string,
  priority: string,
): void {
  if (value === "") {
    style.removeProperty("font-family");
    return;
  }
  style.setProperty("font-family", value, priority);
}

function applyTo(element: Element): void {
  const style = (element as HTMLElement | SVGElement).style;
  if (!style) return;

  const previous = applied.get(element);
  const currentValue = style.getPropertyValue("font-family");
  const currentPriority = style.getPropertyPriority("font-family");

  // Our declaration hides the value the site now wants, so undo it before
  // reading. Without this, a site that reclassifies an element, say to a
  // monospace face, would keep rendering the chain resolved earlier.
  const siteValue =
    previous && currentValue === previous.chain
      ? previous.siteValue
      : currentValue;
  const sitePriority =
    previous && currentValue === previous.chain
      ? previous.sitePriority
      : currentPriority;
  setFamily(style, siteValue, sitePriority);

  const replacement = replacementFor(getComputedStyle(element).fontFamily);
  if (replacement === null) {
    applied.delete(element);
    return;
  }

  setFamily(style, replacement, "important");
  applied.set(element, {
    attribute: element.getAttribute("style") ?? "",
    chain: replacement,
    sitePriority,
    siteValue,
  });
}

const OBSERVE_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  // Fonts change through the style attribute, or through a class the site
  // toggles; other attributes cannot affect them.
  attributeFilter: ["class", "style"],
};

const observer = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === "attributes") {
      const target = record.target;
      if (!(target instanceof Element)) continue;
      // Writing our own declaration queues a style record; ignore it. Class
      // changes always come from the site, even while our declaration stands.
      if (
        record.attributeName === "style" &&
        applied.get(target)?.attribute === target.getAttribute("style")
      ) {
        continue;
      }
      applyTo(target);
      continue;
    }
    for (const node of record.addedNodes) {
      if (node instanceof Element) scanTree(node);
    }
  }
});

const observed = new WeakSet<Node>();

function observe(root: Node): void {
  if (observed.has(root)) return;
  observed.add(root);
  observer.observe(root, OBSERVE_OPTIONS);
}

function scanTree(root: ParentNode): void {
  if (root instanceof Element) applyTo(root);

  for (const element of root.querySelectorAll("*")) {
    applyTo(element);
    const shadow = element.shadowRoot;
    if (shadow) {
      observe(shadow);
      scanTree(shadow);
    }
  }
}

// Document queries and the document observer stop at shadow boundaries, so
// roots created after load need their own observer.
const nativeAttachShadow = Element.prototype.attachShadow;
Element.prototype.attachShadow = function attachShadow(
  this: Element,
  init: ShadowRootInit,
): ShadowRoot {
  const root = nativeAttachShadow.call(this, init);
  if (init.mode === "open") {
    observe(root);
    scanTree(root);
  }
  return root;
};

observe(document);
scanTree(document);
