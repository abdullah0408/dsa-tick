"use client";

import {
  RiAddCircleLine,
  RiArrowRightSLine,
  RiBookOpenLine,
  RiFileCodeLine,
  RiFolderAddLine,
} from "@remixicon/react";
import { useState } from "react";
import { QuestionRow } from "./question-row";
import { SubtopicRow } from "./subtopic-row";
import { Topic } from "./types";

interface TopicRowProps {
  topic: Topic;
  onAddSubtopic: (topicId: string, title: string) => void;
  onOpenAddQuestion: (topicId: string, subtopicId: string | null) => void;
}

export function TopicRow({
  topic,
  onAddSubtopic,
  onOpenAddQuestion,
}: TopicRowProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [addingSubtopic, setAddingSubtopic] = useState(false);
  const [subtopicInput, setSubtopicInput] = useState("");

  const commitSubtopic = () => {
    if (subtopicInput.trim()) onAddSubtopic(topic.id, subtopicInput.trim());
    setSubtopicInput("");
    setAddingSubtopic(false);
  };

  const totalQuestions =
    (topic.questions?.length ?? 0) +
    (topic.subtopics?.reduce((acc, st) => acc + st.questions.length, 0) ?? 0);

  return (
    <>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center pl-4 pr-4 py-3 border-b border-border bg-muted hover:bg-muted/70 transition-colors cursor-pointer group/topic"
      >
        <div className="w-10 shrink-0 flex items-center justify-center">
          <RiArrowRightSLine
            className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90 text-foreground" : ""}`}
          />
        </div>

        <div className="flex-1 flex items-center gap-2.5">
          <RiBookOpenLine className="size-4 text-foreground" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            {topic.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
              setAddingSubtopic(true);
            }}
            title="Add subtopic"
            className="opacity-0 group-hover/topic:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            <RiFolderAddLine className="size-3" />
            <RiAddCircleLine className="size-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddQuestion(topic.id, null);
            }}
            title="Add direct question"
            className="opacity-0 group-hover/topic:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            <RiFileCodeLine className="size-3" />
            <RiAddCircleLine className="size-3" />
          </button>
          <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-0.5 border border-border">
            {totalQuestions} problems
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="bg-card">
          {addingSubtopic && (
            <div className="flex items-center pl-4 py-1.5 pr-4 border-b border-border bg-card">
              <div className="w-10 shrink-0" />
              <input
                autoFocus
                value={subtopicInput}
                onChange={(e) => setSubtopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSubtopic();
                  if (e.key === "Escape") {
                    setSubtopicInput("");
                    setAddingSubtopic(false);
                  }
                }}
                onBlur={commitSubtopic}
                placeholder="Subtopic name..."
                className="flex-1 text-sm bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground font-medium"
              />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Press Enter
              </span>
            </div>
          )}
          {topic.subtopics?.map((st) => (
            <SubtopicRow
              key={st.id}
              topicId={topic.id}
              subtopic={st}
              onOpenAddQuestion={onOpenAddQuestion}
            />
          ))}

          {topic.questions?.map((q) => (
            <QuestionRow key={q.id} question={q} depth={1} />
          ))}
        </div>
      )}
    </>
  );
}
