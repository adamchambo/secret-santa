"use client";

import FormShell from "./form-shell";
import { AuthFormValues, useAuthForm } from "../hooks/use-auth-form";
import { registerUser } from "../api";
import { useRouter } from "next/router";


export default function RegisterForm() {
  const navigate = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAuthForm();

  async function onSubmit(data: AuthFormValues) {
    console.log(data);
    try {
      const user = await registerUser(data.email, data.password);
      if (!user) throw new Error("User registration failed");
      console.log("Registered user:", user);
      navigate.push("/dashboard");
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
