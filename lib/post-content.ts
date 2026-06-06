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

export function countWords(value: string) {
  return normalizeLineEndings(value).split(/\s+/).filter(Boolean).length;
}

export async function copyPostContent(value: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard is not available.");
  }

  await navigator.clipboard.writeText(normalizeLineEndings(value));
}

function plainTextToLinkedInHtml(value: string) {
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

export async function copyLinkedInContent(value: string) {
  const normalizedValue = normalizeLineEndings(value);
  const linkedInHtml = plainTextToLinkedInHtml(normalizedValue);

  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    !("ClipboardItem" in window)
  ) {
    await copyPostContent(normalizedValue);
    return;
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([normalizedValue], { type: "text/plain" }),
      "text/html": new Blob([linkedInHtml], { type: "text/html" }),
    }),
  ]);
}

export async function copyThreadContent(values: string[]) {
  await copyPostContent(values.map(normalizeLineEndings).join("\n\n"));
}
