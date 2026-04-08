import { Country, ShowType } from '@/lib/types';

const countryColors: Record<Country, string> = {
  KOREAN:            'bg-[#fce4ec] text-[#c2185b]',
  THAI:              'bg-[#e8f5e9] text-[#388e3c]',
  VIETNAMESE:        'bg-[#e0f2f7] text-[#0277bd]',
  CHINESE_TAIWANESE: 'bg-[#fff3e0] text-[#f57c00]',
  JAPANESE:          'bg-[#f3e5f5] text-[#7b1fa2]',
  AMERICAN:          'bg-[#e8eaf6] text-[#283593]',
};

const countryLabels: Record<Country, string> = {
  KOREAN:            'K-Drama',
  THAI:              'Thai',
  VIETNAMESE:        'Viet',
  CHINESE_TAIWANESE: 'C-Drama',
  JAPANESE:          'Japanese',
  AMERICAN:          'American',
};

export function CategoryBadge({ country }: { country: Country }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${countryColors[country]}`}>
      {countryLabels[country]}
    </span>
  );
}