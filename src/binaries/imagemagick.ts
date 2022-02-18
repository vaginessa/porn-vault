import execa from "execa";

import { getConfig } from "../config";

export function getImageDimensions(input: string): { width: number; height: number } {
  const proc = execa.sync(getConfig().imagemagick.identifyPath, ["-format", "%[w] %[h]", input]);
  const dims = proc.stdout
    .trim()
    .split(" ")
    .map((x) => parseInt(x));
  return { width: dims[0], height: dims[1] };
}
