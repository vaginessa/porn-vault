export const fullWordMatchFixtures = [
  {
    name: "handles single word input",
    inputs: ["Studio"],
    compares: [
      {
        compareStrings: [
          "my studio",
          "my_studio",
          "my-studio",
          "my   studio",
          "some studio thumbnail",
          "amy studio",
          "  studio",
          "-studio",
          "studio thumbnail",
          "studio-thumbnail",
          "studio_thumbnail",
        ],
        expected: ["Studio"],
      },
      {
        compareStrings: [
          "MyStudio",
          "myStudio",
          "Mystudio",
          "basicStudio thumbnail",
          "anotherStudio thumbnail",
          "MysTudio",
          "m ystudio",
          "mys tudio",
          "amystudio",
          "  mystudio",
          "-mystudio",
          "mystudio thumbnail",
          "mystudio-thumbnail",
          "mystudio_thumbnail",
        ],
        expected: [],
      },
    ],
  },
  {
    name: "handles two word inputs, PascalCase, camelCase, kebab-case",
    // If the studio contains known separators, or is PascalCase or camelCase,
    // all of its parts have to match
    inputs: [
      "My Studio",
      "My studio",
      "my Studio",
      "my studio",
      "MyStudio",
      "myStudio",
      "my_studio",
      "my-studio",
    ],
    compares: [
      {
        compareStrings: [
          "my studio",
          "my_studio",
          "my-studio",
          "MyStudio",
          "myStudio",
          "my   studio",
          "again my   studio",
          "again my-studio",
          "my studio thumbnail",
          "MyStudio thumbnail",
          "myStudio thumbnail",
          "myStudio-thumbnail",
          "MyStudio_thumbnail",
          "myStudio -thumbnail",
        ],
        expected: [
          "My Studio",
          "My studio",
          "my Studio",
          "my studio",
          "MyStudio",
          "myStudio",
          "my_studio",
          "my-studio",
        ],
      },
      {
        compareStrings: [
          "Mystudio",
          "MysTudio",
          "m ystudio",
          "mys tudio",
          "amy studio",
          "amystudio",
          "  mystudio",
          "-mystudio",
          "mystudio thumbnail",
          "mystudio-thumbnail",
          "mystudio_thumbnail",
          "my studio-thumbnail", // would be allowed with non strict word matching
          "my studio_thumbnail", // would be allowed with non strict word matching
        ],
        expected: [],
      },
    ],
  },
  {
    name: "returns all when no word groups",
    options: {},
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second my studio"],
        expected: ["My Studio", "Second My Studio"],
      },
    ],
  },
  {
    name: "returns all with word groups",
    options: {},
    inputs: ["My Studio", "Second MyStudio"],
    compares: [
      {
        compareStrings: ["second myStudio", "second MyStudio"],
        expected: ["My Studio", "Second MyStudio"],
      },
    ],
  },
  {
    name: "returns conflicting inputs when no preference",
    options: {},
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second my studio"],
        expected: ["My Studio", "Second My Studio"],
      },
    ],
  },
  {
    name: "returns shortest input when conflicting & want shortest",
    options: {
      overlappingInputPreference: "shortest",
    },
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second my studio"],
        expected: ["My Studio"],
      },
    ],
  },
  {
    name: "with word groups, returns shortest input when conflicting & want shortest",
    options: {
      overlappingInputPreference: "shortest",
    },
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second MyStudio"],
        expected: ["My Studio"],
      },
    ],
  },
  {
    name: "with word groups, returns longest input when conflicting & want longest",
    options: {
      overlappingInputPreference: "longest",
    },
    inputs: ["My Studio", "Second MyStudio"],
    compares: [
      {
        compareStrings: ["second MyStudio"],
        expected: ["Second MyStudio"],
      },
    ],
  },
  {
    name: "no word groups, returns longest input when conflicting & want longest",
    options: {
      overlappingInputPreference: "longest",
    },
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second My Studio"],
        expected: ["Second My Studio"],
      },
    ],
  },
  {
    name: "returns longest input when conflicting & want longest",
    options: {
      overlappingInputPreference: "longest",
    },
    inputs: ["My Studio", "Second My Studio"],
    compares: [
      {
        compareStrings: ["second my studio"],
        expected: ["Second My Studio"],
      },
    ],
  },
  {
    name: "lowercase",
    inputs: [
      // lowercase should only match a full word occurrence, since we don't know where to split
      "mystudio",
      "Mystudio",
    ],
    compares: [
      {
        compareStrings: [
          "Mystudio",
          "mystudio",
          "___mystudio",
          "  mystudio",
          "-mystudio",
          "mystudio thumbnail",
          "mystudio-thumbnail",
          "mystudio_thumbnail",
        ],
        expected: ["mystudio", "Mystudio"],
      },
      {
        compareStrings: [
          "MyStudio thumbnail",
          "myStudio thumbnail",
          "MyStudio",
          "MysTudio",
          "my studio",
          "my_studio",
          "my-studio",
          "my   studio",
          "my studio thumbnail",
          "m ystudio",
          "mys tudio",
          "amy studio",
          "amystudio",
        ],
        expected: [],
      },
    ],
  },
  {
    name: "handles word groups in inputs",
    inputs: ["MultiWord studio", "MultiWord Studio", "multiWord studio", "multiWord Studio"],
    compares: [
      {
        compareStrings: [
          "my multi word studio",
          "my multi word Studio",
          "my multiWord studio",
          "my multiWord Studio",
          "my MultiWord studio",
          "my MultiWord Studio",
          "my__multi_word_studio",
          "my-multi-word-studio",
          "MultiWord Studio",
          "multiWord studio",
          "my  multi word   studio",
        ],
        expected: ["MultiWord studio", "MultiWord Studio", "multiWord studio", "multiWord Studio"],
      },
      {
        compareStrings: [
          "multiword studio",
          "multiword studiotwo",
          "multiword studioTwo",
          "multiWord StudioTwo",
          "MultiWord StudioTwo",
          "my multi word studiotwo",
          "my multi word studioTwo",
          "my multi word Studiotwo",
          "my multi word StudioTwo",
          "my MultiWord Studiotwo",
          "my MultiWord StudioTwo",
          "mymultiword studio",
          "MyMultiWord studio",
          "myMultiWord studio",
          "again myMultiWord studio",
          " multi word   my    studio",
          "again multi word  my   studio",
        ],
        expected: [],
      },
    ],
  },
  {
    name: "handles kebab case as primary separator",
    inputs: ["multi-word-studio"],
    compares: [
      {
        compareStrings: [
          "my multi word studio",
          "my multi word Studio",
          "my__multi_word_studio",
          "my-multi-word-studio",
          "my  multi word   studio",
          "MultiWordStudio",
          "my MultiWordStudio",
          "my-multi-word-studio",
        ],
        expected: ["multi-word-studio"],
      },
      {
        compareStrings: [
          "multiword studio",
          "multiword studiotwo",
          "multiword studioTwo",
          "multiWord StudioTwo",
          "MultiWord StudioTwo",
          "my multi word studiotwo",
          "my multi word studioTwo",
          "my multi word Studiotwo",
          "my multi word StudioTwo",
          "my MultiWord Studiotwo",
          "my MultiWord StudioTwo",
          "mymultiword studio",
          "MyMultiWord studio",
          "myMultiWord studio",
          "again myMultiWord studio",
          " multi word   my    studio",
          "again multi word  my   studio",
          // would be allowed with non strict word matching
          "my multiWord studio",
          "my multiWord Studio",
          "my MultiWord studio",
          "my MultiWord Studio",
          "MultiWord Studio",
          "multiWord studio",
          "again my-multi-word-studio",
        ],
        expected: [],
      },
    ],
  },
  {
    name: "flattenWordGroups",
    options: {
      flattenWordGroups: true,
    },
    inputs: ["multi-word-studio"],
    compares: [
      {
        compareStrings: [
          "my multi word studio",
          "my multi word Studio",
          "my__multi_word_studio",
          "my-multi-word-studio",
          "my  multi word   studio",
          "my multiWord studio",
          "my multiWord Studio",
          "my MultiWord studio",
          "my MultiWord Studio",
          "MultiWord Studio",
          "multiWord studio",
          // allowed because of non strict word matching
          "multiWord StudioTwo",
          "MultiWord StudioTwo",
          "my multi word studioTwo",
          "my multi word StudioTwo",
          "my MultiWord StudioTwo",
          "MyMultiWord studio",
          "myMultiWord studio",
          "again myMultiWord studio",
        ],
        expected: ["multi-word-studio"],
      },
      {
        compareStrings: [
          // lowercase words still cannot be split
          "multiword studio",
          "multiword studiotwo",
          "multiword studioTwo",
          "my multi word studiotwo",
          "my multi word Studiotwo",
          "my MultiWord Studiotwo",
          "mymultiword studio",
          " multi word   my    studio",
          "again multi word  my   studio",
        ],
        expected: [],
      },
    ],
  },
  {
    name: "!flattenWordGroups with overlapping inputs",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["My Studio", "My StudioTwo"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My StudioTwo"],
      },
    ],
  },
  {
    name: "flattenWordGroups, with overlapping inputs, want longest",
    options: {
      flattenWordGroups: true,
      overlappingInputPreference: "longest",
    },
    inputs: ["My Studio", "My StudioTwo"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My StudioTwo"],
      },
    ],
  },
  {
    name: "flattenWordGroups, with overlapping inputs, want shortest",
    options: {
      flattenWordGroups: true,
      overlappingInputPreference: "shortest",
    },
    inputs: ["My Studio", "My StudioTwo"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My Studio"],
      },
    ],
  },
  {
    name: "flattenWordGroups, with only small input",
    options: {
      flattenWordGroups: true,
    },
    inputs: ["My Studio"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My Studio"],
      },
    ],
  },
  {
    name: "!flattenWordGroups, with only small input",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["My Studio"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: [],
      },
    ],
  },
  {
    name: "flattenWordGroups, with only long input",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["My StudioTwo"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My StudioTwo"],
      },
    ],
  },
  {
    name: "!flattenWordGroups, with only long input",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["My StudioTwo"],
    compares: [
      {
        compareStrings: ["my studioTwo"],
        expected: ["My StudioTwo"],
      },
    ],
  },
  {
    name: "doesn't match accross spaces",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["dp"],
    compares: [
      {
        // Make sure "dp" is not found from "an*d* *P*ussy"
        compareStrings: ["Carolina Sweets Popsicles and Pussy Tiny4k [facial].mp4"],
        expected: [],
      },
    ],
  },
  {
    name: "doesn't match accross spaces, even with flattened words",
    options: {
      flattenWordGroups: true,
    },
    inputs: ["dp"],
    compares: [
      {
        compareStrings: ["Carolina Sweets Popsicles and Pussy Tiny4k [facial].mp4"],
        expected: [],
      },
    ],
  },
  {
    name: "doesn't match inside a word",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["ir"],
    compares: [
      {
        // "ir" should not match from inside "G*ir*l"
        compareStrings: ["AGirlKnows.20.10.26.Lola.Myluv.And.Little.Caprice.Best.Friends.Forever"],
        expected: [],
      },
    ],
  },
  {
    name: "doesn't match inside a PascalCase word, when !flattenWordGroups",
    options: {
      flattenWordGroups: false,
    },
    inputs: ["AlettaOceanLive", "Aletta Ocean Live", "Aletta Ocean", "Ocean Live", "Ocean"],
    compares: [
      {
        compareStrings: ["AlettaOceanLive.20.10.30.mp4"],
        expected: ["AlettaOceanLive", "Aletta Ocean Live"],
      },
    ],
  },
  {
    name: "does match inside a word, when flattenWordGroups",
    options: {
      flattenWordGroups: true,
    },
    inputs: ["AlettaOceanLive", "Aletta Ocean Live", "Aletta Ocean", "Ocean Live", "Ocean"],
    compares: [
      {
        compareStrings: ["AlettaOceanLive.20.10.30"],
        expected: ["AlettaOceanLive", "Aletta Ocean Live", "Aletta Ocean", "Ocean Live", "Ocean"],
      },
    ],
  },
  {
    name: "matches separately on folders, basename with !flattenWordGroups",
    options: {
      flattenWordGroups: false,
    },
    inputs: [
      "test",
      "videos",
      "AlettaOceanLive",
      "Aletta Ocean Live",
      "Aletta Ocean",
      "Ocean Live",
      "Ocean",
      "testvideos",
    ],
    compares: [
      {
        compareStrings: ["/test/videos/AlettaOceanLive.20.10.30.mp4"],
        expected: ["test", "videos", "AlettaOceanLive", "Aletta Ocean Live"],
      },
    ],
  },
  {
    name: "matches separately on folders, basename with flattenWordGroups",
    options: {
      flattenWordGroups: true,
    },
    inputs: [
      "test",
      "videos",
      "AlettaOceanLive",
      "Aletta Ocean Live",
      "Aletta Ocean",
      "Ocean Live",
      "Ocean",
      "testvideos",
    ],
    compares: [
      {
        compareStrings: ["/test/videos/AlettaOceanLive.20.10.30.mp4"],
        expected: [
          "test",
          "videos",
          "AlettaOceanLive",
          "Aletta Ocean Live",
          "Aletta Ocean",
          "Ocean Live",
          "Ocean",
        ],
      },
    ],
  },
  {
    name: "matches separately on folders, basename with windows separator with !flattenWordGroups",
    options: {
      flattenWordGroups: false,
    },
    inputs: [
      "test",
      "videos",
      "AlettaOceanLive",
      "Aletta Ocean Live",
      "Aletta Ocean",
      "Ocean Live",
      "Ocean",
      "testvideos",
    ],
    compares: [
      {
        compareStrings: ["C:\\test\\videos\\AlettaOceanLive.20.10.30.mp4"],
        expected: ["test", "videos", "AlettaOceanLive", "Aletta Ocean Live"],
      },
    ],
  },
  {
    name: "matches separately on folders, basename with windows separator with flattenWordGroups",
    options: {
      flattenWordGroups: true,
    },
    inputs: [
      "test",
      "videos",
      "AlettaOceanLive",
      "Aletta Ocean Live",
      "Aletta Ocean",
      "Ocean Live",
      "Ocean",
      "testvideos",
    ],
    compares: [
      {
        compareStrings: ["C:\\test\\videos\\AlettaOceanLive.20.10.30.mp4"],
        expected: [
          "test",
          "videos",
          "AlettaOceanLive",
          "Aletta Ocean Live",
          "Aletta Ocean",
          "Ocean Live",
          "Ocean",
        ],
      },
    ],
  },
];
