"use client";

import {
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiFolderOpenLine,
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
import { useState } from "react";
import { QuestionRow } from "./question-row";
import { Question, Subtopic, Understanding } from "./types";

interface SubtopicRowProps {
  topicId: string;
  subtopic: Subtopic;
  onDeleteSubtopic: (subtopicId: string) => void;
  onOpenAddQuestion: (topicId: string, subtopicId: string | null) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onUnderstandingChange: (
    questionId: string,
    understanding: Understanding
  ) => void;
  onSolvedCountChange: (questionId: string, solvedCount: number) => void;
}

export function SubtopicRow({
  topicId,
  subtopic,
  onDeleteSubtopic,
  onOpenAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onUnderstandingChange,
  onSolvedCountChange,
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                title="Delete subtopic"
                className="opacity-0 group-hover/subtopic:opacity-100 transition-opacity size-6 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-accent border border-transparent hover:border-border"
              >
                <RiDeleteBinLine className="size-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete subtopic?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove {subtopic.title} and all of its
                  questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDeleteSubtopic(subtopic.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              onDelete={() => onDeleteQuestion(q.id)}
              onUnderstandingChange={(u) => onUnderstandingChange(q.id, u)}
              onSolvedCountChange={(count) => onSolvedCountChange(q.id, count)}
            />
          ))}
        </>
      )}
    </>
  );
}
