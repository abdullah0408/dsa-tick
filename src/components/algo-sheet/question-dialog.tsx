"use client";

import {
  RiCloseLine,
  RiCodeSSlashLine,
  RiFileCodeLine,
  RiPencilLine,
} from "@remixicon/react";
import { useState } from "react";
import { Difficulty, HintFormat, Question, Understanding } from "./types";

const UNDERSTANDING_OPTIONS: {
  value: Understanding;
  label: string;
  selectedBg: string;
  selectedText: string;
}[] = [
  {
    value: "None",
    label: "None",
    selectedBg: "bg-red-900",
    selectedText: "text-white",
  },
  {
    value: "Weak",
    label: "Weak",
    selectedBg: "bg-red-200",
    selectedText: "text-red-900",
  },
  {
    value: "Fair",
    label: "Fair",
    selectedBg: "bg-yellow-100",
    selectedText: "text-yellow-800",
  },
  {
    value: "Good",
    label: "Good",
    selectedBg: "bg-green-100",
    selectedText: "text-green-800",
  },
  {
    value: "Strong",
    label: "Strong",
    selectedBg: "bg-green-800",
    selectedText: "text-white",
  },
];

interface QuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Question;
  onSave: (data: {
    title: string;
    level: Difficulty;
    link: string;
    hint: string;
    hintFormat: HintFormat;
    understanding: Understanding;
    codes: { language: string; code: string }[];
  }) => void;
}

export function QuestionDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
}: QuestionDialogProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [level, setLevel] = useState<Difficulty>(initialData?.level ?? "Easy");
  const [link, setLink] = useState(initialData?.link ?? "");
  const [hint, setHint] = useState(initialData?.hint ?? "");
  const [understanding, setUnderstanding] = useState<Understanding>(
    initialData?.understanding ?? "None"
  );
  const [codeLang, setCodeLang] = useState(
    initialData?.codes?.[0]?.language ?? "Python"
  );
  const [code, setCode] = useState(initialData?.codes?.[0]?.code ?? "");

  const isEditing = !!initialData;

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const codeList = code.trim()
      ? [{ language: codeLang, code: code.trim() }]
      : [];

    onSave({
      title: title.trim(),
      level,
      link: link.trim() || "",
      hint: hint.trim(),
      hintFormat: "Text",
      understanding,
      codes: codeList,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="bg-card text-card-foreground shadow-2xl w-full max-w-xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            {isEditing ? (
              <RiPencilLine className="size-5 text-muted-foreground" />
            ) : (
              <RiFileCodeLine className="size-5 text-muted-foreground" />
            )}
            {isEditing ? "Edit Question" : "Add New Question"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent text-muted-foreground transition-colors"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Question Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 1. Two Sum"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Difficulty)}
                className="w-full border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Link (Optional)
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://leetcode.com/..."
              />
            </div>
          </div>

          {/* Understanding */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Understanding
            </label>
            <div className="flex gap-2 flex-wrap">
              {UNDERSTANDING_OPTIONS.map((opt) => {
                const isSelected = understanding === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUnderstanding(opt.value)}
                    className={`px-4 py-1.5 text-sm font-semibold border transition-all rounded-sm ${
                      isSelected
                        ? `${opt.selectedBg} ${opt.selectedText} border-transparent shadow-sm`
                        : "bg-card text-muted-foreground border-border hover:border-ring"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Hint
            </label>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              rows={3}
              className="w-full border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
              placeholder="Key insight or approach..."
            />
          </div>

          <div className="border border-border p-4 bg-muted/30">
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              <RiCodeSSlashLine className="size-3.5" /> Initial Solution
              (Optional)
            </label>
            <div className="space-y-3">
              <input
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="w-full border border-input px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Language (e.g. Python, C++)"
              />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={5}
                className="w-full border border-border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-none bg-primary text-primary-foreground leading-relaxed"
                placeholder="def twoSum(self, nums...):"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/40 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-md active:scale-95"
          >
            {isEditing ? "Update Question" : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
