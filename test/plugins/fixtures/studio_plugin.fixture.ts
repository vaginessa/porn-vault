const plugin = async () => {
  return require("./studio_plugin.fixture.js").result;
};

plugin.result = require("./studio_plugin.fixture.js").result;

module.exports = plugin;
