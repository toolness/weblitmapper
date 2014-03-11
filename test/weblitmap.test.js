var should = require('should');

var weblitmap = require('../').weblitmap;

describe('weblitmap.normalizeTags()', function() {
  it('should remove invalid tags', function() {
    weblitmap.normalizeTags(['']).should.eql([]);
    weblitmap.normalizeTags(['lolol']).should.eql([]);
  });

  it('should include parent skills, competencies', function() {
    weblitmap.normalizeTags(['WebMechanics'])
      .should.eql(["WebMechanics", "Exploring"]);
  });
});
