export default {
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
    moduleNameMapper: {
        '^@prekladyher/(.*)$': '<rootDir>/packages/$1/'
    }
}
