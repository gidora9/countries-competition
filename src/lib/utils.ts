import { CountryCPI } from '../data/cpi2024';

export const lerpColor = (score: number) => {
  // Score 0 -> Deep Crimson (#bd0000)
  // Score 100 -> Electric Cyan (#00f2ff)
  const t = Math.max(0, Math.min(100, score)) / 100;
  
  const r = Math.round(189 + t * (0 - 189)); // 189 -> 0
  const g = Math.round(0 + t * (242 - 0));
  const b = Math.round(0 + t * (255 - 0));
  
  return `rgb(${r}, ${g}, ${b})`;
};

export const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};
