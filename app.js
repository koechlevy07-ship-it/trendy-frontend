module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000, // mongodb-memory-server downloads/starts a real mongod binary on first run
  verbose: true,
};
