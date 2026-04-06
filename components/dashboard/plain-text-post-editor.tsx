"use client";

import * as React from "react";
import {
  BetweenHorizontalStart,
  List,
  ListOrdered,
  Pilcrow,
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
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
}

const BULLET_PREFIX = "• ";
const bulletLinePattern = /^(\s*)•\s?(.*)$/;
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

function getCurrentLine(
  value: string,
  selectionStart: number,
  selectionEnd: number,
) {
  const { lineStart, lineEnd } = getSelectedLineRange(
    value,
    selectionStart,
    selectionEnd,
  );

  return {
    lineStart,
    lineEnd,
    line: value.slice(lineStart, lineEnd),
  };
}

export function PlainTextPostEditor({
  value,
  onChange,
  placeholder,
  className,
  textareaClassName,
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
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const { start, end, scrollTop } = selectionRef.current;
      const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
      const cursorPosition = start + text.length;

      updateValue(nextValue, cursorPosition, cursorPosition, scrollTop);
    },
    [updateValue, value],
  );

  const insertBlankLine = React.useCallback(() => {
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
  }, [updateValue, value]);

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

      const { lineStart, lineEnd, line } = getCurrentLine(value, start, end);
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
    [updateValue, value],
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-md"
          onClick={insertBulletList}
          aria-label="Toggle bullet list"
          title="Bullet list"
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-md"
          onClick={insertNumberedList}
          aria-label="Toggle numbered list"
          title="Numbered list"
        >
          <ListOrdered />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-md"
          onClick={insertBlankLine}
          aria-label="Insert blank line"
          title="Blank line"
        >
          <BetweenHorizontalStart />
        </Button>
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-md"
              aria-label="Insert emoji"
              title="Insert emoji"
              onMouseDown={syncSelectionState}
            >
              <SmilePlus />
            </Button>
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
        <div
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"
          aria-hidden="true"
        >
          <Pilcrow className="size-4" />
        </div>
      </div>

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
        className={cn(
          "min-h-[420px] resize-none rounded-none border-0 bg-background p-5 text-sm leading-7 shadow-none focus-visible:ring-0",
          textareaClassName,
        )}
      />
    </div>
  );
}
