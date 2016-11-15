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

/**
* Sets the i18n configuration.
*
* @param {Object} conf i18n configuration map
*/
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

/**
* Converts i18n strings to templates arrays.
*
* @param {Object} bundle Map of BundleKey to BundleString
* @return {Object} Map of BundleKey to BundleMessage
*/
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

/**
* Parses a locale key.
*
* @example
*    const [bundleName, bundleKey] = i18n.parseLocaleKey('common.hello');
*
* @param {string} localeKey String of BundleName and BundleKey delimited by a comma
* @return {Array} BundleName and BundleKey
*/
function parseLocaleKey(localeKey) {
  return (localeKey || '').split('.').splice(0, 2);
}

/**
* Gets the bundle object.
*
* @example
*    const bundle = i18n.getBundle('common');
*
* @param {string} bName BundleName
* @return {Object} Map of BundleKey to BundleMessage
*/
function getBundle(bName) {
  return i18nBundles[bName];
}

/**
* Load all lang bundles synchronously. If bundles are loaded synchronously,
* then we should already know all languages that are supported.
*
* @example
*   i18n.loadSync({
*     'en-US': {
*       'common': {
*         'header': '{ project } examples',
*         'helloWorld': 'Hello, {name}!',
*         'clicked': 'Click {count}',
*           'myLabel': "My Label",
*       },
*     },
*     'fr-FR': {
*       'common': {
*         'header': '{ project } exemples',
*         'helloWorld': 'Bonjour, {name}!',
*         'clicked': 'Cliquez {count}',
*         'myLabel': "My Label",
*       },
*     },
*   });
*
* @param {Object} langBundles Map of locale to map of BundleName to map of BundleKey to BundleMessage
*/
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

/**
* Asynchronously load the bundle.
*
* @example
*   i18n.load('common').then(() => {
*     // bundles are loaded
*     const bundle = i18n.getBundle('common');
*     const str = i18n.renderI18n('common.hello', { name: 'John' });
*   });
*
* @param {Array|string} bundleNames Array of BundleNames or a single BundleName
* @return {Promise}
*/
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

function renderNode(item, index) {
  return (
    <span key={ index }>
      { item }
    </span>
  );
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

/**
* Render the i18n localeKey.
*
* @example
*   i18n.load('common').then(() => {
*     const str = i18n.renderI18n('common.hello', { name: 'John' });
*   });
*
* @param {string} localeKey String of BundleName and BundleKey delimited by a comma
* @param {Object} options Object of values that will interop'ed into the template.
* @param {function} render (Optional) Render callback. Default renderer is a string.
* @return {*} Returns a value depending on the renderer.
*/
function renderI18n(localeKey, options, render = renderString) {
  const message = getMessage(localeKey);
  if (render === renderString) {
    return mapMessage(message, options, renderString).join('');
  }
  return mapMessage(message, options, render);
}

/**
* Adds an event subscription when a bundle has been updated. The callback function will always
* execute at least 1, when `onUpdate` has been first defined.
*
* @example
*   let helloMessage;
*   const destroyUpdate = i18n.onUpdate('common', () => {
*     helloMessage = i18n.renderI18n('common.hello', { name: 'John' });
*   });
*
* @param {Array|string} bundleNames Array of BundleNames or a single BundleName
* @param {func} callback Callback when the message is updated.
* @return {func} Destroys the update event subscription.
*/
function onUpdate(localeKeys, callback) {
  load(localeKeys).then(callback);
  const listener = emitter.addListener(EVENTS.LANG_CHANGE, callback);
  return () => {
    listener.remove();
  };
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

/**
* Batch renders i18n localeKeys.
*
* @example
*   let messages;
*   const destroyUpdate = i18n.onUpdate('common', () => {
*     messages = i18n.renderI18n({
*       'greeting': 'common.hello',
*       'description': {
*          'mobile': 'common.description_mobile',
*          'tablet': 'common.description_tablet',
*          'desktop': 'common.description_desktop',
*        }
*     }, { name: 'John' });
*   });
*
* @param {Object} localeKeys Map of localeKeys
* @param {Object} options Object of values that will interop'ed into the template.
* @return {Object} Mirror object of the localeKeys keys map but as rendered strings.
*/
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
  RENDERER: {
    renderString,
    renderNode,
  },
  EVENTS,
  on: emitter.addListener.bind(emitter),
  onUpdate,
};
