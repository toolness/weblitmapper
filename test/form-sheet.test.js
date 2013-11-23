var assert = require('should');

var getFormSheet = require('../').getFormSheet;

var EXAMPLE_SHEET = [
  {'mainthing': 'main help text'},
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

function getExample(email, cb) {
  getFormSheet({
    sheet: FakeSheet(EXAMPLE_SHEET),
    fields: ['Main Thing'],
    email: email
  }, function(err, formSheet) {
    assert(err === null);
    cb(formSheet);
  });
}

describe('form-sheet', function() {
  it('includes help information for columns', function(done) {
    getExample('bar@example.org', function(formSheet) {
      formSheet.fields[0].help.should.eql('main help text');
      done();
    });
  });

  it('allows changing editable rows', function(done) {
    getExample('bar@example.org', function(formSheet) {
      var row = formSheet.editableRow;
      row.column('Main Thing').value = 'edited main bar';
      row.save(function(err, numChanged) {
        assert(err === null);
        numChanged.should.eql(1);
        formSheet.sheet.rawRows[2]['mainthing'].should.eql('edited main bar');
        done();
      });
    });
  });

  it('saves editable sheets that have no changes', function(done) {
    getExample('bar@example.org', function(formSheet) {
      formSheet.editableRow.save(function(err, numChanged) {
        assert(err === null);          
        numChanged.should.eql(0);
        done();
      });
    });
  });

  it('allows reading by emails that have access', function(done) {
    getExample('bar@example.org', function(formSheet) {
      formSheet.canView.should.be.true;
      var row = formSheet.editableRow;
      var col = row.column('Main Thing');
      col.value.should.eql('main bar');
      done();
    });
  });

  it('prevents saving of uneditable rows', function(done) {
    getExample('bar@example.org', function(formSheet) {
      formSheet.rows[0].column('Main Thing').value = 'CHANGED';
      formSheet.rows[0].save(function(err) {
        err.message.should.eql('row is not editable');
        formSheet.sheet.rawRows[1]['mainthing'].should.eql('main foo');
        done();
      });
    });
  });

  it('blocks emails that do not have access', function(done) {
    getExample('zzz@example.org', function(formSheet) {
      formSheet.canView.should.be.false;
      assert(formSheet.editableRow === null);
      done();
    });
  });
});
