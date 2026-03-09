"use client";

import {
  addQuestion,
  addSubtopic,
  addTopic,
  updateQuestion,
} from "@/app/actions/algo-sheet";
import { useState } from "react";
import { AddBigTopicRow } from "./add-rows";
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

export function AlgoSheet({ initialData }: { initialData: Topic[] }) {
  const [data, setData] = useState<Topic[]>(initialData);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    topicId: string | null;
    subtopicId: string | null;
    editQuestion: Question | null;
  }>({ isOpen: false, topicId: null, subtopicId: null, editQuestion: null });

  const handleAddTopic = async (title: string) => {
    const tempId = `temp-${Date.now()}`;
    setData((prev) => [
      ...prev,
      { id: tempId, title, userId: "abc", questions: [], subtopics: [] },
    ]);
    try {
      await addTopic(title);
    } catch {
      setData((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const handleAddSubtopic = async (topicId: string, title: string) => {
    const tempId = `temp-${Date.now()}`;
    setData((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subtopics: [
                ...t.subtopics,
                { id: tempId, title, topicId, questions: [] },
              ],
            }
          : t
      )
    );
    try {
      await addSubtopic(topicId, title);
    } catch {
      setData((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, subtopics: t.subtopics.filter((st) => st.id !== tempId) }
            : t
        )
      );
    }
  };

  type QuestionFormData = {
    title: string;
    level: Difficulty;
    link: string;
    hint: string;
    hintFormat: HintFormat;
    understanding: Understanding;
    solvedCount: number;
    codes: { language: string; code: string }[];
  };

  const findQuestion = (id: string): Question | undefined => {
    for (const t of data) {
      const q =
        (t.questions ?? []).find((q) => q.id === id) ??
        t.subtopics.flatMap((st) => st.questions).find((q) => q.id === id);
      if (q) return q;
    }
  };

  const handleAddQuestion = async (questionData: QuestionFormData) => {
    const { topicId, subtopicId } = dialogConfig;
    if (!topicId) return;
    const tempId = `temp-${Date.now()}`;
    const tempQuestion: Question = {
      id: tempId,
      title: questionData.title,
      level: questionData.level,
      link: questionData.link || null,
      hint: questionData.hint || null,
      hintFormat: questionData.hint ? questionData.hintFormat : null,
      understanding: questionData.understanding,
      solvedCount: 0,
      topicId,
      subtopicId: subtopicId ?? null,
      codes: questionData.codes.map((c, i) => ({
        id: `temp-c-${i}`,
        questionId: tempId,
        title: null,
        ...c,
      })),
    };
    setData((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        if (subtopicId)
          return {
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === subtopicId
                ? { ...st, questions: [...st.questions, tempQuestion] }
                : st
            ),
          };
        return { ...t, questions: [...(t.questions ?? []), tempQuestion] };
      })
    );
    try {
      await addQuestion(topicId, subtopicId, questionData);
    } catch {
      setData((prev) =>
        prev.map((t) => {
          if (t.id !== topicId) return t;
          if (subtopicId)
            return {
              ...t,
              subtopics: t.subtopics.map((st) =>
                st.id === subtopicId
                  ? {
                      ...st,
                      questions: st.questions.filter((q) => q.id !== tempId),
                    }
                  : st
              ),
            };
          return {
            ...t,
            questions: (t.questions ?? []).filter((q) => q.id !== tempId),
          };
        })
      );
    }
  };

  const handleUpdateQuestion = async (
    questionId: string,
    patch: Partial<QuestionFormData>
  ) => {
    const existing = findQuestion(questionId);
    if (!existing) return;
    const merged: QuestionFormData = {
      title: existing.title,
      level: existing.level,
      link: existing.link ?? "",
      hint: existing.hint ?? "",
      hintFormat: existing.hintFormat ?? "Text",
      understanding: existing.understanding ?? "None",
      solvedCount: existing.solvedCount,
      codes: existing.codes.map((c) => ({
        language: c.language,
        code: c.code,
      })),
      ...patch,
    };
    const optimistic: Question = {
      ...existing,
      ...merged,
      solvedCount: merged.solvedCount,
      link: merged.link || null,
      hint: merged.hint || null,
      hintFormat: merged.hint ? merged.hintFormat : null,
      codes: merged.codes.map((c, i) => ({
        id: existing.codes[i]?.id ?? `temp-c-${i}`,
        questionId,
        title: null,
        ...c,
      })),
    };
    const snapshot = data;
    const replaceQ = (qs: Question[]) =>
      qs.map((q) => (q.id === questionId ? optimistic : q));
    setData((prev) =>
      prev.map((t) => ({
        ...t,
        questions: replaceQ(t.questions ?? []),
        subtopics: t.subtopics.map((st) => ({
          ...st,
          questions: replaceQ(st.questions),
        })),
      }))
    );
    try {
      await updateQuestion(questionId, merged);
    } catch {
      setData(snapshot);
    }
  };

  const handleOpenEditDialog = (question: Question) => {
    setDialogConfig({
      isOpen: true,
      topicId: question.topicId ?? null,
      subtopicId: question.subtopicId ?? null,
      editQuestion: question,
    });
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
                onEditQuestion={handleOpenEditDialog}
                onUnderstandingChange={(questionId, understanding) =>
                  handleUpdateQuestion(questionId, { understanding })
                }
                onSolvedCountChange={(questionId, solvedCount) =>
                  handleUpdateQuestion(questionId, { solvedCount })
                }
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
        onSave={(questionData) =>
          dialogConfig.editQuestion
            ? handleUpdateQuestion(dialogConfig.editQuestion.id, questionData)
            : handleAddQuestion({ ...questionData, solvedCount: 0 })
        }
        initialData={dialogConfig.editQuestion ?? undefined}
      />
    </div>
  );
}
