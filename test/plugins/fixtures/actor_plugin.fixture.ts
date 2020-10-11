const plugin = async () => {
  return require("./actor_plugin.fixture.js").result;
};

plugin.result = require("./actor_plugin.fixture.js").result;

module.exports = plugin;
