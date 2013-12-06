var express = require('express');
var request = require('supertest');
var should = require('should');

var website = require('../').website;
var template = require('../').template;

var FakeSheet = require('./lib/fake-sheet');

var ROWS = require('./sample.json');

describe("website", function() {
  var app, email, sheet;

  beforeEach(function(done) {
    email = 'foo@example.org';
    app = express();
    sheet = FakeSheet(ROWS);

    app.use(express.json());
    app.use(function(req, res, next) {
      req.csrfToken = function() { return 'irrelevant'; }
      req.session = {email: email};
      next();
    });

    template.express(app, {});
    website.express(app, {sheet: sheet});
    app.use(function(err, req, res, next) {
      if (typeof(err) == 'number')
        return res.send(err);
      throw err;
    });

    done();
  });

  it('should not provide confidential info to non-members', function(done) {
    request(app)
      .get('/')
      .expect(200, function(err, res) {
        if (err) return done(err);
        res.text.should.not.match(/johndoe@amnh.org/);
        done();
      });
  });

  it('should not provide confidential info when embedded', function(done) {
    email = 'janedoe@amnh.org';
    request(app)
      .get('/embedded')
      .expect(200, function(err, res) {
        if (err) return done(err);
        res.text.should.not.match(/johndoe@amnh.org/);
        done();
      });
  });

  it('should provide confidential info to members', function(done) {
    email = 'janedoe@amnh.org';
    request(app)
      .get('/')
      .expect(/johndoe@amnh.org/)
      .expect(200, done);
  });

  it('should not allow non-members to edit rows', function(done) {
    request(app)
      .post('/edit')
      .send({id: '0'})
      .expect(403, done);
  });

  it('should allow members to edit their rows', function(done) {
    email = 'janedoe@amnh.org';
    request(app)
      .post('/edit')
      .send({id: '0', blog: 'http://lol.org'})
      .expect(302, function(err) {
        if (err) return done(err);
        sheet.rawRows[1].blog.should.eql('http://lol.org');
        done();
      });
  });

  it('should not allow members to edit other member\'s rows', function(done) {
    email = 'janedoe@amnh.org';
    request(app)
      .post('/edit')
      .send({id: '1'})
      .expect(403, done);
  });

  it('should return 409 if row is invalid', function(done) {
    request(app)
      .post('/edit')
      .send({id: '9999'})
      .expect(409, done);
  });
});
