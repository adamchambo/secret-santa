"use client";

import FormShell from "./form-shell";
import { AuthFormValues, useAuthForm } from "../hooks/use-auth-form";
import { User } from "@supabase/supabase-js";
import { loginUser } from "../api";
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
      const userData = {
        email: data.email,
        password: data.password,
      };
      const user: User = await loginUser(userData.email, userData.password);
      if (!user) throw new Error("User login failed");
      console.log("Logged in user:", user);
      navigate.push("/dashboard");
    } catch (error) {
      console.error("Error logging in user:", error);
      setError("root", { message: "Failed to log in. Please try again." });
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
