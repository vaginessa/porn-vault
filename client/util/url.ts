export function getUrl(route: string, isServer: boolean): string {
  return isServer ? `http://localhost:3000${route}` : route;
}
