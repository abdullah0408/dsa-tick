"use server";

import {
  Difficulty,
  HintFormat,
  Understanding,
} from "@/components/algo-sheet/types";
import { requireAuth } from "@/lib/auth.utils";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getCurrentUserId() {
  const session = await requireAuth();
  return session.user.id;
}

export async function getTopics() {
  const userId = await getCurrentUserId();

  return prisma.topic.findMany({
    where: { userId },
    include: {
      questions: {
        where: { subtopicId: null },
        include: { codes: { orderBy: { id: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      subtopics: {
        orderBy: { createdAt: "asc" },
        include: {
          questions: {
            include: { codes: { orderBy: { id: "asc" } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function addTopic(title: string) {
  const userId = await getCurrentUserId();

  await prisma.topic.create({
    data: { title, userId },
  });
  revalidatePath("/");
}

export async function addSubtopic(topicId: string, title: string) {
  await prisma.subtopic.create({
    data: { title, topicId },
  });
  revalidatePath("/");
}

export async function addQuestion(
  topicId: string,
  subtopicId: string | null,
  data: {
    title: string;
    level: Difficulty;
    link: string;
    hint: string;
    hintFormat: HintFormat;
    understanding: Understanding;
    codes: { language: string; code: string }[];
  }
) {
  await prisma.question.create({
    data: {
      title: data.title,
      level: data.level,
      link: data.link || null,
      hint: data.hint || null,
      hintFormat: data.hint ? data.hintFormat : null,
      understanding: data.understanding,
      solvedCount: 0,
      topicId,
      subtopicId: subtopicId ?? null,
      codes: {
        create: data.codes.map((c) => ({
          language: c.language,
          code: c.code,
        })),
      },
    },
  });
  revalidatePath("/");
}

export async function updateQuestion(
  id: string,
  data: {
    title: string;
    level: Difficulty;
    link: string;
    hint: string;
    hintFormat: HintFormat;
    understanding: Understanding;
    solvedCount: number;
    codes: { language: string; code: string }[];
  }
) {
  await prisma.code.deleteMany({ where: { questionId: id } });
  await prisma.question.update({
    where: { id },
    data: {
      title: data.title,
      level: data.level,
      link: data.link || null,
      hint: data.hint || null,
      hintFormat: data.hint ? data.hintFormat : null,
      understanding: data.understanding,
      solvedCount: data.solvedCount,
      codes: {
        create: data.codes.map((c) => ({
          language: c.language,
          code: c.code,
        })),
      },
    },
  });
  revalidatePath("/");
}

export async function updateUnderstanding(
  questionId: string,
  understanding: Understanding
) {
  await prisma.question.update({
    where: { id: questionId },
    data: { understanding },
  });
  revalidatePath("/");
}
