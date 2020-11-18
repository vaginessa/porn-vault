import { extname } from "path";

export function extensionFromUrl(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  return extname(clean);
}

export function removeExtension(file: string): string {
  return file.replace(/\.[^/.]+$/, "");
}

/**
 * @param str - the string to strip
 * @returns the string without diacritics
 */
export const stripAccents = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
