import React from 'react';
import fetch from 'whatwg-fetch';

function noop(err) {
  return err;
}

const CONFIG = {
  lang: 'en-US',
  url: '',
  ext: 'lang.json',
  asyncLoadError: noop,
};

const I18N = {
  bundle: {},
  errors: {},
  async: {},
};

const TEMPLATE_I18N_REGEX = /{\s*?(\w+?)\s*?}/g;

function i18nCreateDelimiter(message) {
  const str = '!1@2#3';
  if (new RegExp(str).test(message)) {
    return str + str;
  }
  return str;
}

function setConfig(conf) {
  Object.keys(conf || {}).forEach((prop) => {
    CONFIG[prop] = conf[prop];
  });
}

function setError(bName, err) {
  I18N.errors[bName] = err;
}

function hasError(bName) {
  return !!I18N.errors[bName];
}

function getError(bName) {
  return I18N.errors[bName];
}

function templatize(bundle) {
  const templates = {};
  Object.keys(bundle).forEach((bKey) => {
    const bMessage = bundle[bKey];
    if (typeof bMessage === 'string') {
      const delimiter = i18nCreateDelimiter(bMessage);
      templates[bKey] = bMessage.replace(TEMPLATE_I18N_REGEX, (match) => {
        return `${ delimiter }${ match }${ delimiter }`;
      })
      .split(delimiter);
    }
  });
  return templates;
}

function parseLocaleKey(localeKey) {
  return (localeKey || '').split('.').splice(0, 2);
}

function getBundle(bName) {
  return I18N.bundle[bName];
}

function getMessage(localeKey, bKeyParam) {
  const [bName, bKey] = parseLocaleKey(localeKey);
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


function loadBundleSync(lang, bName, bMessages) {
  I18N.bundle[bName] = templatize(bMessages);
}

function loadBundlesSync(lang, bundles) {
  Object.keys(bundles).forEach((bName) => {
    loadBundleSync(lang, bName, bundles[bName]);
  });
}

function dedup(bNames) {
  const obj = {};
  if (typeof bNames === 'string') {
    return [bNames];
  }
  (bNames || []).forEach((item) => {
    obj[item] = true;
  });
  return Object.keys(obj);
}

function normalizeURL(url) {
  return url.replace(/\/\//g, '/');
}

function loadBundleAsync(localeKey) {
  // accepts bName or localeKey
  const [bName] = parseLocaleKey(localeKey);
  const bundle = getBundle(bName);

  if (hasError(bName)) {
    return Promise.reject(new Error(getError(bName)));
  }

  // resolve bundle if exists in memory
  if (bundle) {
    return Promise.resolve(bundle);
  }

  // reject if URL is not set.
  if (!CONFIG.url) {
    const message = `Set the i18n URL path to asynchronously load ${ bName } bundle.`;
    setError(bName, message);
    return Promise.reject(new Error(message));
  }

  // resolve bundle promise if already fetching
  if (I18N.async[bName]) {
    return Promise.resolve(I18N.async[bName]);
  }

  // fetch bundle!
  const url = normalizeURL(`${ CONFIG.url }/${ CONFIG.lang }/${ bName }.${ CONFIG.ext }`);
  I18N.async[bName] = fetch(url).then((resp) => {
    return resp.ok ? resp.json() : Promise.reject();
  }).then((bMessages) => {
    loadBundleSync(CONFIG.lang, bName, bMessages || {});
    delete I18N.async[bName];
  }, () => {
    const message = `${ bName } bundle failed to load.`;
    setError(bName, message);
    return (CONFIG.asyncLoadError || noop)(new Error(message), {
      bundle: bName,
      url,
    });
  });
  return I18N.async[bName];
}

function loadBundlesAsync(localeKeys) {
  const bNames = localeKeys.map((localeKey) => {
    const [bName] = parseLocaleKey(localeKey);
    return bName;
  });
  return Promise.all(dedup(bNames).map((bName) => {
    return loadBundleAsync(bName);
  }));
}

function renderMessage(message, options) {
  const opts = options || {};
  return (Array.isArray(message) ? message : []).map((item, index) => {
    if (!item) {
      return undefined;
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
  renderMessage,
  loadBundleSync,
  loadBundlesSync,
  loadBundleAsync,
  loadBundlesAsync,
  parseLocaleKey,
  renderI18n,
};
