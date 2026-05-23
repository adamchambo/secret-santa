"use client";

import {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";

type FormShellProps<T extends FieldValues> = {
  title: string;
  subtitle: string;
  handleSubmit: UseFormHandleSubmit<T>;
  onSubmit: SubmitHandler<T>;
  children?: React.ReactNode;
};

export default function FormShell<T extends FieldValues>({
  title,
  subtitle,
  handleSubmit,
  onSubmit,
  children,
}: FormShellProps<T>) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
          Merry Christmas
        </p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold text-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">{subtitle}</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {children}
      </form>
    </div>
  );
}
