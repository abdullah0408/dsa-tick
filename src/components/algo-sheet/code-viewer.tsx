"use client";

import { toast } from "sonner";
import {
  RiCheckLine,
  RiClipboardLine,
  RiCodeSSlashLine,
} from "@remixicon/react";
import { Code } from "./types";

interface CodeViewerProps {
  code: Code;
}

export function CodeViewer({ code }: CodeViewerProps) {
  const lines = code.code.split("\n");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      toast.success("Code copied.");
    } catch {
      toast.error("Could not copy code.");
    }
  };

  return (
    <div className="border border-t-0 border-border bg-primary">
      <div className="flex items-center justify-between border-b border-primary-foreground/10 px-3 py-2 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <RiCodeSSlashLine className="size-4 shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-xs font-extrabold uppercase tracking-wider">
              {code.title || code.language || "Solution"}
            </div>
            <div className="text-[10px] font-medium opacity-70">
              {lines.length} lines
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-7 items-center gap-1.5 border border-primary-foreground/20 px-2 text-xs font-bold text-primary-foreground/80 transition-colors hover:bg-primary-foreground hover:text-primary"
        >
          <RiClipboardLine className="size-3.5" />
          Copy
        </button>
      </div>

      <div className="max-h-96 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="align-top">
                <td className="select-none border-r border-primary-foreground/10 px-3 py-0.5 text-right font-mono text-xs leading-relaxed text-primary-foreground/40">
                  {index + 1}
                </td>
                <td className="min-w-full px-3 py-0.5">
                  <pre className="font-mono leading-relaxed text-primary-foreground">
                    <code>{line || " "}</code>
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 border-t border-primary-foreground/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">
        <RiCheckLine className="size-3" />
        Saved with this problem
      </div>
    </div>
  );
}
