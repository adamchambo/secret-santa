"use client";

import { CreateUser, postUsers, User } from "@/src/lib/api/generated/client";
import FormShell from "./form-shell";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

type RegisterFormValues = CreateUser;

const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    console.log(data);
    try {
      const userData: CreateUser = {
        email: data.email,
        password: data.password,
      };
      const response: User = await postUsers(userData);
      console.log(response);
    } catch (error) {
      console.error("Error registering user:", error);
      setError("root", { message: "Failed to register. Please try again." });
    }
  }

  return (
    <FormShell
      title="Register"
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
