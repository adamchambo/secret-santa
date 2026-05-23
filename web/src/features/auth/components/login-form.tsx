"use client";

import FormShell from "./form-shell";
import { LoginFormValues,  useLoginForm } from "../hooks/use-auth-form";
import { User } from "@supabase/supabase-js";
import { loginUser } from "../api";
import { useRouter } from "next/navigation";
import ErrorText from "@/src/shared/ui/labels/error-text";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";


export default function LoginForm() {
  const navigate = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  async function onSubmit(data: LoginFormValues) {
    console.log(data);
    try {
      const userData = {
        email: data.email,
        password: data.password,
      };
      const user: User = await loginUser(userData.email, userData.password);
      if (!user) throw new Error("User login failed");
      console.log("Logged in user:", user);
      navigate.push("/groups");
    } catch (error) {
      console.error("Error logging in user:", error);
      setError("root", { message: "Failed to log in. Please try again." });
    }
  }

  return (
    <FormShell
      title="Welcome back"
      subtitle="Sign in to manage groups, gifts, and the important festive logistics."
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="email">
          Email Address
        </label>
        <div className="flex h-12 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary">
          <Mail size={18} className="shrink-0 text-text-muted" />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
            id="email"
            type="email"
            placeholder="bob-ross@email.com"
            {...register("email", {
              onChange: () => clearErrors("root"),
            })}
          />
        </div>
        <ErrorText text={errors.email?.message || ""} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="password">
          Password
        </label>
        <div className="flex h-12 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary">
          <Lock size={18} className="shrink-0 text-text-muted" />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              onChange: () => clearErrors("root"),
            })}
          />
        </div>
        <ErrorText text={errors.password?.message || ""} />
        <Link
          className="self-end text-sm font-bold text-primary hover:underline"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
        <button className="mt-2 h-12 w-full cursor-pointer rounded-md bg-primary px-4 font-extrabold text-background shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <ErrorText text={errors.root?.message || ""} />
    </FormShell>
  );
}
