const mockActor = {
  name: "mock actor name",
  description: "mock actor description",
  // Use a constant date, so individual imports will have same date
  bornOn: new Date("2020-10-09T07:49:52.636Z").valueOf(),
  aliases: ["mock actor alias"],
  rating: 5,
  favorite: true,
  bookmark: 1,
  nationality: "US",
};

const plugin = async () => {
  return mockActor;
};

// Attach the result to the exported pluginn
// so tests can use it to compare the result
plugin.result = mockActor;

module.exports = plugin;
