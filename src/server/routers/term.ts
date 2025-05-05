import { db } from "@/db";
import { glossaries, terms } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc";
import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const termRouter = createTRPCRouter({
  list: protectedProcedure // glossaryId로 용어 목록 조회(페이지 기반 페이지 네이션)
    .input(
      z.object({
        glossaryId: z.string(),
        page: z.number().min(1).default(1), // 페이지 번호 (1부터 시작)
        pageSize: z.number().min(1).max(100).default(10), // 페이지당 항목 수
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 1. glossaryId로 glossary 조회하여 존재하는지, 본인 소유인지 확인
      const glossary = await db.query.glossaries.findFirst({
        where: and(
          eq(glossaries.id, input.glossaryId),
          eq(glossaries.userId, userId)
        ),
      });
      if (!glossary) throw new Error("Glossary not found or unauthorized");

      // 2. 용어 목록 조회 (페이지 기반 페이지 네이션)
      const termsList = await db
        .select()
        .from(terms)
        .where(eq(terms.glossaryId, input.glossaryId))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize)
        .orderBy(terms.createdAt); // 정렬 기준 추가
      const [totalCount] = await db
        .select({ count: count() })
        .from(terms)
        .where(eq(terms.glossaryId, input.glossaryId));

      return {
        data: termsList,
        totalCount: totalCount.count, // 전체 용어 수
        currentPage: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(totalCount.count / input.pageSize), // 전체 페이지 수
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        glossaryId: z.string(),
        term: z.string().min(1),
        definition: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 1. glossaryId로 glossary 조회하여 존재하는지, 본인 소유인지 확인
      const glossary = await db.query.glossaries.findFirst({
        where: and(
          eq(glossaries.id, input.glossaryId),
          eq(glossaries.userId, userId)
        ),
      });
      if (!glossary) throw new Error("Glossary not found or unauthorized");

      // 2. 용어 추가
      const [newTerm] = await db
        .insert(terms)
        .values({
          glossaryId: input.glossaryId,
          term: input.term,
          definition: input.definition,
        })
        .returning();
      return newTerm;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(), // term id
        term: z.string().min(1).optional(),
        definition: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 1. termId로 term 조회하고, 해당 term의 glossaryId를 통해 glossary 소유권 확인
      const termToUpdate = await db.query.terms.findFirst({
        where: eq(terms.id, input.id),
        with: { glossary: true }, // 연관된 glossary 정보 포함
      });

      if (!termToUpdate || termToUpdate.glossary.userId !== userId) {
        throw new Error("Term not found or unauthorized");
      }

      // 2. 용어 업데이트
      const [updatedTerm] = await db
        .update(terms)
        .set({
          term: input.term,
          definition: input.definition,
          updatedAt: new Date(),
        })
        .where(eq(terms.id, input.id))
        .returning();
      return updatedTerm;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() })) // term id
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 1. termId로 term 조회하고 소유권 확인 (update와 동일 로직)
      const termToDelete = await db.query.terms.findFirst({
        where: eq(terms.id, input.id),
        with: { glossary: true },
      });
      if (!termToDelete || termToDelete.glossary.userId !== userId) {
        throw new Error("Term not found or unauthorized");
      }
      // 2. 용어 삭제
      try {
        await db.delete(terms).where(eq(terms.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting term:", error);
        throw new Error("Failed to delete term");
      }
    }),

  search: publicProcedure // 검색은 공개 목록에서도 가능해야 할 수 있음
    .input(
      z.object({
        glossaryId: z.string(),
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 1. glossaryId로 glossary 조회하여 존재하는지, 공개 목록인지 또는 본인 소유인지 확인
      const glossary = await db.query.glossaries.findFirst({
        where: eq(glossaries.id, input.glossaryId),
        columns: { id: true, userId: true, isPublic: true }, // 필요한 최소 정보만 조회
      });
      if (!glossary) throw new Error("Glossary not found");

      const isOwner = glossary.userId === ctx?.user?.id;
      if (!glossary.isPublic && !isOwner) {
        throw new Error("Unauthorized");
      }

      // 2. 용어 검색 (Drizzle의 like 사용)
      const searchResults = await db
        .select()
        .from(terms)
        .where(
          and(
            eq(terms.glossaryId, input.glossaryId),
            // 간단한 예: term 또는 definition 중 하나라도 query를 포함하면 검색
            sql`(${terms.term} LIKE ${"%" + input.query + "%"} OR ${
              terms.definition
            } LIKE ${"%" + input.query + "%"})`
            // SQLite FTS (Full-Text Search) 사용 시 더 효율적인 검색 가능
          )
        )
        .orderBy(terms.term); // 정렬 기준 추가

      return searchResults;
    }),
});
