"use client";

import {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";

type FormShellProps<T extends FieldValues> = {
  title: string;
  handleSubmit: UseFormHandleSubmit<T>;
  onSubmit: SubmitHandler<T>;
  children?: React.ReactNode;
};

export default function FormShell<T extends FieldValues>({
  title,
  handleSubmit,
  onSubmit,
  children,
}: FormShellProps<T>) {
  return (
    <div className="flex-col items-center p-2">
      <h2 className="mx-auto text-center font-bold">{title}</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {children}
      </form>
    </div>
  );
}
