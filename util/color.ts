const colors = ["#122753", " #244fa7", "#5782da"];

function createRainbow(colors: string[]) {
  return (): string => colors[(Math.random() * colors.length) | 0];
}

export const generateThumbnailPlaceholderColor = createRainbow(colors);
