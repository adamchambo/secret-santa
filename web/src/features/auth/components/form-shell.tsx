"use client";

import ErrorText from "@/src/shared/ui/labels/error-text";

type FormShellProps = {
  title: string;
  register: any;
  handleSubmit: any;
  errors: any;
  isSubmitting: boolean;
};

export default function FormShell({ title, register, handleSubmit, errors, isSubmitting }: FormShellProps) {
  // use zod validation
  return (
    <div className="flex-col items-center p-2">
      <h2 className="mx-auto text-center font-bold">{title}</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email Address</label>
          <input
            className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
            id="email"
            type="email"
            placeholder="bob-ross@email.com"
            {...register("email")}
          ></input>
          <ErrorText text={errors.email?.message || ""} />
        </div>
        <div className="flex flex-col gap-2">
          <label>Password</label>
          <input
            className="h-10 bg-background text-text-muted rounded-sm py-2 pl-2"
            id="password"
            type="password"
            placeholder="randompassword123"
            {...register("password")}
          ></input>
          <ErrorText text={errors.password?.message || ""} />
        </div>
        <button className="h-10 self-center mt-4 p-1 bg-primary rounded-md items-center hover:cursor-pointer text-white w-full">
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        <ErrorText text={errors.root?.message || ""} />
      </form>
    </div>
  );
}
