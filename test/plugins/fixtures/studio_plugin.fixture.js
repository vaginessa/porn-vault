const mockStudio = {
  name: "mock studio name",
  description: "mock studio description",
  favorite: true,
  bookmark: 1,
  aliases: ["mock studio alias"],
  labels: ["plugin studio label"],
};

const plugin = async () => {
  return mockStudio;
};

// Attach the result to the exported pluginn
// so tests can use it to compare the result
plugin.result = mockStudio;

module.exports = plugin;
