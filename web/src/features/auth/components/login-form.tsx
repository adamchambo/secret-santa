"use client";

import { CreateUser, postUsers, User } from "@/src/lib/api/generated/client";
import FormShell from "./form-shell";
import { AuthFormValues, useAuthForm } from "../hooks/use-auth-form";


export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAuthForm();

  async function onSubmit(data: AuthFormValues) {
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
      title="Login"
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
