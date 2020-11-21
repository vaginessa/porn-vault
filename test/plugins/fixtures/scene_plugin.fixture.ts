const plugin = async (ctx) => {
  return await require("./scene_plugin.fixture.js")(ctx);
};

plugin.result = require("./scene_plugin.fixture.js").result;

module.exports = plugin;
