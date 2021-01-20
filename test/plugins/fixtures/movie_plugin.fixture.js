const mockMovie = {
  name: "mock movie name",
  description: "mock movie description",
  // Use a constant date, so individual imports will have same date
  releaseDate: new Date("2020-10-09T07:49:52.636Z").valueOf(),
  rating: 5,
  favorite: true,
  bookmark: 1,
};

const plugin = async ({ $createLocalImage }) => {
  // Create existing image
  const existingImage = await $createLocalImage(
    "test/fixtures/files/image001.jpg",
    mockMovie.name + " image001",
    false
  );

  return {
    ...mockMovie,
    existingImage,
  };
};

// Attach the result to the exported plugin
// so tests can use it to compare the result
plugin.result = mockMovie;

module.exports = plugin;
