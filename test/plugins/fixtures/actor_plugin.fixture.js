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
  labels: ["existing actor label"],
};

const plugin = async ({ $createLocalImage, $createImage }) => {
  // Create existing image
  const existingImage = await $createLocalImage(
    "test/fixtures/files/image001.jpg",
    mockActor.name + " image001",
    false
  );

  // Create extra image for the gallery
  await $createImage(
    "https://picsum.photos/seed/picsum/400/400.jpg",
    mockActor.name + " image001",
    false
  );

  return {
    ...mockActor,
    thumbnail: await $createImage(
      "https://picsum.photos/seed/picsum/200/300.jpg",
      mockActor.name + " thumbnail",
      true
    ),
    existingImage,
  };
};

// Attach the result to the exported plugin
// so tests can use it to compare the result
plugin.result = mockActor;

module.exports = plugin;
