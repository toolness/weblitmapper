module.exports = process.env.HIVEDIR_COV
  ? require('./lib-cov/hive-directory')
  : require('./lib/hive-directory');
