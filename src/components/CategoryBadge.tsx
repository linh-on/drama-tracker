import { Country } from "@/lib/types";

const countryColors: Record<Country, string> = {
  KOREAN:
    "bg-[#fce4ec] text-[#c2185b] dark:bg-[#c2185b]/20 dark:text-[#f48fb1]",
  THAI: "bg-[#e8f5e9] text-[#388e3c] dark:bg-[#388e3c]/20 dark:text-[#81c784]",
  VIETNAMESE:
    "bg-[#e0f2f7] text-[#0277bd] dark:bg-[#0277bd]/20 dark:text-[#4fc3f7]",
  CHINESE_TAIWANESE:
    "bg-[#fff3e0] text-[#f57c00] dark:bg-[#f57c00]/20 dark:text-[#ffb74d]",
  JAPANESE:
    "bg-[#f3e5f5] text-[#7b1fa2] dark:bg-[#7b1fa2]/20 dark:text-[#ce93d8]",
  AMERICAN:
    "bg-[#e8eaf6] text-[#283593] dark:bg-[#283593]/20 dark:text-[#9fa8da]",
};

const countryLabels: Record<Country, string> = {
  KOREAN: "K-Drama",
  THAI: "Thai",
  VIETNAMESE: "Viet",
  CHINESE_TAIWANESE: "C-Drama",
  JAPANESE: "Japanese",
  AMERICAN: "American",
};

export function CategoryBadge({ country }: { country: Country }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${countryColors[country]}`}
    >
      {countryLabels[country]}
    </span>
  );
}
