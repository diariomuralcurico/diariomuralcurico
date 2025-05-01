module.exports = {
    transformIgnorePatterns: ['/node_modules/(?!react-bootstrap|classnames)/'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    extensionsToTreatAsEsm: ['.jsx'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
  };