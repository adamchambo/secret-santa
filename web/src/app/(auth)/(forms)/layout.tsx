import AppFooter from "@/src/shared/layout/app-footer";
import Logo from "@/src/shared/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background px-3 text-text sm:px-4">
      <div className="flex flex-1 flex-col items-center justify-start py-4 sm:justify-center sm:py-10">
        <header className="mb-4 flex flex-col items-center gap-2 text-primary sm:mb-7 sm:gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-surface shadow-sm sm:size-14 sm:rounded-2xl">
            <Logo />
          </div>
          <h1 className="font-heading text-xl font-extrabold sm:text-2xl">Secret Santa</h1>
        </header>

        <main className="mb-3 w-full max-w-lg rounded-lg border border-border bg-surface p-4 shadow-sm sm:mb-6 sm:p-7 md:p-8">
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
