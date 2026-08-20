type AcademyLogoProps = {
  className?: string;
};

export default function AcademyLogo({
  className = "h-8 w-auto object-contain",
}: AcademyLogoProps) {
  return (
    <Image
      src="/Group1.png"
      alt="Bandhan Academy"
      width={433}
      height={96}
      className={`${className} brightness-0`}
    />
  );
}
import Image from "next/image";
