module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    'jest.config.js',
    'node_modules/',
    'dist/',
  ],
  globals: {
    'ts-jest': {
      // https://github.com/kulshekhar/ts-jest/blob/main/website/docs/getting-started/options/isolatedModules.md
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '^@prekladyher/(.*)$': '<rootDir>/packages/$1/'
  }
};
