"use client";

import { useState } from "react";
import { AddBigTopicRow } from "./add-rows";
import { DUMMY_DATA } from "./data";
import { AlgoSheetHeader } from "./header";
import { QuestionDialog } from "./question-dialog";
import { TopicRow } from "./topic-row";
import {
  Difficulty,
  HintFormat,
  Question,
  Topic,
  Understanding,
} from "./types";

export function AlgoSheet() {
  const [data, setData] = useState<Topic[]>(DUMMY_DATA);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    topicId: string | null;
    subtopicId: string | null;
    editQuestion: Question | null;
  }>({ isOpen: false, topicId: null, subtopicId: null, editQuestion: null });

  const handleAddTopic = (title: string) => {
    setData((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        title,
        userId: "local",
        questions: [],
        subtopics: [],
      },
    ]);
  };

  const handleAddSubtopic = (topicId: string, title: string) => {
    setData((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subtopics: [
                ...(topic.subtopics ?? []),
                { id: `st-${Date.now()}`, title, topicId, questions: [] },
              ],
            }
          : topic
      )
    );
  };

  const handleSaveQuestion = (questionData: {
    title: string;
    level: Difficulty;
    link: string;
    hint: string;
    hintFormat: HintFormat;
    understanding: Understanding;
    codes: { language: string; code: string }[];
  }) => {
    const { topicId, subtopicId, editQuestion } = dialogConfig;

    // --- Edit existing ---
    if (editQuestion) {
      const updatedQuestion: Question = {
        ...editQuestion,
        title: questionData.title,
        level: questionData.level,
        link: questionData.link || null,
        hint: questionData.hint || null,
        hintFormat: questionData.hint ? questionData.hintFormat : null,
        understanding: questionData.understanding,
        codes: questionData.codes.map((c, i) => ({
          id: editQuestion.codes[i]?.id ?? `c-${Date.now()}-${i}`,
          questionId: editQuestion.id,
          title: null,
          ...c,
        })),
      };

      const updateQuestion = (questions: Question[]) =>
        questions.map((q) => (q.id === editQuestion.id ? updatedQuestion : q));

      setData((prev) =>
        prev.map((topic) => ({
          ...topic,
          questions: updateQuestion(topic.questions ?? []),
          subtopics: topic.subtopics.map((st) => ({
            ...st,
            questions: updateQuestion(st.questions),
          })),
        }))
      );
      return;
    }

    // --- Add new ---
    if (!topicId) return;
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      solvedCount: 0,
      topicId,
      subtopicId: subtopicId ?? null,
      codes: questionData.codes.map((c, i) => ({
        id: `c-${Date.now()}-${i}`,
        questionId: `q-${Date.now()}`,
        title: null,
        ...c,
      })),
      hint: questionData.hint || null,
      hintFormat: questionData.hint ? questionData.hintFormat : null,
      understanding: questionData.understanding,
      title: questionData.title,
      level: questionData.level,
      link: questionData.link || null,
    };

    setData((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        if (subtopicId) {
          return {
            ...topic,
            subtopics: topic.subtopics.map((st) =>
              st.id === subtopicId
                ? { ...st, questions: [...st.questions, newQuestion] }
                : st
            ),
          };
        }
        return {
          ...topic,
          questions: [...(topic.questions ?? []), newQuestion],
        };
      })
    );
  };

  const handleEditQuestion = (question: Question) => {
    setDialogConfig({
      isOpen: true,
      topicId: question.topicId ?? null,
      subtopicId: question.subtopicId ?? null,
      editQuestion: question,
    });
  };

  const handleUnderstandingChange = (
    questionId: string,
    understanding: Understanding
  ) => {
    const update = (qs: Question[]) =>
      qs.map((q) => (q.id === questionId ? { ...q, understanding } : q));
    setData((prev) =>
      prev.map((topic) => ({
        ...topic,
        questions: update(topic.questions ?? []),
        subtopics: topic.subtopics.map((st) => ({
          ...st,
          questions: update(st.questions),
        })),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground pb-20">
      <AlgoSheetHeader />

      <main className="w-full mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Curriculum Database
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat, list-based view of algorithms and data structures.
          </p>
        </div>

        <div className="border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          {/* Table header */}
          <div className="flex items-center px-4 py-2.5 bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="w-10 shrink-0 text-center">Done</div>
            <div className="flex-1 pr-4">Title</div>
            <div className="w-20 shrink-0">Level</div>
            <div className="w-28 shrink-0">Solved</div>
            <div className="w-32 shrink-0">Understanding</div>
            <div className="w-32 shrink-0 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {data.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onAddSubtopic={handleAddSubtopic}
                onOpenAddQuestion={(topicId, subtopicId) =>
                  setDialogConfig({
                    isOpen: true,
                    topicId,
                    subtopicId,
                    editQuestion: null,
                  })
                }
                onEditQuestion={handleEditQuestion}
                onUnderstandingChange={handleUnderstandingChange}
              />
            ))}
            <AddBigTopicRow onAdd={handleAddTopic} />
          </div>
        </div>
      </main>

      <QuestionDialog
        key={`${dialogConfig.editQuestion?.id ?? "new"}-${dialogConfig.topicId}-${dialogConfig.subtopicId}-${dialogConfig.isOpen}`}
        isOpen={dialogConfig.isOpen}
        onClose={() =>
          setDialogConfig((prev) => ({
            ...prev,
            isOpen: false,
            editQuestion: null,
          }))
        }
        onSave={handleSaveQuestion}
        initialData={dialogConfig.editQuestion ?? undefined}
      />
    </div>
  );
}
