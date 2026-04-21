"use client"

type FormShellProps = {
  title: string
  children: React.ReactNode
}

export default function FormShell({ title, children }: FormShellProps) { // use zod validation
  return (
    <div className="flex">
      <h2>{title}</h2>
      {children}
    </div>
  )
}