const lightColors = ["#d5d0d0", "#d0d5d0", "#d0d0d5", "#d0d0d0"];
const darkColors = ["#101015", "#151020", "#101520", "#101025"];

function selectRandomColor(colors: string[]) {
  return colors[(Math.random() * colors.length) | 0];
}

export function generateThumbnailPlaceholderColor(dark: boolean): string {
  return selectRandomColor(dark ? darkColors : lightColors);
}
