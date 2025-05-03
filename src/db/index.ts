import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema"; // 스키마를 가져옵니다.
export const db = drizzle({
  connection: {
    url: process.env.DB_FILE_NAME!,
  },
  schema,
});
