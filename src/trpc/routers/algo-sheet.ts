import prisma from "@/lib/prisma";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

const HARDCODED_USER_ID = "abc";

export const algoSheetRouter = createTRPCRouter({
  addTopic: baseProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const topic = await prisma.topic.create({
        data: { title: input.title, userId: HARDCODED_USER_ID },
      });
      return topic;
    }),
  addSubtopic: baseProcedure
    .input(z.object({ topicId: z.string(), title: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const subtopic = await prisma.subtopic.create({
        data: { title: input.title, topicId: input.topicId },
      });
      return subtopic;
    }),

  addTopicQuestion: baseProcedure
    .input(
      z.object({
        topicId: z.string(),
        title: z.string().min(1),
        level: z.enum(["Easy", "Medium", "Hard"]),
        link: z.string(),
        hint: z.string(),
        hintFormat: z.enum(["Text", "Markdown"]),
        understanding: z.enum(["None", "Weak", "Fair", "Good", "Strong"]),
        codes: z.array(z.object({ language: z.string(), code: z.string() })),
      })
    )
    .mutation(async ({ input }) => {
      const { topicId, codes, hint, hintFormat, link, ...rest } = input;
      return prisma.question.create({
        data: {
          ...rest,
          link: link || null,
          hint: hint || null,
          hintFormat: hint ? hintFormat : null,
          solvedCount: 0,
          topicId,
          codes: { create: codes },
        },
        include: { codes: { orderBy: { id: "asc" } } },
      });
    }),

  addSubtopicQuestion: baseProcedure
    .input(
      z.object({
        subtopicId: z.string(),
        title: z.string().min(1),
        level: z.enum(["Easy", "Medium", "Hard"]),
        link: z.string(),
        hint: z.string(),
        hintFormat: z.enum(["Text", "Markdown"]),
        understanding: z.enum(["None", "Weak", "Fair", "Good", "Strong"]),
        codes: z.array(z.object({ language: z.string(), code: z.string() })),
      })
    )
    .mutation(async ({ input }) => {
      const { subtopicId, codes, hint, hintFormat, link, ...rest } = input;
      return prisma.question.create({
        data: {
          ...rest,
          link: link || null,
          hint: hint || null,
          hintFormat: hint ? hintFormat : null,
          solvedCount: 0,
          subtopicId,
          codes: { create: codes },
        },
        include: { codes: { orderBy: { id: "asc" } } },
      });
    }),
});
