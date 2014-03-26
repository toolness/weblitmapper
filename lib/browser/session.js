var META_PREFIX = 'session-';

function refresh() {
  $('meta[name^="' + META_PREFIX + '"]').each(function() {
    var varName = $(this).attr('name').slice(META_PREFIX.length);
    exports[varName] = $(this).attr('content');
  });
}

refresh();

exports.refresh = refresh;
