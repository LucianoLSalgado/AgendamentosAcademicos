// jest.config.js
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|svg|ttf|otf|woff)$': '<rootDir>/__mocks__/fileMock.js',
    '^expo-sqlite$':       '<rootDir>/__mocks__/expo-sqlite.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^react-native$':      '<rootDir>/__mocks__/react-native.js',
    '^react-native/(.*)$': '<rootDir>/__mocks__/react-native.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.ts',
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns)/)',
  ],
  collectCoverageFrom: [
    'services/database.ts',      // testado diretamente
    'utils/**/*.{ts,tsx}',       // testado diretamente
    'components/**/*.{ts,tsx}',  // testado diretamente
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: { branches: 60, functions: 70, lines: 70 },
  },
};