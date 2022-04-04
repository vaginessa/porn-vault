export function gqlIp() {
  if (typeof window === "undefined") {
    return "http://localhost:3000/api/ql";
  }
  return "/api/ql";
}
