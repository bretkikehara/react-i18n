
import fetch from 'node-fetch';

function noop(err) {
  return err;
}

const i18nConfig = {
  global: '_i18n',
  lang: 'en-US',
  url: '',
  ext: 'lang.json',
  asyncLoadError: noop,
};

const i18nAsync =  {};

const TEMPLATE_I18N_REGEX = /{\s*?(\w+?)\s*?}/g;

function i18nCreateDelimiter(message) {
  let str = '!1@2#3';
  if (new RegExp(str).test(message)) {
    return str + str;
  }
  return str;
}

function setConfig(conf) {
  Object.keys(conf || {}).forEach((prop) => {
    i18nConfig[prop] = conf[prop];
  });
}

function templatize(bundle) {
  const templates = {};
  Object.keys(bundle).forEach((bKey) => {
    const bMessage = bundle[bKey];
    if (typeof bMessage === 'string') {
      const delimiter = i18nCreateDelimiter(bMessage);
      templates[bKey] = bMessage.replace(TEMPLATE_I18N_REGEX, (match) => {
        return `${delimiter}${match}${delimiter}`;
      })
      .split(delimiter);
    }
  });
  return templates;
}

function _parseLocaleKey(localeKey) {
  return (localeKey || '').split('.').splice(0, 2);
}

function getBundle(bName) {
  let lang = window[i18nConfig.global];
  return (lang || {})[bName];
}

function getMessage(localeKey, bKeyParam) {
  const [bName, bKey] = _parseLocaleKey(localeKey);
  return (getBundle(bName) || {})[bKey || bKeyParam];
}

function getMessages(langRefs) {
  const msgs = {};
  Object.keys(langRefs).forEach((ref) => {
    const value = langRefs[ref];
    if (typeof value === 'string') {
      // assumes that value is a locale key
      msgs[ref] = getMessage(value);
    } else {
      // assumes that value has nested locale keys
      msgs[ref] = getMessages(value);
    }
  });
  return msgs;
}

function _loadBundleSync(lang, bName, bMessages) {
  if (!window[i18nConfig.global] || i18nConfig.lang !== lang) {
    window[i18nConfig.global] = {};
  }
  window[i18nConfig.global][bName] = templatize(bMessages);
}

function loadBundlesSync(lang, bundles) {
  Object.keys(bundles).forEach((bName) => {
    _loadBundleSync(lang, bName, bundles[bName]);
  });
}

function dedup(bNames) {
  const obj = {};
  if (typeof bNames === 'string') {
    return [ bNames ];
  }
  (bNames || []).forEach((item) => {
    obj[item] = true;
  });
  return Object.keys(obj);
}

function _loadBundleAsync(localeKey) {
  // accepts bName or localeKey
  const [bName] = _parseLocaleKey(localeKey);
  const bundle = getBundle(bName);

  // resolve bundle if exists in memory
  if (bundle) {
    return Promise.resolve(bundle);
  }

  // reject if URL is not set.
  if (!i18nConfig.url) {
    return Promise.reject(new Error(`Set the i18n URL path to asynchronously load ${ bName } bundle.`));
  }

  // resolve bundle promise if already fetching
  if (i18nAsync[bName]) {
    return Promise.resolve(i18nAsync[bName]);
  }

  // fetch bundle!
  const url = `${ i18nConfig.url }/${ bName }.${ i18nConfig.ext }`;
  i18nAsync[bName] = fetch(url).then((resp) => {
    delete i18nAsync[bName];
    return resp.ok ? resp.json() : undefined;
  }).then((bMessages) => {
    if (bMessages) {
      _loadBundleSync(i18nConfig.lang, bName, bMessages);
    } else {
      return (i18nConfig.asyncLoadError || noop)(new Error(''), {
        bundle: bName,
        url,
      });
    }
  }, function () {

  });
  return i18nAsync[bName];
}

function loadBundlesAsync(localeKeys) {
  const bNames = localeKeys.map((localeKey) => {
    const [bName] = _parseLocaleKey(localeKey);
    return bName;
  });
  return Promise.all(dedup(bNames).map((bName) => {
    return _loadBundleAsync(bName);
  }));
}

function _renderMessage(message, options) {
  const opts = options || {};
  return (Array.isArray(message) ? message : []).map((item, index) => {
    if (!item) {
      return;
    }
    const matches = TEMPLATE_I18N_REGEX.exec(item);
    return (
      <span key={ index }>
        { matches ? opts[matches[1]] : item }
      </span>
    );
  });
}

function renderI18n(localeKey, options) {
  const message = getMessage(localeKey);
  return renderMessage(message, options);
}

export default {
  setConfig,
  getMessage,
  getMessages,
  _renderMessage,
  _loadBundleSync,
  loadBundlesSync,
  _loadBundleAsync,
  loadBundlesAsync,
  _parseLocaleKey,
  renderI18n,
}
