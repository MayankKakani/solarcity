import Image from "next/image";

export function Logo() {
  return (
    <span className="inline-flex items-center">
      <Image
        src="/logo-dark-solar.svg"
        alt="Solarplan"
        className="h-6 w-auto dark:hidden"
        width={24}
        height={24}
      />
      <Image
        src="/logo-light-solar.svg"
        alt="Solarplan"
        className="hidden h-6 w-auto dark:block"
        width={24}
        height={24}
      />
    </span>
  );
}
