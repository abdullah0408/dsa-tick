import { createTRPCRouter } from "../init";
import { algoSheetRouter } from "./algo-sheet";
export const appRouter = createTRPCRouter({
  algoSheet: algoSheetRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
