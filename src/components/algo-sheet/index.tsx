"use client";

import { updateQuestion } from "@/app/actions/algo-sheet";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
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
  const trpc = useTRPC();

  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    topicId: string | null;
    subtopicId: string | null;
    editQuestion: Question | null;
  }>({ isOpen: false, topicId: null, subtopicId: null, editQuestion: null });

  const addTopicMutation = useMutation(
    trpc.algoSheet.addTopic.mutationOptions({
      onMutate: ({ title }) => {
        const tempId = crypto.randomUUID();
        setData((prev) => [
          ...prev,
          { id: tempId, title, userId: "abc", questions: [], subtopics: [] },
        ]);
        return { tempId };
      },
      onError: (error, _, ctx) => {
        console.error("addTopic error:", error);
        setData((prev) => prev.filter((t) => t.id !== ctx?.tempId));
      },
      onSuccess: (newTopic, _, ctx) => {
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.tempId ? { ...t, id: newTopic.id } : t
          )
        );
      },
    })
  );

  const addSubtopicMutation = useMutation(
    trpc.algoSheet.addSubtopic.mutationOptions({
      onMutate: ({ topicId, title }) => {
        const tempId = crypto.randomUUID();
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
        return { tempId, topicId };
      },
      onError: (error, _, ctx) => {
        console.error("addSubtopic error:", error);
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.topicId
              ? {
                  ...t,
                  subtopics: t.subtopics.filter((st) => st.id !== ctx.tempId),
                }
              : t
          )
        );
      },
      onSuccess: (newSubtopic, _, ctx) => {
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.topicId
              ? {
                  ...t,
                  subtopics: t.subtopics.map((st) =>
                    st.id === ctx.tempId ? { ...st, id: newSubtopic.id } : st
                  ),
                }
              : t
          )
        );
      },
    })
  );

  const addTopicQuestionMutation = useMutation(
    trpc.algoSheet.addTopicQuestion.mutationOptions({
      onMutate: (input) => {
        const tempId = crypto.randomUUID();
        const tempQuestion: Question = {
          id: tempId,
          title: input.title,
          level: input.level,
          link: input.link || null,
          hint: input.hint || null,
          hintFormat: input.hint ? input.hintFormat : null,
          understanding: input.understanding,
          solvedCount: 0,
          topicId: input.topicId,
          subtopicId: null,
          codes: input.codes.map((c, i) => ({
            id: `temp-c-${i}`,
            questionId: tempId,
            title: null,
            ...c,
          })),
        };
        setData((prev) =>
          prev.map((t) =>
            t.id === input.topicId
              ? { ...t, questions: [...(t.questions ?? []), tempQuestion] }
              : t
          )
        );
        return { tempId, topicId: input.topicId };
      },
      onError: (error, _, ctx) => {
        console.error("addTopicQuestion error:", error);
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.topicId
              ? {
                  ...t,
                  questions: (t.questions ?? []).filter(
                    (q) => q.id !== ctx.tempId
                  ),
                }
              : t
          )
        );
      },
    })
  );

  const addSubtopicQuestionMutation = useMutation(
    trpc.algoSheet.addSubtopicQuestion.mutationOptions({
      onMutate: (input) => {
        const tempId = crypto.randomUUID();
        const tempQuestion: Question = {
          id: tempId,
          title: input.title,
          level: input.level,
          link: input.link || null,
          hint: input.hint || null,
          hintFormat: input.hint ? input.hintFormat : null,
          understanding: input.understanding,
          solvedCount: 0,
          topicId: null,
          subtopicId: input.subtopicId,
          codes: input.codes.map((c, i) => ({
            id: `temp-c-${i}`,
            questionId: tempId,
            title: null,
            ...c,
          })),
        };
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === input.subtopicId
                ? { ...st, questions: [...st.questions, tempQuestion] }
                : st
            ),
          }))
        );
        return { tempId, subtopicId: input.subtopicId };
      },
      onError: (error, _, ctx) => {
        console.error("addSubtopicQuestion error:", error);
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === ctx?.subtopicId
                ? {
                    ...st,
                    questions: st.questions.filter((q) => q.id !== ctx.tempId),
                  }
                : st
            ),
          }))
        );
      },
    })
  );

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

  const handleAddQuestion = (questionData: QuestionFormData) => {
    const { topicId, subtopicId } = dialogConfig;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { solvedCount: _solvedCount, ...rest } = questionData;
    if (subtopicId) {
      addSubtopicQuestionMutation.mutate({ subtopicId, ...rest });
    } else if (topicId) {
      addTopicQuestionMutation.mutate({ topicId, ...rest });
    }
  };

  const findQuestion = (id: string): Question | undefined => {
    for (const t of data) {
      const q =
        (t.questions ?? []).find((q) => q.id === id) ??
        t.subtopics.flatMap((st) => st.questions).find((q) => q.id === id);
      if (q) return q;
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
                onAddSubtopic={(topicId, title) =>
                  addSubtopicMutation.mutate({ topicId, title })
                }
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
            <AddBigTopicRow
              onAdd={(title) => addTopicMutation.mutate({ title })}
            />
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
