"use client";

import { RiArrowRightSLine, RiFolderOpenLine } from "@remixicon/react";
import { useState } from "react";
import { QuestionRow } from "./question-row";
import { Question, Subtopic, Understanding } from "./types";

interface SubtopicRowProps {
  topicId: string;
  subtopic: Subtopic;
  onOpenAddQuestion: (topicId: string, subtopicId: string | null) => void;
  onEditQuestion: (question: Question) => void;
  onUnderstandingChange: (
    questionId: string,
    understanding: Understanding
  ) => void;
}

export function SubtopicRow({
  topicId,
  subtopic,
  onOpenAddQuestion,
  onEditQuestion,
  onUnderstandingChange,
}: SubtopicRowProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center pl-4 pr-4 py-2 border-b border-border bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer group/subtopic"
      >
        <div className="w-10 shrink-0 flex items-center justify-center">
          <RiArrowRightSLine
            className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90 text-foreground" : ""}`}
          />
        </div>

        <div className="flex-1 flex items-center gap-2">
          <RiFolderOpenLine className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            {subtopic.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddQuestion(topicId, subtopic.id);
            }}
            className="opacity-0 group-hover/subtopic:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-0.5 border border-transparent hover:border-border hover:bg-accent"
          >
            + Question
          </button>
          <span className="text-xs font-medium text-muted-foreground w-16 text-right">
            {subtopic.questions.length} items
          </span>
        </div>
      </div>

      {isOpen && (
        <>
          {subtopic.questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              depth={2}
              onEdit={() => onEditQuestion(q)}
              onUnderstandingChange={(u) => onUnderstandingChange(q.id, u)}
            />
          ))}
        </>
      )}
    </>
  );
}
