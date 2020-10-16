const plugin = async () => {
  return require("./scene_plugin.fixture.js").result;
};

plugin.result = require("./scene_plugin.fixture.js").result;

module.exports = plugin;
