/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  coveragePathIgnorePatterns: ["/node_modules/"],
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
