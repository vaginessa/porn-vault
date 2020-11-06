const mockStudio = {
  name: "mock studio name",
  description: "mock studio description",
  favorite: true,
  bookmark: 1,
  aliases: ["mock studio alias"],
  labels: ["existing studio label"],
};

const plugin = async ({ $createImage }) => {
  await $createImage(
    "https://picsum.photos/seed/picsum/400/400.jpg",
    mockStudio.name + " image001",
    false
  );

  return {
    ...mockStudio,
    thumbnail: await $createImage(
      "https://picsum.photos/seed/picsum/200/300.jpg",
      mockStudio.name + " thumbnail",
      true
    ),
  };
};

// Attach the result to the exported pluginn
// so tests can use it to compare the result
plugin.result = mockStudio;

module.exports = plugin;
