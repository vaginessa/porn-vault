export default [
  {
    str: "jill kassidy swallowed",
    label: {
      _id: "test",
      name: "Anal",
      aliases: [],
    },
    expected: false,
  },
  {
    str: "Layla Love All Anal Blonde",
    label: {
      _id: "test",
      name: "Anal",
      aliases: [],
    },
    expected: true,
  },
  {
    str: "Chanel Grey's First DP",
    label: {
      _id: "test",
      name: "Anal",
      aliases: ["dp"],
    },
    expected: true,
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double penetration",
      aliases: ["regex:double.*"],
    },
    expected: true,
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double penetration",
      aliases: ["double.*"],
    },
    expected: true,
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double anal",
      aliases: [],
    },
    expected: true,
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "dap",
      aliases: ["double anal"],
    },
    expected: true,
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "dap",
      aliases: ["regex:double anal"],
    },
    expected: true,
  },
];
