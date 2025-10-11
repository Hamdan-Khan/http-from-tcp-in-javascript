import { createDefaultEsmPreset } from "ts-jest";

const defaultEsmPreset = createDefaultEsmPreset();

/** @type {import("jest").Config} **/
const config = {
  ...defaultEsmPreset,
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  cache: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  verbose: true,
};

export default config;
