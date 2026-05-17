import NavBar from "@/src/shared/layout/nav-bar";

type MainLayoutProps = {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <header>
        <NavBar />
      </header>
      <main>
        {children}
      </main>
      {/*<Header />
      <main>
      {children}
      </main>
      <Footer /> */}
    </div>
  )
}