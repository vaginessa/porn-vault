export default [
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
      },
    ],
    expected: { a: "a", b: "b" },
  },
  {
    target: {
      a: "",
    },
    defaults: [
      {
        b: "b",
      },
    ],
    expected: { a: "", b: "b" },
  },
  {
    target: {
      a: "",
    },
    defaults: [
      {
        b: "b",
      },
      {
        c: "c",
      },
    ],
    expected: { a: "", b: "b", c: "c" },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        a: "b",
      },
    ],
    expected: { a: "a" },
    noChange: true,
  },
  {
    target: {
      a: ["a"],
    },
    defaults: [
      {
        a: ["a"],
      },
    ],
    expected: { a: ["a"] },
    noChange: true,
  },
  {
    target: {
      a: ["a"],
    },
    defaults: [
      {
        a: ["b"],
      },
    ],
    expected: { a: ["a"] },
    noChange: true,
  },
  {
    target: {
      a: ["a"],
    },
    defaults: [
      {
        a: ["a", "b"],
      },
    ],
    expected: { a: ["a"] },
    noChange: true,
  },
  {
    target: {
    },
    defaults: [
      {
        a: ["a", "b"],
      },
    ],
    expected: { a: ["a", "b"] },
  },
  {
    target: {
      a: "",
    },
    defaults: [
      {
        a: "b",
      },
    ],
    expected: { a: "" },
    noChange: true,
  },
  {
    target: {
      a: "",
    },
    defaults: [
      {
        a: "b",
      },
      {
        a: "c",
      },
    ],
    expected: { a: "" },
    noChange: true,
  },
  {
    target: {
      a: null,
    },
    defaults: [
      {
        a: "b",
      },
    ],
    expected: { a: null },
    noChange: true,
  },
  {
    target: {
      a: undefined,
    },
    defaults: [
      {
        a: "b",
      },
    ],
    expected: { a: undefined },
    noChange: true,
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        a: null,
      },
    ],
    expected: { a: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        a: undefined,
      },
    ],
    expected: { a: "a" },
    noChange: true,
  },
  {
    target: {
      a: "a",
      deep: {
        deepA: "a",
        anotherDeep: null,
      },
    },
    defaults: [
      {
        b: "b",
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "a",
        anotherDeep: null,
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
      deep: {
        deepA: "a",
        anotherDeep: null,
      },
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
          anotherDeep: undefined,
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "a",
        deepB: "b",
        anotherDeep: null,
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
      deep: {
        deepA: "a",
        secondDeepA: {
          a: "a",
        },
      },
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
          secondDeepA: {
            a: "b",
            b: "b",
          },
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "a",
        deepB: "b",
        secondDeepA: {
          a: "a",
          b: "b",
        },
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
      deep: {
        deepA: "a",
        secondDeepA: {
          a: "a",
        },
      },
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
          secondDeepA: {
            a: "b",
            b: "b",
          },
        },
      },
      {
        b: "c",
        deep: {
          deepA: "c",
          deepB: "c",
          secondDeepA: {
            a: "c",
            b: "c",
          },
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "a",
        deepB: "b",
        secondDeepA: {
          a: "a",
          b: "b",
        },
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
      deep: {
        deepA: "a",
        secondDeepA: {
          a: "a",
        },
      },
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
          secondDeepA: {
            a: "b",
            b: "b",
          },
        },
      },
      {
        b: "c",
        deep: {
          deepA: "c",
          deepB: "c",
          secondDeepA: {
            a: "c",
            b: "c",
            c: "c",
          },
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "a",
        deepB: "b",
        secondDeepA: {
          a: "a",
          b: "b",
          c: "c",
        },
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "b",
        deepB: "b",
      },
      b: "b",
    },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
        },
      },
      {
        c: "c",
        deep: {
          deepA: "c",
          deepB: "c",
        },
      },
    ],
    expected: {
      a: "a",
      deep: {
        deepA: "b",
        deepB: "b",
      },
      b: "b",
      c: "c",
    },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
        },
      },
      {
        c: "c",
        deep: {
          deepA: "c",
          deepB: "c",
        },
      },
    ],
    ignorePaths: ["deep"],
    expected: {
      a: "a",
      b: "b",
      c: "c",
    },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
        },
      },
      {
        c: "c",
        deep: {
          deepA: "c",
          deepB: "c",
        },
      },
    ],
    ignorePaths: ["deep.deepA"],
    expected: {
      a: "a",
      deep: {
        deepB: "b",
      },
      b: "b",
      c: "c",
    },
  },
  {
    target: {
      a: "a",
    },
    defaults: [
      {
        b: "b",
        deep: {
          deepA: "b",
          deepB: "b",
        },
      },
      {
        c: "c",
        deep: {
          deepA: "c",
          deepB: "c",
          deepC: "c",
        },
      },
    ],
    ignorePaths: ["deep.deepC"],
    expected: {
      a: "a",
      deep: {
        deepA: "b",
        deepB: "b",
      },
      b: "b",
      c: "c",
    },
  },
];
