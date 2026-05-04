"use client";

import { HintFormat } from "./types";

interface HintContentProps {
  hint: string;
  format?: HintFormat | null;
}

export function HintContent({ hint, format }: HintContentProps) {
  if (format !== "Markdown") {
    return <p className="text-sm leading-relaxed text-foreground">{hint}</p>;
  }

  const lines = hint.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={index} className="text-sm font-bold text-foreground">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h5>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h4
              key={index}
              className="text-base font-extrabold text-foreground"
            >
              {renderInlineMarkdown(trimmed.slice(3))}
            </h4>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={index} className="text-lg font-extrabold text-foreground">
              {renderInlineMarkdown(trimmed.slice(2))}
            </h3>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <p>{renderInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code
          key={index}
          className="border border-border bg-background px-1 py-0.5 font-mono text-[0.85em]"
        >
          {segment.slice(1, -1)}
        </code>
      );
    }

    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>;
    }

    return segment;
  });
}
