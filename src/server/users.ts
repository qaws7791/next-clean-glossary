"use server";
import { auth } from "@/lib/auth";

export const signIn = async (
  state:
    | {
        errors?: {
          email?: string[];
          password?: string[];
        };
        message?: string;
      }
    | undefined,
  formData: FormData
) => {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  console.log({ email, password });
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      message: "You are now signed in",
    };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }
};

export const signUp = async (
  state:
    | {
        errors?: {
          name?: string[];
          email?: string[];
          password?: string[];
        };
        message?: string;
      }
    | undefined,
  formData: FormData
) => {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    return {
      message: "Check your email for a confirmation link",
    };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        email: ["Email already exists"],
      },
    };
  }
};
