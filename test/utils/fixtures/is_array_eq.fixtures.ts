export const fixtures = [
  {
    name: "with new item",
    source: [],
    target: [
      {
        _id: "b",
      },
    ],
    expected: false,
  },
  {
    name: "without old item",
    source: [
      {
        _id: "a",
      },
    ],
    target: [],
    expected: false,
  },
  {
    name: "with new and without old",
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
    expected: false,
  },
  {
    name: "with same",
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
    expected: true,
  },
  {
    name: "with some old, removed and added",
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
    expected: false,
  },
  {
    name: "empty arr",
    source: [],
    target: [],
    expected: true,
  },
  {
    name: "different length",
    source: [
      {
        _id: "a",
      },
    ],
    target: [
      {
        _id: "a",
      },
      {
        _id: "a",
      },
    ],
    expected: false,
  },
];
