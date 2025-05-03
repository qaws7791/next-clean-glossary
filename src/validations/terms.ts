import { z } from "zod";

export const createTermSchema = z.object({
  glossaryId: z.string().uuid(),
  term: z.string().min(1, { message: "용어를 입력하세요." }),
  definition: z.string().min(1, { message: "정의를 입력하세요." }),
});

export type CreateTermInput = z.infer<typeof createTermSchema>;
