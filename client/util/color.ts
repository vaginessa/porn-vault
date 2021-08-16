import Color from "color";

export function isDarkColor(hex: string): boolean {
  return new Color(hex).isDark();
}
