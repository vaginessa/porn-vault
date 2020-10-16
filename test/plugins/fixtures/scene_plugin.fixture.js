const mockScene = {
  name: "mock scene name",
  path: "mock scene path",
  description: "mock scene description",
  // Use a constant date, so individual imports will have same date
  releaseDate: new Date("2020-10-09T07:49:52.636Z").valueOf(),
  addedOn: new Date("2020-10-09T07:49:52.636Z").valueOf(),
  rating: 5,
  favorite: true,
  bookmark: 1,
};

const plugin = async () => {
  return mockScene;
};

// Attach the result to the exported plugin
// so tests can use it to compare the result
plugin.result = mockScene;

module.exports = plugin;
