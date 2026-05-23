import AppFooter from "@/src/shared/layout/app-footer";
import NavBar from "@/src/shared/layout/nav-bar";

type MainLayoutProps = {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header>
        <NavBar />
      </header>
      <main className="min-h-0 flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
