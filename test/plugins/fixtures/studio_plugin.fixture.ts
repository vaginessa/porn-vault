const plugin = async (ctx) => {
  return await require("./studio_plugin.fixture.js")(ctx);
};

plugin.result = require("./studio_plugin.fixture.js").result;

module.exports = plugin;
