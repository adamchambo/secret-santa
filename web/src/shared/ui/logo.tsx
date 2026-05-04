import Image from "next/image";

type LogoProps = {
  className?: string
}

export default function Logo({ className = "" }) {
  return (
    <div className={`relative w-10 h-10 md:w-12 md:h-12 ${className}`}>
      <Image src="/santa-hat.png" alt="santa hat" fill className="object-contain" />
    </div>
  );
}