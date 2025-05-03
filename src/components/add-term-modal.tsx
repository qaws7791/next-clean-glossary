"use client";
import { trpc } from "@/lib/trpc/client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Input,
  Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { FormEvent, useState } from "react";
import { z } from "zod";

const addTermSchema = z.object({
  term: z.string().min(1, "단어를 입력해주세요."),
  definition: z.string().min(1, "정의를 입력해주세요."),
});

export default function AddTermModal({ glossaryId }: { glossaryId: string }) {
  const utils = trpc.useUtils();
  const mutation = trpc.term.create.useMutation();
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    console.log("onOpenChange", open);
    if (!open) {
      setTerm("");
      setDefinition("");
      setError(null);
    }
  };
  const onOpen = () => {
    setIsOpen(true);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addTermSchema.safeParse({ term, definition });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError(null);
    mutation.mutate(
      {
        glossaryId,
        term: result.data.term,
        definition: result.data.definition,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setTerm("");
          setDefinition("");
          utils.term.list.invalidate();
        },
        onError: (error) => {
          console.error("Error creating term:", error);
          setError("단어 추가에 실패했습니다.");
        },
      }
    );
  };
  return (
    <>
      <Button
        onPress={onOpen}
        aria-label="단어 추가하기"
        color="primary"
        startContent={<Icon icon="ep:plus" />}
      >
        단어 추가하기
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                단어 추가하기
              </ModalHeader>
              <Form
                onSubmit={onSubmit}
                validationErrors={error ? { name: error } : {}}
              >
                <ModalBody className="w-full">
                  <Input
                    type="text"
                    placeholder="단어"
                    value={term}
                    onValueChange={setTerm}
                    required
                    errorMessage={error}
                    fullWidth
                  />
                  <Textarea
                    placeholder="정의"
                    value={definition}
                    onValueChange={setDefinition}
                    isRequired
                    errorMessage={error}
                    fullWidth
                    minRows={7}
                  />
                </ModalBody>
                <ModalFooter className="w-full">
                  <Button type="submit" color="primary" className="w-full">
                    추가하기
                  </Button>
                </ModalFooter>
              </Form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
