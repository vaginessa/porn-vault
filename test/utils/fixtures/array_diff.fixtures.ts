export const fixtures = [
  {
    name: "adds",
    source: [],
    target: [
      {
        _id: "b",
      },
    ],
    expected: {
      removed: [],
      kept: [],
      added: [{ _id: "b" }],
    },
  },
  {
    name: "removes",
    source: [
      {
        _id: "a",
      },
    ],
    target: [],
    expected: {
      removed: [{ _id: "a" }],
      kept: [],
      added: [],
    },
  },
  {
    name: "removes and adds",
    source: [
      {
        _id: "a",
      },
    ],
    target: [
      {
        _id: "b",
      },
    ],
    expected: {
      removed: [{ _id: "a" }],
      kept: [],
      added: [{ _id: "b" }],
    },
  },
  {
    name: "keeps",
    source: [
      {
        _id: "a",
      },
      {
        _id: "b",
      },
    ],
    target: [
      {
        _id: "a",
      },
      {
        _id: "b",
      },
    ],
    expected: {
      removed: [],
      kept: [{ _id: "a" }, { _id: "b" }],
      added: [],
    },
  },
  {
    name: "removes keeps adds",
    source: [
      {
        _id: "a",
      },
      {
        _id: "b",
      },
    ],
    target: [
      {
        _id: "b",
      },
      {
        _id: "c",
      },
    ],
    expected: {
      removed: [{ _id: "a" }],
      kept: [{ _id: "b" }],
      added: [{ _id: "c" }],
    },
  },
];
