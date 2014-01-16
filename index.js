module.exports = process.env.ENABLE_TEST_COVERAGE
  ? require('./lib-cov')
  : require('./lib');
