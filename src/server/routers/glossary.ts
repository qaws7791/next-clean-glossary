import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc";
import { db } from "@/db"; // Drizzle DB 인스턴스
import { glossaries } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const glossaryRouter = createTRPCRouter({
  // 용어 목록 생성
  create: protectedProcedure // 로그인한 사용자만 접근 가능
    .input(
      z.object({
        name: z.string().min(1, "이름을 입력해주세요."),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id; // 세션에서 사용자 ID 가져오기
      const [newGlossary] = await db
        .insert(glossaries)
        .values({
          userId: userId,
          name: input.name,
          description: input.description,
        })
        .returning();
      return newGlossary;
    }),

  // 사용자 본인의 용어 목록 조회
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return db
      .select()
      .from(glossaries)
      .where(eq(glossaries.userId, userId))
      .orderBy(glossaries.createdAt);
  }),

  // 특정 용어 목록 상세 조회 (본인 또는 공개된 목록)
  getById: publicProcedure // 공개/비공개 처리를 위해 publicProcedure 사용 후 내부에서 권한 체크
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const glossary = await db.query.glossaries.findFirst({
        where: eq(glossaries.id, input.id),
        with: {
          terms: {
            // 관련 용어도 함께 로드
            orderBy: (terms, { asc }) => [asc(terms.term)],
          },
        },
      });

      if (!glossary) {
        throw new Error("Glossary not found"); // tRPC 에러로 변환 필요
      }

      // 비공개 목록인데 본인이 아니면 접근 불가
      if (!glossary.isPublic && glossary.userId !== ctx.user?.id) {
        throw new Error("Unauthorized"); // tRPC 에러로 변환 필요
      }

      return glossary;
    }),

  // 용어 목록 수정
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 본인 소유인지 확인하는 로직 추가 (where 절에 userId 조건)
      const [updatedGlossary] = await db
        .update(glossaries)
        .set({
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          updatedAt: new Date(), // 업데이트 시간 갱신
        })
        .where(and(eq(glossaries.id, input.id), eq(glossaries.userId, userId)))
        .returning();
      if (!updatedGlossary)
        throw new Error("Glossary not found or unauthorized");
      return updatedGlossary;
    }),

  // 용어 목록 삭제
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 본인 소유인지 확인하는 로직 추가
      const glossary = await db
        .select()
        .from(glossaries)
        .where(and(eq(glossaries.id, input.id), eq(glossaries.userId, userId)));
      if (!glossary.length) {
        throw new Error("Glossary not found or unauthorized");
      }

      await db
        .delete(glossaries)
        .where(and(eq(glossaries.id, input.id), eq(glossaries.userId, userId)));

      return { success: true };
    }),

  // 용어 목록 공유 설정 변경 (update 와 유사하지만 명시적 분리)
  setSharing: protectedProcedure
    .input(z.object({ id: z.string(), isPublic: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // `update` 프로시저와 동일한 로직으로 isPublic 필드만 업데이트
      const userId = ctx.user.id;
      const [updatedGlossary] = await db
        .update(glossaries)
        .set({ isPublic: input.isPublic, updatedAt: new Date() })
        .where(and(eq(glossaries.id, input.id), eq(glossaries.userId, userId)))
        .returning({ id: glossaries.id, isPublic: glossaries.isPublic }); // 필요한 필드만 반환 가능
      if (!updatedGlossary)
        throw new Error("Glossary not found or unauthorized");
      return updatedGlossary;
    }),
});
