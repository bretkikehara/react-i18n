import React from 'react';
import 'whatwg-fetch';

function noop(err) {
  return err;
}

const CONFIG = {
  lang: 'en-US',
  url: '',
  ext: 'lang.json',
  asyncLoadError: noop,
};

let i18nBundles = {};
const storePrefix = `i18n.${ window.location.host }`;
const store = window.sessionStorage;
const CACHE = {};

const TEMPLATE_I18N_REGEX = /{\s*?(\w+?)\s*?}/g;

function i18nCreateDelimiter(message) {
  const str = '!1@2#3';
  if (new RegExp(str).test(message)) {
    return str + str;
  }
  return str;
}

function nextTick(cb) {
  setTimeout(cb, 1);
}

function setConfig(conf) {
  Object.keys(conf || {}).forEach((prop) => {
    const oldValue = CONFIG[prop];
    const newValue = conf[prop];
    CONFIG[prop] = conf[prop];
    if (prop === 'lang') {
      const bNames = Object.keys(i18nBundles);
      const cache = getCache(CONFIG.lang) || {};
      setBundles(cache);

      load(bNames);
    }
  });
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
  return i18nBundles[bName];
}

function loadSync(langBundles) {
  if (langBundles) {
    Object.keys(langBundles).forEach((lang) => {
      setCache(lang, langBundles[lang]);
    });
    updateBundles(langBundles[CONFIG.lang]);
  }
}

function setCache(lang, bundles) {
  if (store) {
    store.setItem(`${ storePrefix }.${ lang }`, JSON.stringify(bundles || {}));
  } else {
    CACHE[lang] = bundles;
  }
}

function getCache(lang) {
  if (store) {
    const item = store.getItem(`${ storePrefix }.${ lang }`);
    return JSON.parse(item || '{}');
  } else {
    return CACHE[lang];
  }
}

function setBundles(bundles) {
  i18nBundles = {};
  updateBundles(bundles);
}

function updateBundles(bundles) {
  Object.keys(bundles).forEach((bName) => {
    i18nBundles[bName] = templatize(bundles[bName]);
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

  // resolve bundle if exists in memory
  if (bundle) {
    return Promise.resolve();
  }

  // reject if URL is not set.
  if (!CONFIG.url) {
    const message = `Set the i18n URL path to asynchronously load ${ bName } bundle.`;
    return Promise.reject(new Error(message));
  }

  // fetch bundle!
  const url = normalizeURL(`${ CONFIG.url }/${ CONFIG.lang }/${ bName }.${ CONFIG.ext }`);
  i18nBundles[bName] = fetch(url).then((resp) => {
    return resp.ok ? resp.json() : Promise.reject();
  }).then((bMessages) => {
    const cache = getCache(CONFIG.lang) || {};
    setCache(CONFIG.lang, Object.assign(cache, { [bName]: bMessages }));
    i18nBundles[bName] = templatize(bMessages);
  }, () => {
    const message = `${ bName } bundle failed to load.`;
    return (CONFIG.asyncLoadError || noop)(new Error(message), {
      bundle: bName,
      url,
    });
  });
  return i18nBundles[bName];
}

function load(localeKeys) {
  if (!localeKeys) {
    return Promise.reject();
  }

  const keys = typeof localeKeys === 'string' ? [localeKeys] : localeKeys;
  const bNames = dedup(keys.map((localeKey) => {
    const [bName] = parseLocaleKey(localeKey);
    return bName;
  }));
  return Promise.all(bNames.map((bName) => {
    return loadBundleAsync(bName);
  }));
}

function renderString(item) {
  return item;
}

function mapMessage(message, opts, callback) {
  return (Array.isArray(message) ? message : []).map((item, index) => {
    if (!item) {
      return undefined;
    }
    const matches = TEMPLATE_I18N_REGEX.exec(item);
    return callback(matches ? (opts || {})[matches[1]] : item, index);
  });
}

function renderI18n(localeKey, options, render = renderString) {
  const message = typeof localeKey === 'string' ? getMessage(localeKey) : localeKey;
  if (render === renderString) {
    return mapMessage(message, options, renderString).join('');
  }
  return mapMessage(message, options, render);
}

export default {
  setConfig,
  getBundle,
  loadSync,
  load,
  parseLocaleKey,
  renderI18n,
};
