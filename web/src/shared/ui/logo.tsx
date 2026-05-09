import Image from "next/image";

export default function Logo({ className = "" }) {
  return (
    <div className={`relative w-8 h-8 md:w-10 md:h-10 ${className}`}>
      <Image
        src="/santa-hat.png"
        alt="santa hat"
        fill
        className="object-contain"
      />
    </div>
  );
}