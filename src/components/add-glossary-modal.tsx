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
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { FormEvent, useState } from "react";
import { z } from "zod";

const addGlossarySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  description: z.string().optional(),
});

export default function AddGlossaryModal() {
  const utils = trpc.useUtils();
  const mutation = trpc.glossary.create.useMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    console.log("onOpenChange", open);
    if (!open) {
      setName("");
      setDescription("");
      setError(null);
    }
  };
  const onOpen = () => {
    setIsOpen(true);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addGlossarySchema.safeParse({ name, description });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError(null);
    mutation.mutate(
      {
        name: result.data.name,
        description: result.data.description,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setName("");
          setDescription("");
          utils.glossary.listMine.invalidate();
        },
        onError: (error) => {
          console.error("Error creating glossary:", error);
          setError("용어 목록 생성에 실패했습니다.");
        },
      }
    );
  };
  return (
    <>
      <Button
        onPress={onOpen}
        isIconOnly
        aria-label="목록 추가하기"
        size="sm"
        variant="ghost"
        endContent
      >
        <Icon icon="ep:plus" />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                목록 추가하기
              </ModalHeader>
              <Form
                onSubmit={onSubmit}
                validationErrors={error ? { name: error } : {}}
              >
                <ModalBody className="w-full">
                  <Input
                    type="text"
                    placeholder="목록 이름"
                    value={name}
                    onValueChange={setName}
                    required
                    errorMessage={error}
                    fullWidth
                  />
                  <Input
                    type="text"
                    placeholder="설명"
                    value={description}
                    onValueChange={setDescription}
                    required
                    errorMessage={error}
                    fullWidth
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
