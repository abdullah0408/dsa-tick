import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

/**
 * Better Auth configuration for this Next.js app.
 * For more options and setup guide, see: https://www.better-auth.com/docs/introduction
 * & https://www.better-auth.com/docs/integrations/next
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
