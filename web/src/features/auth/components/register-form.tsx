"use client";

import FormShell from "./form-shell";
import { RegisterFormValues, useRegisterForm } from "../hooks/use-auth-form";
import { registerUser } from "../api";
import { useRouter } from "next/navigation";
import ErrorText from "@/src/shared/ui/labels/error-text";
import { Lock, Mail, UserRound } from "lucide-react";


export default function RegisterForm() {
  const navigate = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useRegisterForm();

  async function onSubmit(data: RegisterFormValues) {
    console.log(data);
    try {
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", { message: "Passwords do not match" });
        return;
      }
      const user = await registerUser(data.email, data.password, data.displayName);
      if (!user) throw new Error("User registration failed");
      console.log("Registered user:", user);
      navigate.push("/verrify-email");
    } catch (error) {
      console.error("Error registering user:", error);
      setError("root", { message: "Failed to register. Please try again." });
    }
  }

  return (
    <FormShell
          title="Create account"
          subtitle="Set up your profile so groups can invite you and match your gift list."
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="displayName">
              Display Name
            </label>
            <div className="flex h-11 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary sm:h-12">
              <UserRound size={18} className="shrink-0 text-text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
                id="displayName"
                type="text"
                placeholder="Bob Ross"
                {...register("displayName", {
                  onChange: () => clearErrors("root"),
                })}
              />
            </div>
            <ErrorText text={errors.displayName?.message || ""} />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="email">
              Email Address
            </label>
            <div className="flex h-11 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary sm:h-12">
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
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="password">
                Password
              </label>
              <div className="flex h-11 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary sm:h-12">
                <Lock size={18} className="shrink-0 text-text-muted" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register("password", {
                    onChange: () => clearErrors("root"),
                  })}
                />
              </div>
              <ErrorText text={errors.password?.message || ""} />
            </div>
            <div className="min-w-0">
              <label className="text-xs font-extrabold uppercase tracking-widest text-text" htmlFor="confirmPassword">
                Confirm
              </label>
              <div className="flex h-11 items-center gap-3 rounded-md border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary sm:h-12">
                <Lock size={18} className="shrink-0 text-text-muted" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-muted"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm"
                  {...register("confirmPassword", {
                    onChange: () => clearErrors("root"),
                  })}
                />
              </div>
              <ErrorText text={errors.confirmPassword?.message || ""} />
            </div>
          </div>
            <button className="h-11 w-full cursor-pointer rounded-md bg-primary px-4 font-extrabold text-background shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:h-12">
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <ErrorText text={errors.root?.message || ""} />
        </FormShell>
  );
}
