import React from 'react';
import 'whatwg-fetch';
import { EventEmitter } from 'fbemitter';

const emitter = new EventEmitter();

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

const EVENTS = {
  LANG_CHANGE: 'langChange',
};

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

      load(bNames).then(() => {
        emitter.emit(EVENTS.LANG_CHANGE, oldValue, newValue);
      });
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

function load(bundleNames) {
  if (!bundleNames) {
    return Promise.reject();
  }

  const keys = typeof bundleNames === 'string' ? [bundleNames] : bundleNames;
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

function getMessage(localeKey) {
  if (typeof localeKey === 'string') {
    const [bName, bKey] = parseLocaleKey(localeKey);
    return (getBundle(bName) || {})[bKey];
  }
  return localeKey;
}

function renderI18n(localeKey, options, render = renderString) {
  const message = getMessage(localeKey);
  if (render === renderString) {
    return mapMessage(message, options, renderString).join('');
  }
  return mapMessage(message, options, render);
}

function onUpdate(localeKeys, callback) {
  load(localeKeys).then(callback);
  return emitter.addListener(lib.EVENTS.LANG_CHANGE, callback);
}

function forEach(obj, callback) {
  const fn = callback || noop;
  if (obj) {
    if (Array.isArray(obj)) {
      obj.forEach(fn);
    } else {
      Object.keys(obj).forEach((key) => {
        fn(obj[key], key);
      });
    }
  }
}

function batchRenderI18n(localeKeys, options) {
  const map = {};
  forEach(localeKeys, (localeKey, ref) => {
    if (typeof localeKey === 'object') {
      map[ref] = batchRenderI18n(localeKey, options);
    } else {
      map[ref] = renderI18n(localeKey, options);
    }
  });
  return map;
}

export default {
  getMessage,
  setConfig,
  getBundle,
  loadSync,
  load,
  parseLocaleKey,
  renderI18n,
  batchRenderI18n,
  EVENTS,
  on: emitter.addListener.bind(emitter),
  onUpdate,
};
