import { extname } from "path";

export function extensionFromUrl(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  return extname(clean);
}

export function removeExtension(file: string): string {
  return file.replace(/\.[^/.]+$/, "");
}
