import { trpc } from "@/lib/trpc/client";
import { Button, Form, Input, Textarea } from "@heroui/react";
import { FormEvent, useState } from "react";
import { z } from "zod";

interface TermFormProps {
  glossaryId: string;
}

export const createTermSchema = z.object({
  term: z.string().min(1, { message: "용어를 입력하세요." }),
  definition: z.string().min(1, { message: "정의를 입력하세요." }),
});

export default function TermForm({ glossaryId }: TermFormProps) {
  const mutation = trpc.term.create.useMutation();
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [errors, setErrors] = useState<{
    term?: string[];
    definition?: string[];
  }>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = createTermSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate(
      {
        glossaryId: glossaryId,
        term: data.term as string,
        definition: data.definition as string,
      },
      {
        onSuccess: () => {
          setTerm("");
          setDefinition("");
          setErrors({});
        },
        onError: (error) => {
          console.error("Error creating term:", error);
        },
      }
    );
  };

  return (
    <Form onSubmit={onSubmit} validationErrors={errors}>
      <Input
        label="용어"
        name="term"
        placeholder="용어를 입력하세요."
        value={term}
        onValueChange={setTerm}
        errorMessage={errors.term ? errors.term[0] : undefined}
        isInvalid={!!errors.term}
      />
      <Textarea
        label="정의"
        name="definition"
        placeholder="정의를 입력하세요."
        value={definition}
        onValueChange={setDefinition}
        errorMessage={errors.definition ? errors.definition[0] : undefined}
        isInvalid={!!errors.definition}
      />
      <Button type="submit">추가하기</Button>
    </Form>
  );
}
