"use client";

function normalizeLineEndings(value: string) {
  return value.replaceAll("\r\n", "\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hasHtmlMarkup(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function renderInlineBreaks(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

export function linkedinTextToHtml(value: string) {
  const normalizedValue = normalizeLineEndings(value).trim();

  if (!normalizedValue) {
    return "<p></p>";
  }

  const blocks = normalizedValue.split(/\n{2,}/).map((block) => block.trim());
  const htmlBlocks = blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trimEnd());
    const bulletMatches = lines.map((line) => /^[-*]\s+(.*)$/.exec(line));

    if (bulletMatches.every(Boolean)) {
      const bulletLines = bulletMatches as RegExpExecArray[];

      return `<ul>${bulletMatches
        .map(
          (_, index) =>
            `<li><p>${renderInlineBreaks(bulletLines[index][1])}</p></li>`,
        )
        .join("")}</ul>`;
    }

    const orderedMatches = lines.map((line) => /^(\d+)\.\s+(.*)$/.exec(line));

    if (orderedMatches.every(Boolean)) {
      const orderedLines = orderedMatches as RegExpExecArray[];
      const start = Number.parseInt(orderedLines[0][1], 10);
      const startAttribute = start > 1 ? ` start="${start}"` : "";

      return `<ol${startAttribute}>${orderedMatches
        .map(
          (_, index) =>
            `<li><p>${renderInlineBreaks(orderedLines[index][2])}</p></li>`,
        )
        .join("")}</ol>`;
    }

    return `<p>${renderInlineBreaks(lines.join("\n"))}</p>`;
  });

  return htmlBlocks.join("");
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function serializeHtmlNodeToText(
  node: Node,
  context: {
    listType?: "bullet" | "ordered";
    index?: number;
    depth?: number;
  } = {},
): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  if (node.tagName === "UL") {
    return Array.from(node.children)
      .map((child) =>
        serializeHtmlNodeToText(child, {
          listType: "bullet",
          depth: context.depth ?? 0,
        }),
      )
      .filter(Boolean)
      .join("\n");
  }

  if (node.tagName === "OL") {
    const start = Number.parseInt(node.getAttribute("start") ?? "1", 10);

    return Array.from(node.children)
      .map((child, index) =>
        serializeHtmlNodeToText(child, {
          listType: "ordered",
          index: start + index,
          depth: context.depth ?? 0,
        }),
      )
      .filter(Boolean)
      .join("\n");
  }

  if (node.tagName === "LI") {
    const depth = context.depth ?? 0;
    const indent = "  ".repeat(depth);
    const prefix =
      context.listType === "ordered" ? `${context.index ?? 1}. ` : "\u2022 ";

    const childBlocks = Array.from(node.childNodes)
      .map((child) =>
        serializeHtmlNodeToText(child, {
          depth: depth + 1,
        }),
      )
      .filter((value) => value.length > 0);

    if (childBlocks.length === 0) {
      return `${indent}${prefix}`.trimEnd();
    }

    const [firstBlock, ...restBlocks] = childBlocks;
    const firstLine = collapseWhitespace(firstBlock);
    const trailingBlocks = restBlocks
      .map((block) =>
        block
          .split("\n")
          .map((line) => `${indent}  ${line}`)
          .join("\n"),
      )
      .join("\n");

    return [`${indent}${prefix}${firstLine}`, trailingBlocks]
      .filter(Boolean)
      .join("\n");
  }

  if (node.tagName === "P") {
    return Array.from(node.childNodes)
      .map((child) => serializeHtmlNodeToText(child, context))
      .join("");
  }

  if (["DIV", "SECTION", "ARTICLE", "BLOCKQUOTE"].includes(node.tagName)) {
    return Array.from(node.childNodes)
      .map((child) => serializeHtmlNodeToText(child, context))
      .filter(Boolean)
      .join("\n\n");
  }

  return Array.from(node.childNodes)
    .map((child) => serializeHtmlNodeToText(child, context))
    .join("");
}

export function htmlToPlainText(value: string) {
  const normalizedValue = normalizeLineEndings(value).trim();

  if (!normalizedValue) {
    return "";
  }

  if (typeof window === "undefined" || !hasHtmlMarkup(normalizedValue)) {
    return normalizedValue.replace(/<[^>]+>/g, "").trim();
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(normalizedValue, "text/html");

  return Array.from(document.body.childNodes)
    .map((node) => serializeHtmlNodeToText(node))
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function plainTextToLinkedInHtml(value: string) {
  const normalizedValue = normalizeLineEndings(value);

  if (!normalizedValue.trim()) {
    return "<div><br></div>";
  }

  return normalizedValue
    .split("\n")
    .map((line) =>
      line.length > 0 ? `<div>${escapeHtml(line)}</div>` : "<div><br></div>",
    )
    .join("");
}

export function normalizePostContent(value: string) {
  return htmlToPlainText(normalizeLineEndings(value)).trim();
}

export function countWords(value: string) {
  return normalizePostContent(value).split(/\s+/).filter(Boolean).length;
}

export async function copyPostContent(value: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard is not available.");
  }

  await navigator.clipboard.writeText(normalizeLineEndings(value));
}

export async function copyLinkedInContent(value: string) {
  const normalizedValue = normalizeLineEndings(value);
  const html = hasHtmlMarkup(normalizedValue)
    ? normalizedValue
    : linkedinTextToHtml(normalizedValue);
  const text = hasHtmlMarkup(normalizedValue)
    ? htmlToPlainText(html)
    : normalizedValue;
  const linkedInHtml = plainTextToLinkedInHtml(text);

  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    !("ClipboardItem" in window)
  ) {
    await copyPostContent(text);
    return;
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([linkedInHtml], { type: "text/html" }),
    }),
  ]);
}

export async function copyThreadContent(values: string[]) {
  await copyPostContent(values.map(normalizeLineEndings).join("\n\n"));
}
