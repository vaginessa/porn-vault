export default [
  {
    target: {
      a: "a",
    },
    default: {
      b: "b",
    },
    expected: {},
  },
  {
    target: {
      a: "",
    },
    default: {
      b: "b",
    },
    expected: {},
  },
  {
    target: {
      a: "a",
    },
    default: {
      b: "",
    },
    expected: {},
  },
  {
    target: {
      a: null,
    },
    default: {
      b: "b",
    },
    expected: {},
  },
  {
    target: {
      a: "a",
    },
    default: {
      b: null,
    },
    expected: {},
  },
  {
    target: {
      a: undefined,
    },
    default: {
      b: "b",
    },
    expected: {},
  },
  {
    target: {
      a: "a",
    },
    default: {
      b: undefined,
    },
    expected: {},
  },
  {
    target: {
      a: "a",
    },
    default: {
      a: "b",
      b: "b",
    },
    expected: { a: "a" },
  },
  {
    target: {
      a: ["1", "2"],
    },
    default: {
      a: "b",
      b: "b",
    },
    expected: { a: ["1", "2"] },
  },
  {
    target: {
      a: "a",
      a2: "a",
    },
    default: {
      a: "b",
      a2: "b2",
    },
    expected: { a: "a", a2: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deep: {
        a: "a",
        a2: "a",
      },
    },
    default: {
      a: "b",
      a2: "b2",
    },
    expected: { a: "a", a2: "a" },
  },
  {
    target: {
      a: "a",
      a2: "a",
      deep: {
        a: "a",
        a2: "a",
      },
    },
    default: {
      a: "b",
      a2: "b2",
      deep: {
        a: "b",
        a2: "b2",
      },
    },
    expected: {
      a: "a",
      a2: "a",
      deep: {
        a: "a",
        a2: "a",
      },
    },
  },
  {
    target: {
      a: "a",
      a2: "a",
    },
    default: {
      a: "b",
      a2: "b2",
      deep: {
        a: "b",
        a2: "b",
      },
    },
    expected: { a: "a", a2: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deepArr: [
        {
          a: "a",
          a2: "a",
        },
      ],
    },
    default: {
      a: "b",
      a2: "b2",
    },
    expected: { a: "a", a2: "a" },
  },
  {
    target: {
      a: "a",
      a2: "a",
    },
    default: {
      a: "b",
      a2: "b2",
      deepArr: [
        {
          a: "b",
          a2: "b2",
        },
      ],
    },
    expected: { a: "a", a2: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deepArr: [
        {
          a: "a",
          a2: "a",
        },
      ],
    },
    default: {
      a: "b",
      a2: "b2",
      deepArr: [
        {
          a: "b",
          a2: "b2",
        },
      ],
    },
    expected: {
      a: "a",
      a2: "a",
      deepArr: [
        {
          a: "a",
          a2: "a",
        },
      ],
    },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deepArr: [
        {
          a: "a",
          a2: "a",
        },
      ],
    },
    default: {
      a: "b",
      a2: "b2",
      deepArr: [{}],
    },
    expected: {
      a: "a",
      a2: "a",
      deepArr: [
        {
          a: "a",
          a2: "a",
        },
      ],
    },
    noChange: true,
  },
  {
    target: {
      a: "a",
    },
    default: {
      b: "b",
    },
    ignorePaths: ["a"],
    expected: { a: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
    },
    default: {
      a: "b",
    },
    ignorePaths: ["a"],
    expected: { a: "a" },
    noChange: true,
  },
  {
    target: {
      a: null,
    },
    default: {
      b: "b",
    },
    ignorePaths: ["a"],
    expected: { a: null },
    noChange: true,
  },
  {
    target: {
      a: ["1", "2"],
    },
    default: {
      a: "b",
      b: "b",
    },
    ignorePaths: ["a"],
    expected: { a: ["1", "2"] },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
    },
    default: {
      a: "b",
      a2: "b2",
      deep: {
        a: "b",
        a2: "b",
      },
    },
    ignorePaths: ["deep"],
    expected: { a: "a", a2: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deep: {
        a: "a",
        a2: "a",
      },
    },
    default: {
      a: "b",
      a2: "b2",
      deep: {
        a2: "b2",
      },
    },
    ignorePaths: ["deep.a"],
    expected: {
      a: "a",
      a2: "a",
      deep: {
        a: "a",
        a2: "a",
      },
    },
    noChange: true,
  },
  {
    target: {
      a: "a",
      a2: "a",
      deep: {
        a2: "a",
      },
    },
    default: {
      a: "b",
      a2: "b2",
      deep: {
        a: "a",
        a2: "b2",
      },
    },
    ignorePaths: ["deep.a"],
    expected: {
      a: "a",
      a2: "a",
      deep: {
        a2: "a",
      },
    },
    noChange: true,
  },
];
