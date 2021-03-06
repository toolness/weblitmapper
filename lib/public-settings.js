var BROWSER_EXPORTED_ENV_VAR = '_SETTINGS_ENV';

var _exportedEnv = {};
var e = exports;

function exportedEnv(name) {
  return process.browser ? window[BROWSER_EXPORTED_ENV_VAR][name]
                         : _exportedEnv[name] = process.env[name] || '';
}

e.WEBLIT_TAG_PREFIX = 'weblit-';
e.ORIGIN = exportedEnv('ORIGIN');
e.DISQUS_SHORTNAME = exportedEnv('DISQUS_SHORTNAME');
e.DISQUS_ORIGIN = exportedEnv('DISQUS_ORIGIN') || e.ORIGIN;
e.WEBMAKER_URL = exportedEnv('WEBMAKER_URL') || 'https://webmaker.org';

e.exportToBrowser = function exportToBrowser() {
  return 'window.' + BROWSER_EXPORTED_ENV_VAR + ' = ' +
         JSON.stringify(_exportedEnv, null, 2) + ';\n';
};
