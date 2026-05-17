type HeaderProps = {
  children: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="w-full h-16 bg-background border-b border-border flex items-center">
      {children}
    </header>
  );
}
