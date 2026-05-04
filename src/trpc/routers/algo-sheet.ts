import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
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
        codes: z.array(
          z.object({
            title: z.string().optional(),
            language: z.string(),
            code: z.string(),
          })
        ),
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
        codes: z.array(
          z.object({
            title: z.string().optional(),
            language: z.string(),
            code: z.string(),
          })
        ),
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

  deleteTopic: protectedProcedure
    .input(z.object({ topicId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleted = await prisma.topic.deleteMany({
        where: { id: input.topicId, userId: ctx.auth.user.id },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      return { success: true };
    }),

  deleteSubtopic: protectedProcedure
    .input(z.object({ subtopicId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleted = await prisma.subtopic.deleteMany({
        where: {
          id: input.subtopicId,
          topic: { userId: ctx.auth.user.id },
        },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subtopic not found",
        });
      }

      return { success: true };
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleted = await prisma.question.deleteMany({
        where: {
          id: input.questionId,
          OR: [
            { topic: { userId: ctx.auth.user.id } },
            { subtopic: { topic: { userId: ctx.auth.user.id } } },
          ],
        },
      });

      if (deleted.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      return { success: true };
    }),
});
