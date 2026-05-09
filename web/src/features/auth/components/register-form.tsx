"use client";

import FormShell from "./form-shell";
import { RegisterFormValues, useRegisterForm } from "../hooks/use-auth-form";
import { registerUser } from "../api";
import { useRouter } from "next/navigation";
import ErrorText from "@/src/shared/ui/labels/error-text";


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
      const user = await registerUser(data.email, data.password);
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
          title="Register"
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
          <div className="flex flex-col gap-2">
            <label>Confirm Password</label>
            <input
              className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
              id="confirmPassword"
              type="password"
              placeholder="************"
              {...register("confirmPassword", {
                onChange: () => clearErrors("root"),
              })}
            ></input>
            <ErrorText text={errors.confirmPassword?.message || ""} />
          </div>
            <button className="h-10 self-center mt-4 p-1 bg-primary rounded-md items-center hover:cursor-pointer text-white w-full">
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <ErrorText text={errors.root?.message || ""} />
        </FormShell>
  );
}
