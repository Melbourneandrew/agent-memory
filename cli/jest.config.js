/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/integration"],
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: false,
  testMatch: ["**/*.test.ts"]
};
