"use client";

import {
  RiCheckLine,
  RiCodeSSlashLine,
  RiExternalLinkLine,
  RiFileCodeLine,
  RiLightbulbLine,
} from "@remixicon/react";
import { useState } from "react";
import { LevelBadge } from "./level-badge";
import { Question } from "./types";

interface QuestionRowProps {
  question: Question;
  depth: 1 | 2;
}

export function QuestionRow({ question, depth }: QuestionRowProps) {
  const [solved, setSolved] = useState(question.solvedCount > 0);
  const [showHint, setShowHint] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const paddingLeft = depth === 1 ? "pl-4" : "pl-10";

  return (
    <>
      {/* Main row */}
      <div
        className={`flex items-center py-2.5 pr-4 border-b border-border hover:bg-accent/40 transition-colors bg-card group ${paddingLeft}`}
      >
        {/* Status */}
        <div className="w-10 shrink-0 flex items-center justify-center">
          <button
            onClick={() => setSolved(!solved)}
            className={`w-4 h-4 border flex items-center justify-center transition-colors focus:outline-none ${
              solved
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-input hover:border-ring text-transparent"
            }`}
          >
            <RiCheckLine className="size-3" />
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 pr-4 flex items-center gap-2">
          <RiFileCodeLine className="size-3.5 text-muted-foreground shrink-0" />
          <a
            href={question.link ?? "#"}
            target="_blank"
            rel="noreferrer"
            className={`text-sm font-medium truncate hover:underline underline-offset-4 ${
              solved ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {question.title}
          </a>
          <RiExternalLinkLine className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>

        {/* Level */}
        <div className="w-20 shrink-0">
          <LevelBadge level={question.level} />
        </div>

        {/* Actions */}
        <div className="w-32 shrink-0 flex items-center justify-end gap-2">
          {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`px-2 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showHint
                  ? "bg-accent border-border text-foreground"
                  : "bg-card border-transparent text-muted-foreground hover:bg-accent hover:border-border"
              }`}
            >
              <RiLightbulbLine className="size-3" />
              Hint
            </button>
          )}
          {question.codes.length > 0 && (
            <button
              onClick={() => setShowCode(!showCode)}
              className={`px-2 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showCode
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-transparent text-muted-foreground hover:bg-accent hover:border-border"
              }`}
            >
              <RiCodeSSlashLine className="size-3" />
              Code
            </button>
          )}
        </div>
      </div>

      {/* Hint panel */}
      {showHint && question.hint && (
        <div className="py-4 px-6 border-b border-border bg-muted/40">
          <div className="pl-4 border-l-2 border-amber-400 py-1">
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">
              Hint
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {question.hint}
            </p>
          </div>
        </div>
      )}

      {/* Code panel */}
      {showCode && question.codes.length > 0 && (
        <div className="py-4 px-6 border-b border-border bg-muted/40">
          <div className="flex bg-muted border border-border px-2 py-1.5 gap-1">
            {question.codes.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 text-xs font-semibold transition-colors border ${
                  activeTab === idx
                    ? "bg-card text-foreground shadow-sm border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"
                }`}
              >
                {c.language}
              </button>
            ))}
          </div>
          <div className="bg-primary p-4 overflow-x-auto border border-t-0 border-border">
            <pre className="text-sm text-primary-foreground font-mono leading-relaxed">
              <code>{question.codes[activeTab].code}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
