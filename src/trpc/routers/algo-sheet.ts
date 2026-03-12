import prisma from "@/lib/prisma";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const algoSheetRouter = createTRPCRouter({
  addTopic: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const topic = await prisma.topic.create({
        data: { title: input.title, userId: ctx.auth.user.id },
      });
      return topic;
    }),
  addSubtopic: protectedProcedure
    .input(z.object({ topicId: z.string(), title: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const subtopic = await prisma.subtopic.create({
        data: { title: input.title, topicId: input.topicId },
      });
      return subtopic;
    }),

  addTopicQuestion: protectedProcedure
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

  addSubtopicQuestion: protectedProcedure
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
