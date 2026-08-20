type AcademyLogoProps = {
  className?: string;
};

export default function AcademyLogo({
  className = "h-8 w-auto object-contain",
}: AcademyLogoProps) {
  return (
    <img
      src="/bandhan.png"
      alt="Bandhan Academy"
      className={className}
    />
  );
}
