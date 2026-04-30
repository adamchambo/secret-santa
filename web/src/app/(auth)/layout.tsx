import Logo from "@/src/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background px-4">
      <div className="flex-1 flex flex-col justify-center items-center ">
        <header className="flex flex-col items-center text-primary font-bold m-4">
          <Logo />
          <h1 className="text-2xl">Secret Santa</h1>
        </header>

        <main className="w-full max-w-md rounded-md p-6 pb-10 mb-6 shadow bg-foreground">
          {children}
        </main>
      </div>

      <footer className="text-center pb-4 pt-2 text-text-muted border-t border-border/60">
        <p>© 2025 Adam Chamberlain</p>
      </footer>
    </div>
  )
}