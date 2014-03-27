var buildEnvironment = require('../template-base').buildEnvironment;

module.exports = buildEnvironment(nunjucks, new nunjucks.WebLoader());
