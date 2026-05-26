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
      <div className="mb-4 sm:mb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
          Merry Christmas
        </p>
        <h2 className="mt-1 font-heading text-2xl font-extrabold text-primary sm:mt-2 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-text-muted sm:mt-2 sm:leading-6">{subtitle}</p>
      </div>

      <form className="flex flex-col gap-3 sm:gap-5" onSubmit={handleSubmit(onSubmit)}>
        {children}
      </form>
    </div>
  );
}
