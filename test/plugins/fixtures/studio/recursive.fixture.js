const { writeFileSync, readFileSync, existsSync } = require("fs");

const mocks = {
  studio_1: {
    name: "studio_1",
    parent: "studio_2",
  },
  studio_2: {
    name: "studio_2",
    parent: "studio_3",
  },
  studio_3: {
    name: "studio_3",
    parent: "studio_4",
  },
  studio_4: {
    name: "studio_4",
    parent: "studio_5",
  },
  studio_5: {
    name: "studio_5",
    parent: "studio_6",
  },
  studio_6: {
    name: "studio_6",
    parent: "studio_7",
  },
  studio_7: {
    name: "studio_8",
    parent: "studio_8",
  },
};

const plugin = async ({ studioName }) => {
  let callCount = 0;
  if (existsSync("./test/plugins/fixtures/studio/call_count")) {
    callCount = parseInt(readFileSync("./test/plugins/fixtures/studio/call_count", "utf-8"));
  }
  writeFileSync("./test/plugins/fixtures/studio/call_count", `${callCount + 1}`, "utf-8");
  return mocks[studioName];
};

module.exports = plugin;
