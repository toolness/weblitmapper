var env = new nunjucks.Environment(new nunjucks.WebLoader(), {
  autoescape: true
});

module.exports = env;
