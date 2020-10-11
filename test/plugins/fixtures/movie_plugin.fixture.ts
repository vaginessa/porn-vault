const plugin = async () => {
  return require("./movie_plugin.fixture.js").result;
};

plugin.result = require("./movie_plugin.fixture.js").result;

module.exports = plugin;
