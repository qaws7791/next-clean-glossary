import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 사용자의 기본 정보를 저장하는 테이블
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 사용자 세션 정보를 저장하는 테이블
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// 계정 정보를 저장하는 테이블 (주로 OAuth 또는 이메일/비밀번호 인증 정보)
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 이메일 인증 등 확인 절차에 사용되는 토큰 정보를 저장하는 테이블
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// --- 애플리케이션 관련 테이블 --- //

export const glossaries = sqliteTable("glossaries", {
  // 용어 목록 고유 ID (UUID 사용 권장)
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Better Auth의 'user' 테이블 'id'(text 타입)를 참조하는 외래키.
  // 사용자 삭제 시 관련 용어 목록도 삭제 (cascade).
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // 용어 목록 이름
  description: text("description"), // 용어 목록 설명 (선택적)
  isPublic: integer("is_public", { mode: "boolean" }).default(false), // 공개 여부 플래그
  // 생성 시간 (기본값: 현재 시간)
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  // 수정 시간 (기본값: 현재 시간, 업데이트 시 갱신 필요)
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// 개별 용어 정보를 저장하는 테이블
export const terms = sqliteTable("terms", {
  // 용어 고유 ID (UUID 사용 권장)
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // 'glossaries' 테이블의 'id'(text/UUID 타입)를 참조하는 외래키.
  // 용어 목록 삭제 시 관련 용어도 삭제 (cascade).
  glossaryId: text("glossary_id")
    .notNull()
    .references(() => glossaries.id, { onDelete: "cascade" }),
  term: text("term").notNull(), // 용어 명칭
  definition: text("definition").notNull(), // 용어 정의
  // 생성 시간 (기본값: 현재 시간)
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  // 수정 시간 (기본값: 현재 시간, 업데이트 시 갱신 필요)
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  glossaries: many(glossaries),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const glossaryRelations = relations(glossaries, ({ one, many }) => ({
  user: one(user, { fields: [glossaries.userId], references: [user.id] }),
  terms: many(terms),
}));

export const termRelations = relations(terms, ({ one }) => ({
  glossary: one(glossaries, {
    fields: [terms.glossaryId],
    references: [glossaries.id],
  }),
}));
