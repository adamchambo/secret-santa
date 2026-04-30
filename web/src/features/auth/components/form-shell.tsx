"use client"

type FormShellProps = {
  title: string
  children: React.ReactNode
}

export default function FormShell({ title, children }: FormShellProps) { // use zod validation
  return (
    <div className="flex-col items-center p-2">
      <h2 className="mx-auto text-center font-bold">{title}</h2>
      {children}
    </div>
  )
}