var assert = require('should');
var sinon = require('sinon');

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
  self.info = {
    updated: '2013-11-23T13:54:59.691Z 350',
    worksheets: [{
      id: 'worksheet',
      getRows: sinon.spy(function(cb) {
        process.nextTick(function() {
          cb(null, rawRows);
        });
      })
    }]
  };
  self.rawRows = rawRows;
  self.getInfo = sinon.spy(function(cb) {
    process.nextTick(function() {
      cb(null, self.info);
    });
  });

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
  it('transparently caches', function(done) {
    var sheet = FakeSheet(EXAMPLE_SHEET);
    var opts = {sheet: sheet, fields: [], email: 'u@example.org'};
    getFormSheet(opts, function(err, formSheet) {
      assert(err === null);
      sheet.info.worksheets[0].getRows.callCount.should.eql(1);
      sheet.getInfo.callCount.should.eql(1);
      getFormSheet(opts, function(err, formSheet) {
        sheet.info.worksheets[0].getRows.callCount.should.eql(1);
        sheet.getInfo.callCount.should.eql(2);
        done();
      });
    });
  });

  it('allows email to be null/undefined', function(done) {
    getExample(undefined, function(formSheet) {
      formSheet.canView.should.be.false;
      done();
    });
  });

  it('defines toString() on columns to return value', function(done) {
    getExample(undefined, function(formSheet) {
      var col = formSheet.rows[0].column('Main Thing');
      col.toString().should.eql(col.value);
      done();
    });
  });

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
