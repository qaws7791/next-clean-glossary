import { createTRPCRouter } from "../trpc";
import { glossaryRouter } from "@/server/routers/glossary";
import { termRouter } from "@/server/routers/term";
export const appRouter = createTRPCRouter({
  glossary: glossaryRouter,
  term: termRouter,
});
export type AppRouter = typeof appRouter;
