import { resolve } from "path";
export default require(resolve("./assets/version.json")).version as string;
