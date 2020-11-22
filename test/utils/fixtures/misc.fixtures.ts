export const generateTimestampsAtIntervals = [
  {
    count: 100,
    duration: 100,
    options: {
      startPercentage: 0,
      endPercentage: 100,
    },
    expected: new Array(100).fill(0).map((_, index) => `${(100 / 100) * index}`),
  },
  {
    count: 100,
    duration: 100,
    options: {
      startPercentage: 2,
      endPercentage: 100,
    },
    expected: new Array(100).fill(0).map((_, index) => `${2 + ((100 - 2) / 100) * index}`),
  },
  {
    count: 100,
    duration: null,
    options: {
      startPercentage: 0,
      endPercentage: 100,
    },
    expected: new Array(100).fill(0).map((_, index) => `${index.toString()}%`),
  },
  {
    count: 100,
    duration: null,
    options: {
      startPercentage: 2,
      endPercentage: 100,
    },
    expected: new Array(100).fill(0).map((_, index) => `${2 + ((100 - 2) / 100) * index}%`),
  },
];
