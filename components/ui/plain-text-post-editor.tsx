"use client";

import * as React from "react";
import {
  BetweenHorizontalStart,
  Copy,
  List,
  ListOrdered,
  SmilePlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PlainTextPostEditorProps {
  value: string;
  onChange: (content: string) => void;
  onCopy?: () => void;
  copyLabel?: string;
  autoResize?: boolean;
  minEditorHeight?: number;
  maxEditorHeight?: number;
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
  readOnly?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  onMouseDown?: () => void;
}

const BULLET_PREFIX = "â€¢ ";
const bulletLinePattern = /^(\s*)â€¢\s?(.*)$/;
const numberedLinePattern = /^(\s*)(\d+)\.\s?(.*)$/;

function getSelectedLineRange(
  value: string,
  selectionStart: number,
  selectionEnd: number,
) {
  const lineStart =
    value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const nextLineBreak = value.indexOf("\n", selectionEnd);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;

  return { lineStart, lineEnd };
}

function ToolbarButton({
  icon,
  label,
  onClick,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="rounded-md"
      onClick={onClick}
      onMouseDown={onMouseDown}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

export function PlainTextPostEditor({
  value,
  onChange,
  onCopy,
  copyLabel = "Copy content",
  autoResize = false,
  minEditorHeight = 420,
  maxEditorHeight,
  placeholder,
  className,
  textareaClassName,
  readOnly = false,
}: PlainTextPostEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const selectionRef = React.useRef({ start: 0, end: 0, scrollTop: 0 });

  const syncSelectionState = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      scrollTop: textarea.scrollTop,
    };
  }, []);

  const syncTextareaHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) {
      return;
    }

    textarea.style.height = "auto";
    const contentHeight = Math.max(textarea.scrollHeight, minEditorHeight);
    const nextHeight =
      typeof maxEditorHeight === "number"
        ? Math.min(contentHeight, maxEditorHeight)
        : contentHeight;

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      typeof maxEditorHeight === "number" && contentHeight > maxEditorHeight
        ? "auto"
        : "hidden";
  }, [autoResize, maxEditorHeight, minEditorHeight]);

  React.useLayoutEffect(() => {
    syncTextareaHeight();
  }, [syncTextareaHeight]);

  const updateValue = React.useCallback(
    (
      nextValue: string,
      selectionStart: number,
      selectionEnd = selectionStart,
      scrollTop?: number,
    ) => {
      onChange(nextValue);

      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) {
          return;
        }

        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionEnd);
        if (typeof scrollTop === "number") {
          textarea.scrollTop = scrollTop;
        }
      });
    },
    [onChange],
  );

  const insertTextAtSelection = React.useCallback(
    (text: string) => {
      if (readOnly) return;

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const { start, end, scrollTop } = selectionRef.current;
      const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
      const cursorPosition = start + text.length;

      updateValue(nextValue, cursorPosition, cursorPosition, scrollTop);
    },
    [readOnly, updateValue, value],
  );

  const insertBlankLine = React.useCallback(() => {
    if (readOnly) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const nextValue = `${value.slice(0, start)}\n\n${value.slice(end)}`;
    const cursorPosition = start + 2;

    updateValue(nextValue, cursorPosition, cursorPosition, scrollTop);
  }, [readOnly, updateValue, value]);

  const insertEmoji = React.useCallback(
    (emoji: string) => {
      const { start, end } = selectionRef.current;
      const previousCharacter = value[start - 1] ?? "";
      const nextCharacter = value[end] ?? "";
      const needsLeadingSpace = start > 0 && !/\s/.test(previousCharacter);
      const needsTrailingSpace =
        end < value.length && !/\s/.test(nextCharacter);
      const emojiText = `${needsLeadingSpace ? " " : ""}${emoji}${needsTrailingSpace ? " " : ""}`;

      insertTextAtSelection(emojiText);
      setIsEmojiPickerOpen(false);
    },
    [insertTextAtSelection, value],
  );

  const formatSelectedLines = React.useCallback(
    (formatter: (lines: string[]) => string[]) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const scrollTop = textarea.scrollTop;
      const { lineStart, lineEnd } = getSelectedLineRange(value, start, end);
      const selectedBlock = value.slice(lineStart, lineEnd);
      const lines = selectedBlock.split("\n");
      const nextLines = formatter(lines);
      const replacement = nextLines.join("\n");
      const nextValue = `${value.slice(0, lineStart)}${replacement}${value.slice(lineEnd)}`;

      updateValue(
        nextValue,
        lineStart,
        lineStart + replacement.length,
        scrollTop,
      );
    },
    [updateValue, value],
  );

  const insertBulletList = React.useCallback(() => {
    formatSelectedLines((lines) => {
      const shouldRemoveBullets = lines.every((line) =>
        bulletLinePattern.test(line),
      );

      if (shouldRemoveBullets) {
        return lines.map((line) => line.replace(bulletLinePattern, "$1$2"));
      }

      return lines.map((line) => {
        const numberedMatch = numberedLinePattern.exec(line);
        if (numberedMatch) {
          return `${numberedMatch[1]}${BULLET_PREFIX}${numberedMatch[3]}`;
        }

        return line.trim().length > 0
          ? `${BULLET_PREFIX}${line}`
          : BULLET_PREFIX;
      });
    });
  }, [formatSelectedLines]);

  const insertNumberedList = React.useCallback(() => {
    formatSelectedLines((lines) => {
      const shouldRemoveNumbers = lines.every((line) =>
        numberedLinePattern.test(line),
      );

      if (shouldRemoveNumbers) {
        return lines.map((line) => line.replace(numberedLinePattern, "$1$3"));
      }

      return lines.map((line, index) => {
        const bulletMatch = bulletLinePattern.exec(line);
        const content = bulletMatch ? bulletMatch[2] : line;
        return content.trim().length > 0
          ? `${index + 1}. ${content}`
          : `${index + 1}. `;
      });
    });
  }, [formatSelectedLines]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) {
        return;
      }

      if (event.key !== "Enter" || event.shiftKey) {
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        return;
      }

      const { lineStart, lineEnd } = getSelectedLineRange(value, start, end);
      const line = value.slice(lineStart, lineEnd);
      const bulletMatch = bulletLinePattern.exec(line);

      if (bulletMatch) {
        event.preventDefault();
        const [, indent, content] = bulletMatch;

        if (!content.trim()) {
          const nextValue = `${value.slice(0, lineStart)}${indent}${value.slice(lineEnd)}`;
          updateValue(
            nextValue,
            lineStart + indent.length,
            lineStart + indent.length,
            textarea.scrollTop,
          );
          return;
        }

        const insertion = `\n${indent}${BULLET_PREFIX}`;
        const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
        updateValue(
          nextValue,
          start + insertion.length,
          start + insertion.length,
          textarea.scrollTop,
        );
        return;
      }

      const numberedMatch = numberedLinePattern.exec(line);

      if (numberedMatch) {
        event.preventDefault();
        const [, indent, rawNumber, content] = numberedMatch;

        if (!content.trim()) {
          const nextValue = `${value.slice(0, lineStart)}${indent}${value.slice(lineEnd)}`;
          updateValue(
            nextValue,
            lineStart + indent.length,
            lineStart + indent.length,
            textarea.scrollTop,
          );
          return;
        }

        const nextNumber = Number.parseInt(rawNumber, 10) + 1;
        const insertion = `\n${indent}${nextNumber}. `;
        const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
        updateValue(
          nextValue,
          start + insertion.length,
          start + insertion.length,
          textarea.scrollTop,
        );
      }
    },
    [readOnly, updateValue, value],
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background shadow-xs",
        className,
      )}
    >
      {!readOnly || onCopy ? (
        <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-2">
          {!readOnly ? (
            <>
              <ToolbarButton
                icon={<List />}
                label="Bullet list"
                onClick={insertBulletList}
              />
              <ToolbarButton
                icon={<ListOrdered />}
                label="Numbered list"
                onClick={insertNumberedList}
              />
              <ToolbarButton
                icon={<BetweenHorizontalStart />}
                label="Blank line"
                onClick={insertBlankLine}
              />
              <Popover
                open={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
              >
                <PopoverTrigger asChild>
                  <ToolbarButton
                    icon={<SmilePlus />}
                    label="Insert emoji"
                    onMouseDown={syncSelectionState}
                  />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-fit border p-0 shadow-lg"
                >
                  <EmojiPicker
                    className="h-[360px]"
                    onEmojiSelect={({ emoji }) => insertEmoji(emoji)}
                  >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                  </EmojiPicker>
                </PopoverContent>
              </Popover>
              <div className="mx-1 h-5 w-px bg-border" />
            </>
          ) : null}
          {onCopy ? (
            <>
              <div className="ml-auto h-5 w-px bg-border" />
              <ToolbarButton
                icon={<Copy />}
                label={copyLabel}
                onClick={onCopy}
              />
            </>
          ) : null}
        </div>
      ) : null}

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={syncSelectionState}
        onKeyDown={handleKeyDown}
        onKeyUp={syncSelectionState}
        onSelect={syncSelectionState}
        onScroll={syncSelectionState}
        placeholder={placeholder}
        readOnly={readOnly}
        style={
          autoResize
            ? {
                minHeight: `${minEditorHeight}px`,
                maxHeight:
                  typeof maxEditorHeight === "number"
                    ? `${maxEditorHeight}px`
                    : undefined,
              }
            : undefined
        }
        className={cn(
          "min-h-[420px] resize-none rounded-none border-0 bg-background p-5 text-sm leading-7 shadow-none focus-visible:ring-0",
          autoResize && "overflow-y-hidden",
          textareaClassName,
        )}
      />
    </div>
  );
}
