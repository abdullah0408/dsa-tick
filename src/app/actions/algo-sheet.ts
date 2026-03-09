"use server";

import {
  Difficulty,
  HintFormat,
  Understanding,
} from "@/components/algo-sheet/types";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const HARDCODED_USER_ID = "abc";

export async function getTopics() {
  return prisma.topic.findMany({
    where: { userId: HARDCODED_USER_ID },
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
  await prisma.topic.create({
    data: { title, userId: HARDCODED_USER_ID },
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
