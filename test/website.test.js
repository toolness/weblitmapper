var express = require('express');
var request = require('supertest');
var should = require('should');

var db = require('./db');
var website = require('../').website;
var template = require('../').template;

describe("website", function() {
  var app, username;

  beforeEach(function(done) {
    username = null;
    app = express();

    app.use(express.json());
    app.use(function(req, res, next) {
      req.csrfToken = function() { return 'irrelevant'; }
      req.session = {username: username};
      next();
    });

    template.express(app, {});
    website.express(app, {origin: 'http://example.org'});
    app.use(function(err, req, res, next) {
      if (typeof(err) == 'number')
        return res.send(err);
      throw err;
    });

    done();
  });

  it('should show login button when logged out', function(done) {
    request(app)
      .get('/')
      .expect(/js-login/)
      .expect(200, done);
  });

  it('should show logout button when logged in', function(done) {
    username = 'foo';
    request(app)
      .get('/')
      .expect(/foo/)
      .expect(/js-logout/)
      .expect(200, done);
  });

  describe('/:id/like and /:id/unlike', function(done) {
    var id = '534e1fb132bb0b5810c7bbf5';
    var likeURL = '/' + id + '/like';
    var unlikeURL = '/' + id + '/unlike';

    beforeEach(db.wipe);
    beforeEach(db.loadFixture(require('./fixture/weblit-resources.json')));
    beforeEach(function() {
      username = 'foo';
    });

    it('should work when liking', function(done) {
      request(app)
        .post(likeURL)
        .expect(200, done);
    });

    it('should work when unliking', function(done) {
      request(app)
        .post(unlikeURL)
        .expect(200, done);
    });
  });

  describe('/json', function(done) {
    beforeEach(db.wipe);
    beforeEach(db.loadFixture(require('./fixture/weblit-resources.json')));

    it('should return results when given valid page #', function(done) {
      request(app)
        .get('/json?p=1')
        .expect(/chadsansing/)
        .expect(200, done);
    });

    it('should return empty results when given big page #', function(done) {
      request(app)
        .get('/json?p=999')
        .expect([])
        .expect(200, done);
    });

    it('should return 400 when given invalid page #', function(done) {
      request(app)
        .get('/json')
        .expect(400, done);
    });
  });
});
