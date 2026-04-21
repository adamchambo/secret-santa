import Logo from "@/src/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
      <div>
        <header>
          <Logo />
          <h1>Secret Santa</h1>
        </header>
        {children}
      </div>
  )
}