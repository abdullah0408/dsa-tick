"use client";

import {
  RiAddLine,
  RiArrowDownSLine,
  RiCheckLine,
  RiCodeSSlashLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiFileCodeLine,
  RiLightbulbLine,
  RiPencilLine,
  RiSubtractLine,
} from "@remixicon/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { LevelBadge } from "./level-badge";
import { Question, Understanding } from "./types";

const UNDERSTANDING_OPTIONS: {
  value: Understanding;
  label: string;
  badgeCls: string;
  optionCls: string;
}[] = [
  {
    value: "None",
    label: "None",
    badgeCls: "bg-red-900 text-white",
    optionCls: "hover:bg-red-900 hover:text-white",
  },
  {
    value: "Weak",
    label: "Weak",
    badgeCls: "bg-red-200 text-red-900",
    optionCls: "hover:bg-red-200 hover:text-red-900",
  },
  {
    value: "Fair",
    label: "Fair",
    badgeCls: "bg-yellow-100 text-yellow-800",
    optionCls: "hover:bg-yellow-100 hover:text-yellow-800",
  },
  {
    value: "Good",
    label: "Good",
    badgeCls: "bg-green-100 text-green-800",
    optionCls: "hover:bg-green-100 hover:text-green-800",
  },
  {
    value: "Strong",
    label: "Strong",
    badgeCls: "bg-green-800 text-white",
    optionCls: "hover:bg-green-800 hover:text-white",
  },
];

function getBadgeCls(u: Understanding | null | undefined) {
  return (
    UNDERSTANDING_OPTIONS.find((o) => o.value === u)?.badgeCls ??
    "bg-muted text-muted-foreground"
  );
}

interface QuestionRowProps {
  question: Question;
  depth: 1 | 2;
  onEdit?: () => void;
  onDelete?: () => void;
  onUnderstandingChange?: (understanding: Understanding) => void;
  onSolvedCountChange?: (solvedCount: number) => void;
}

export function QuestionRow({
  question,
  depth,
  onEdit,
  onDelete,
  onUnderstandingChange,
  onSolvedCountChange,
}: QuestionRowProps) {
  const [solveCount, setSolveCount] = useState(question.solvedCount);
  const [solved, setSolved] = useState(question.solvedCount > 0);
  const [showHint, setShowHint] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [understandingOpen, setUnderstandingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUnderstanding = question.understanding ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUnderstandingOpen(false);
      }
    };
    if (understandingOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [understandingOpen]);

  const handleSelectUnderstanding = (val: Understanding) => {
    setUnderstandingOpen(false);
    onUnderstandingChange?.(val);
  };

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
            onClick={() => {
              const next = !solved;
              setSolved(next);
              const nextCount = next ? (solveCount === 0 ? 1 : solveCount) : 0;
              setSolveCount(nextCount);
              onSolvedCountChange?.(nextCount);
            }}
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
              solved
                ? "text-muted-foreground line-through decoration-muted-foreground/70"
                : "text-foreground"
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

        {/* Solved counter */}
        <div className="w-28 shrink-0 flex items-center gap-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = Math.max(0, solveCount - 1);
              setSolveCount(next);
              if (next === 0) setSolved(false);
              onSolvedCountChange?.(next);
            }}
            className="size-6 flex items-center justify-center border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <RiSubtractLine className="size-3" />
          </button>
          <span
            className={`w-8 text-center text-xs font-bold tabular-nums border-y border-border h-6 flex items-center justify-center ${
              solveCount > 0 ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {solveCount}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = solveCount + 1;
              if (solveCount === 0) setSolved(true);
              setSolveCount(next);
              onSolvedCountChange?.(next);
            }}
            className="size-6 flex items-center justify-center border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <RiAddLine className="size-3" />
          </button>
        </div>

        {/* Understanding */}
        <div className="w-32 shrink-0" ref={dropdownRef}>
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUnderstandingOpen((o) => !o);
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-sm transition-colors ${
                currentUnderstanding
                  ? getBadgeCls(currentUnderstanding)
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{currentUnderstanding ?? "—"}</span>
              <RiArrowDownSLine className="size-3 shrink-0" />
            </button>
            {understandingOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border shadow-lg min-w-28 py-1">
                {UNDERSTANDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUnderstanding(opt.value);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${
                      currentUnderstanding === opt.value
                        ? opt.badgeCls
                        : `text-foreground ${opt.optionCls}`
                    }`}
                  >
                    {opt.label}
                    {currentUnderstanding === opt.value && (
                      <RiCheckLine className="size-3" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="w-32 shrink-0 flex items-center justify-end gap-1.5">
          {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`h-6 px-2 text-xs font-medium flex items-center gap-1.5 transition-colors border ${
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
              className={`h-6 px-2 text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showCode
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-transparent text-muted-foreground hover:bg-accent hover:border-border"
              }`}
            >
              <RiCodeSSlashLine className="size-3" />
              Code
            </button>
          )}
          <button
            onClick={onEdit}
            title="Edit question"
            className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors shrink-0"
          >
            <RiPencilLine className="size-3" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                title="Delete question"
                className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-accent border border-transparent hover:border-border transition-colors shrink-0"
              >
                <RiDeleteBinLine className="size-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete question?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove {question.title}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
