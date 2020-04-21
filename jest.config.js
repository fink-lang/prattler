
module.exports = {
  testEnvironment: 'node',
  setupFiles: [],

  moduleFileExtensions: ['js', 'fnk'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],

  transform: {
    '^.+\\.fnk$': '@fink/jest/transform'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],

  testMatch: ['<rootDir>/**/*.test.fnk'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],

  timers: 'fake',
  clearMocks: true,
  resetMocks: false,

  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.fnk'
  ],
  coverageDirectory: './build/cov',
  coverageReporters: ['lcov'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};