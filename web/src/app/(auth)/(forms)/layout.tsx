import AppFooter from "@/src/shared/layout/app-footer";
import Logo from "@/src/shared/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background px-4 text-text">
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <header className="mb-7 flex flex-col items-center gap-3 text-primary">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-surface shadow-sm">
            <Logo />
          </div>
          <h1 className="font-heading text-2xl font-extrabold">Secret Santa</h1>
        </header>

        <main className="mb-6 w-full max-w-lg rounded-lg border border-border bg-surface p-7 shadow-sm md:p-8">
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
