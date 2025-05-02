import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../trpc";
export const appRouter = createTRPCRouter({
  hello: baseProcedure.query(() => {
    return {
      greeting: `hello world`,
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
