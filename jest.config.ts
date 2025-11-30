/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageProvider: "v8",
  testEnvironment: "jsdom",


  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },

};

export default config;
