import { createVault } from "../src/app";
import { getConfig, loadTestConfig } from "../src/config";

const port = 5000;
let teardown: () => void;

before(() => {
  console.log(`Starting test server on port ${port}`);
  return new Promise(async (resolve) => {
    await loadTestConfig();
    console.log(getConfig());
    const vault = createVault();
    const server = vault.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve();
    });
    teardown = () => {
      console.log("Closing test server");
      server.close();
    };
  });
});

after(() => teardown());
