"use client";

import { updateQuestion } from "@/app/actions/algo-sheet";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { RiFilterOffLine, RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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

type SolvedFilter = "all" | "solved" | "unsolved";
type DifficultyFilter = "all" | Difficulty;
type UnderstandingFilter = "all" | Understanding;

export function AlgoSheet({ initialData }: { initialData: Topic[] }) {
  const [data, setData] = useState<Topic[]>(initialData);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [understandingFilter, setUnderstandingFilter] =
    useState<UnderstandingFilter>("all");
  const [solvedFilter, setSolvedFilter] = useState<SolvedFilter>("all");
  const trpc = useTRPC();

  const stats = useMemo(() => {
    const questions = data.flatMap((topic) => [
      ...(topic.questions ?? []),
      ...topic.subtopics.flatMap((subtopic) => subtopic.questions),
    ]);
    const solved = questions.filter((question) => question.solvedCount > 0);

    return {
      topics: data.length,
      questions: questions.length,
      solved: solved.length,
    };
  }, [data]);

  const visibleData = useMemo(() => {
    const term = search.trim().toLowerCase();

    const questionMatchesFilters = (question: Question) => {
      if (difficultyFilter !== "all" && question.level !== difficultyFilter) {
        return false;
      }
      if (
        understandingFilter !== "all" &&
        question.understanding !== understandingFilter
      ) {
        return false;
      }
      if (solvedFilter === "solved" && question.solvedCount === 0) {
        return false;
      }
      if (solvedFilter === "unsolved" && question.solvedCount > 0) {
        return false;
      }
      return true;
    };

    const questionMatchesSearch = (question: Question) => {
      if (!term) return true;
      return [
        question.title,
        question.link ?? "",
        question.hint ?? "",
        ...question.codes.flatMap((code) => [
          code.title ?? "",
          code.language,
          code.code,
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    };

    return data
      .map((topic) => {
        const topicMatches = topic.title.toLowerCase().includes(term);
        const topicQuestions = topic.questions.filter(
          (question) =>
            questionMatchesFilters(question) &&
            (topicMatches || questionMatchesSearch(question))
        );
        const subtopics = topic.subtopics
          .map((subtopic) => {
            const subtopicMatches = subtopic.title.toLowerCase().includes(term);
            return {
              ...subtopic,
              questions: subtopic.questions.filter(
                (question) =>
                  questionMatchesFilters(question) &&
                  (topicMatches ||
                    subtopicMatches ||
                    questionMatchesSearch(question))
              ),
            };
          })
          .filter(
            (subtopic) =>
              subtopic.questions.length > 0 ||
              (!term &&
                difficultyFilter === "all" &&
                solvedFilter === "all" &&
                understandingFilter === "all")
          );

        return {
          ...topic,
          questions: topicQuestions,
          subtopics,
        };
      })
      .filter(
        (topic) =>
          topic.questions.length > 0 ||
          topic.subtopics.length > 0 ||
          (!term &&
            difficultyFilter === "all" &&
            solvedFilter === "all" &&
            understandingFilter === "all")
      );
  }, [data, difficultyFilter, search, solvedFilter, understandingFilter]);

  const visibleQuestionCount = useMemo(
    () =>
      visibleData.reduce(
        (total, topic) =>
          total +
          topic.questions.length +
          topic.subtopics.reduce(
            (subTotal, subtopic) => subTotal + subtopic.questions.length,
            0
          ),
        0
      ),
    [visibleData]
  );

  const hasActiveFilters =
    search ||
    difficultyFilter !== "all" ||
    understandingFilter !== "all" ||
    solvedFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setDifficultyFilter("all");
    setUnderstandingFilter("all");
    setSolvedFilter("all");
  };

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
        toast.error("Failed to add topic. It was not saved to database.");
      },
      onSuccess: (newTopic, variables, ctx) => {
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.tempId ? { ...t, id: newTopic.id } : t
          )
        );
        toast.success(`Topic added: ${variables.title}`);
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
        toast.error("Failed to add subtopic. It was not saved to database.");
      },
      onSuccess: (newSubtopic, variables, ctx) => {
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
        toast.success(`Subtopic added: ${variables.title}`);
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
        toast.error("Failed to add question. It was not saved to database.");
      },
      onSuccess: (newQuestion, variables, ctx) => {
        setData((prev) =>
          prev.map((t) =>
            t.id === ctx?.topicId
              ? {
                  ...t,
                  questions: (t.questions ?? []).map((q) =>
                    q.id === ctx.tempId
                      ? { ...q, id: newQuestion.id, codes: newQuestion.codes }
                      : q
                  ),
                }
              : t
          )
        );
        toast.success(`Question added: ${variables.title}`);
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
        toast.error("Failed to add question. It was not saved to database.");
      },
      onSuccess: (newQuestion, variables, ctx) => {
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === ctx?.subtopicId
                ? {
                    ...st,
                    questions: st.questions.map((q) =>
                      q.id === ctx.tempId
                        ? {
                            ...q,
                            id: newQuestion.id,
                            codes: newQuestion.codes,
                          }
                        : q
                    ),
                  }
                : st
            ),
          }))
        );
        toast.success(`Question added: ${variables.title}`);
      },
    })
  );

  const deleteTopicMutation = useMutation(
    trpc.algoSheet.deleteTopic.mutationOptions({
      onMutate: ({ topicId }) => {
        const snapshot = data;
        setData((prev) => prev.filter((t) => t.id !== topicId));
        return { snapshot };
      },
      onError: (_error, _input, ctx) => {
        if (ctx?.snapshot) setData(ctx.snapshot);
        toast.error("Failed to delete topic.");
      },
      onSuccess: () => {
        toast.success("Topic deleted.");
      },
    })
  );

  const deleteSubtopicMutation = useMutation(
    trpc.algoSheet.deleteSubtopic.mutationOptions({
      onMutate: ({ subtopicId }) => {
        const snapshot = data;
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            subtopics: t.subtopics.filter((st) => st.id !== subtopicId),
          }))
        );
        return { snapshot };
      },
      onError: (_error, _input, ctx) => {
        if (ctx?.snapshot) setData(ctx.snapshot);
        toast.error("Failed to delete subtopic.");
      },
      onSuccess: () => {
        toast.success("Subtopic deleted.");
      },
    })
  );

  const deleteQuestionMutation = useMutation(
    trpc.algoSheet.deleteQuestion.mutationOptions({
      onMutate: ({ questionId }) => {
        const snapshot = data;
        setData((prev) =>
          prev.map((t) => ({
            ...t,
            questions: (t.questions ?? []).filter((q) => q.id !== questionId),
            subtopics: t.subtopics.map((st) => ({
              ...st,
              questions: st.questions.filter((q) => q.id !== questionId),
            })),
          }))
        );
        return { snapshot };
      },
      onError: (_error, _input, ctx) => {
        if (ctx?.snapshot) setData(ctx.snapshot);
        toast.error("Failed to delete question.");
      },
      onSuccess: () => {
        toast.success("Question deleted.");
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
    codes: { title?: string; language: string; code: string }[];
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
    patch: Partial<QuestionFormData>,
    options?: { notify?: boolean }
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
      if (options?.notify) {
        toast.success(`Question updated: ${merged.title}`);
      }
    } catch {
      setData(snapshot);
      toast.error("Failed to update question. Changes were not saved.");
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Curriculum Database
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Flat, list-based view of algorithms and data structures.
            </p>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {stats.topics} topics · {stats.solved}/{stats.questions} solved
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 border border-border bg-card p-3 shadow-sm lg:flex-row lg:items-center">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 border border-input bg-background px-3 focus-within:ring-1 focus-within:ring-ring">
            <RiSearchLine className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, hint, link, or code..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Difficulty"
              value={difficultyFilter}
              onChange={(value) =>
                setDifficultyFilter(value as DifficultyFilter)
              }
              options={["all", "Easy", "Medium", "Hard"]}
            />
            <FilterSelect
              label="Understanding"
              value={understandingFilter}
              onChange={(value) =>
                setUnderstandingFilter(value as UnderstandingFilter)
              }
              options={["all", "None", "Weak", "Fair", "Good", "Strong"]}
            />
            <FilterSelect
              label="Solved"
              value={solvedFilter}
              onChange={(value) => setSolvedFilter(value as SolvedFilter)}
              options={["all", "solved", "unsolved"]}
            />
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <RiFilterOffLine className="size-4" />
              Reset
            </button>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground lg:ml-auto">
            Showing {visibleQuestionCount} of {stats.questions}
          </div>
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
            {visibleData.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onAddSubtopic={(topicId, title) =>
                  addSubtopicMutation.mutate({ topicId, title })
                }
                onDeleteTopic={(topicId) =>
                  deleteTopicMutation.mutate({ topicId })
                }
                onDeleteSubtopic={(subtopicId) =>
                  deleteSubtopicMutation.mutate({ subtopicId })
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
                onDeleteQuestion={(questionId) =>
                  deleteQuestionMutation.mutate({ questionId })
                }
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
        {visibleData.length === 0 && (
          <div className="border-x border-b border-border bg-card px-4 py-10 text-center">
            <div className="text-sm font-bold text-foreground">
              No matching problems
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        )}
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
            ? handleUpdateQuestion(dialogConfig.editQuestion.id, questionData, {
                notify: true,
              })
            : handleAddQuestion({ ...questionData, solvedCount: 0 })
        }
        initialData={dialogConfig.editQuestion ?? undefined}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex h-9 items-center border border-input bg-background">
      <span className="border-r border-border px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full bg-transparent px-2 text-xs font-bold text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}
