var assert = require('should');

var getFormSheet = require('../').getFormSheet;

var EXAMPLE_SHEET = [
  {'mainthing': 'here is help text for main thing'},
  {'mainthing': 'main foo',
   'validemails': 'foo@example.org',
   'lasteditor': ''},
  {'mainthing': 'main bar',
   'validemails': 'bar@example.org',
   'lasteditor': ''}
];

function makeFakeRow(fields) {
  fields.save = function(cb) {
    process.nextTick(function() {
      cb(null);
    });
  };

  return fields;
}

function FakeSheet(rawRows) {
  var self = {};

  rawRows = JSON.parse(JSON.stringify(rawRows)).map(makeFakeRow);
  self.rawRows = rawRows;
  self.getInfo = function(cb) {
    process.nextTick(function() {
      cb(null, {worksheets: [{
        getRows: function(cb) {
          process.nextTick(function() {
            cb(null, rawRows);
          });
        }
      }]});
    });
  };

  return self;
}

describe('form-sheet', function() {
  it('works w/ emails that have access', function(done) {
    getFormSheet({
      sheet: FakeSheet(EXAMPLE_SHEET),
      fields: ['Main Thing'],
      email: 'bar@example.org'
    }, function(err, formSheet) {
      assert(err === null);
      formSheet.canView.should.be.true;
      var row = formSheet.editableRow;
      var col = row.column('Main Thing');
      col.value.should.eql('main bar');
      col.value = 'edited main bar';
      row.save(function(err, numChanged) {
        assert(err === null);
        numChanged.should.eql(1);
        formSheet.sheet.rawRows[2]['mainthing'].should.eql('edited main bar');
        row.save(function(err, numChanged) {
          assert(err === null);          
          numChanged.should.eql(0);
          done();
        });
      });
    });
  });

  it('works w/ emails that do not have access', function(done) {
    getFormSheet({
      sheet: FakeSheet(EXAMPLE_SHEET),
      fields: ['Main Thing'],
      email: 'zzz@example.org'
    }, function(err, formSheet) {
      assert(err === null);
      formSheet.canView.should.be.false;
      assert(formSheet.editableRow === null);
      formSheet.rows[0].save(function(err) {
        err.message.should.eql('row is not editable');
        done();
      });
    });
  });
});
