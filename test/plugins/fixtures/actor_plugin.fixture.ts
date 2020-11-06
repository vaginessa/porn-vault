const plugin = async (ctx) => {
  return await require("./actor_plugin.fixture.js")(ctx);
};

plugin.result = require("./actor_plugin.fixture.js").result;

module.exports = plugin;
