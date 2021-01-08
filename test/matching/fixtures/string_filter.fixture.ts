export default [
  {
    name: "should return input order",
    options:{
      ignoreSingleNames:false,
      sortByLongestMatch: false,
    },
    items: [
      {
        _id: "short",
        name: "Gina",
      },
      {
        _id: "long",
        name: "Gina Valentina",
      },
    ],
    str:
      "Sloppy.Gargling.Suck.Party.Gina.Valentina.&.Jill.Kassidy.Swallowed.mp4",
    expected: ["Gina", "Gina Valentina"],
  },
  {
    name: "should return by longest match order",
    options:{
      ignoreSingleNames:false,
      sortByLongestMatch: true,
    },
    items: [
      {
        _id: "short",
        name: "Gina",
      },
      {
        _id: "long",
        name: "Gina Valentina",
      },
    ],
    str:
      "Sloppy.Gargling.Suck.Party.Gina.Valentina.&.Jill.Kassidy.Swallowed.mp4",
    expected: ["Gina Valentina", "Gina"],
  },
];
