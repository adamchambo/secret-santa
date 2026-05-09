"use client";

import FormShell from "./form-shell";
import { LoginFormValues,  useLoginForm } from "../hooks/use-auth-form";
import { User } from "@supabase/supabase-js";
import { loginUser } from "../api";
import { useRouter } from "next/navigation";
import ErrorText from "@/src/shared/ui/labels/error-text";


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
      navigate.push("/dashboard");
    } catch (error) {
      console.error("Error logging in user:", error);
      setError("root", { message: "Failed to log in. Please try again." });
    }
  }

  return (
    <FormShell
      title="Login"
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email">Email Address</label>
        <input
          className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
          id="email"
          type="email"
          placeholder="bob-ross@email.com"
          {...register("email", {
            onChange: () => clearErrors("root"),
          })}
        ></input>
        <ErrorText text={errors.email?.message || ""} />
      </div>
      <div className="flex flex-col gap-2">
        <label>Password</label>
        <input
          className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
          id="password"
          type="password"
          placeholder="************"
          {...register("password", {
            onChange: () => clearErrors("root"),
          })}
        ></input>
        <ErrorText text={errors.password?.message || ""} />
      </div>
        <button className="h-10 self-center mt-4 p-1 bg-primary rounded-md items-center hover:cursor-pointer text-white w-full">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <ErrorText text={errors.root?.message || ""} />
    </FormShell>
    // to do: bring the fields up to this layer
    // to do: add forgot password link
  );
}
