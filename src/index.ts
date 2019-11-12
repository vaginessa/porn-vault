import "./database";
import startServer from "./server";
import { checkConfig } from "./config/index";

(async () => {
  await checkConfig();
  startServer();
})();
