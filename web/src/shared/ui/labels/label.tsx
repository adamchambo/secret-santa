// size and colour props
type LabelProps = {
  children: React.ReactNode;
  className?: string
}

export default function Label({ children, className= "" }: LabelProps) {
  return (
    <h2 className={`${className}`}>{children}</h2>
  )
}