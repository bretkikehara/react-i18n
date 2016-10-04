(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('node-fetch')) :
  typeof define === 'function' && define.amd ? define(['react', 'node-fetch'], factory) :
  (global.i18n = factory(global.React,global.fetch));
}(this, (function (React$1,fetch) { 'use strict';

var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
fetch = 'default' in fetch ? fetch['default'] : fetch;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function noop(err) {
  return err;
}

var i18nConfig = {
  global: '_i18n',
  lang: 'en-US',
  url: '',
  ext: 'lang.json',
  asyncLoadError: noop
};

var i18nAsync = {};

var TEMPLATE_I18N_REGEX = /{\s*?(\w+?)\s*?}/g;

function i18nCreateDelimiter(message) {
  var str = '!1@2#3';
  if (new RegExp(str).test(message)) {
    return str + str;
  }
  return str;
}

function setConfig(conf) {
  Object.keys(conf || {}).forEach(function (prop) {
    i18nConfig[prop] = conf[prop];
  });
}

function templatize(bundle) {
  var templates = {};
  Object.keys(bundle).forEach(function (bKey) {
    var bMessage = bundle[bKey];
    if (typeof bMessage === 'string') {
      (function () {
        var delimiter = i18nCreateDelimiter(bMessage);
        templates[bKey] = bMessage.replace(TEMPLATE_I18N_REGEX, function (match) {
          return '' + delimiter + match + delimiter;
        }).split(delimiter);
      })();
    }
  });
  return templates;
}

function _parseLocaleKey(localeKey) {
  return (localeKey || '').split('.').splice(0, 2);
}

function getBundle(bName) {
  var lang = window[i18nConfig.global];
  return (lang || {})[bName];
}

function getMessage(localeKey, bKeyParam) {
  var _parseLocaleKey2 = _parseLocaleKey(localeKey);

  var _parseLocaleKey3 = slicedToArray(_parseLocaleKey2, 2);

  var bName = _parseLocaleKey3[0];
  var bKey = _parseLocaleKey3[1];

  return (getBundle(bName) || {})[bKey || bKeyParam];
}

function getMessages(langRefs) {
  var msgs = {};
  Object.keys(langRefs).forEach(function (ref) {
    var value = langRefs[ref];
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
  Object.keys(bundles).forEach(function (bName) {
    _loadBundleSync(lang, bName, bundles[bName]);
  });
}

function dedup(bNames) {
  var obj = {};
  if (typeof bNames === 'string') {
    return [bNames];
  }
  (bNames || []).forEach(function (item) {
    obj[item] = true;
  });
  return Object.keys(obj);
}

function _loadBundleAsync(localeKey) {
  // accepts bName or localeKey
  var _parseLocaleKey4 = _parseLocaleKey(localeKey);

  var _parseLocaleKey5 = slicedToArray(_parseLocaleKey4, 1);

  var bName = _parseLocaleKey5[0];

  var bundle = getBundle(bName);

  // resolve bundle if exists in memory
  if (bundle) {
    return Promise.resolve(bundle);
  }

  // reject if URL is not set.
  if (!i18nConfig.url) {
    return Promise.reject(new Error('Set the i18n URL path to asynchronously load ' + bName + ' bundle.'));
  }

  // resolve bundle promise if already fetching
  if (i18nAsync[bName]) {
    return Promise.resolve(i18nAsync[bName]);
  }

  // fetch bundle!
  var url = i18nConfig.url + '/' + bName + '.' + i18nConfig.ext;
  i18nAsync[bName] = fetch(url).then(function (resp) {
    delete i18nAsync[bName];
    return resp.ok ? resp.json() : undefined;
  }).then(function (bMessages) {
    if (bMessages) {
      _loadBundleSync(i18nConfig.lang, bName, bMessages);
    } else {
      return (i18nConfig.asyncLoadError || noop)(new Error(''), {
        bundle: bName,
        url: url
      });
    }
  }, function () {});
  return i18nAsync[bName];
}

function loadBundlesAsync(localeKeys) {
  var bNames = localeKeys.map(function (localeKey) {
    var _parseLocaleKey6 = _parseLocaleKey(localeKey);

    var _parseLocaleKey7 = slicedToArray(_parseLocaleKey6, 1);

    var bName = _parseLocaleKey7[0];

    return bName;
  });
  return Promise.all(dedup(bNames).map(function (bName) {
    return _loadBundleAsync(bName);
  }));
}

function _renderMessage(message, options) {
  var opts = options || {};
  return (Array.isArray(message) ? message : []).map(function (item, index) {
    if (!item) {
      return;
    }
    var matches = TEMPLATE_I18N_REGEX.exec(item);
    return React.createElement(
      'span',
      { key: index },
      matches ? opts[matches[1]] : item
    );
  });
}

function renderI18n(localeKey, options) {
  var message = getMessage(localeKey);
  return renderMessage(message, options);
}

var lib = {
  setConfig: setConfig,
  getMessage: getMessage,
  getMessages: getMessages,
  _renderMessage: _renderMessage,
  _loadBundleSync: _loadBundleSync,
  loadBundlesSync: loadBundlesSync,
  _loadBundleAsync: _loadBundleAsync,
  loadBundlesAsync: loadBundlesAsync,
  _parseLocaleKey: _parseLocaleKey,
  renderI18n: renderI18n
};

var DEFAULT_PROP_TYPES = {
  tag: React$1.PropTypes.string.isRequired,
  options: React$1.PropTypes.object,
  fallback: React$1.PropTypes.string,
  className: React$1.PropTypes.string,
  onClick: React$1.PropTypes.func
};

var PROP_TYPES = {
  a: Object.assign({
    href: React$1.PropTypes.string,
    target: React$1.PropTypes.string
  }, DEFAULT_PROP_TYPES)
};

function getPropTypes(tagName) {
  return PROP_TYPES[tagName] || DEFAULT_PROP_TYPES;
}

function getInitialState(tagName) {
  return function () {
    return {
      tagName: tagName,
      message: [this.props.fallback]
    };
  };
}

var DEFAULT_RENDER_PROPS = {
  className: true
};

var ELEM_RENDER_PROPS = {
  a: Object.assign({
    href: true,
    target: true,
    onClick: true,
    className: true
  }, DEFAULT_RENDER_PROPS)
};

function renderDataProp(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON.stringify(value) : value;
}

function filterProps(tagName) {
  var tagProps = ELEM_RENDER_PROPS[tagName] || DEFAULT_RENDER_PROPS;
  return function () {
    var _this = this;

    var props = {};
    Object.keys(this.props).forEach(function (prop) {
      var isElemProp = tagProps[prop];
      var propKey = isElemProp ? prop : 'data-' + prop;
      var propValue = _this.props[prop];
      props[propKey] = isElemProp ? propValue : renderDataProp(propValue);
    });
    return props;
  };
}

var DEFAULT_ELEM = {
  componentWillMount: function componentWillMount() {
    var _this2 = this;

    var localeKey = this.props.tag;
    lib._loadBundleAsync(localeKey).then(function () {
      var message = lib.getMessage(localeKey);
      if (message) {
        _this2.setState({
          message: message
        });
      }
    });
  },
  render: function render() {
    var state = this.state;
    var props = this.filterProps();
    return React$1__default.createElement(
      state.tagName,
      props,
      lib._renderMessage(state.message, this.props.options)
    );
  }
};

var i18n = {};
['p', 'span', 'a', 'strong'].forEach(function (tagName) {
  i18n[tagName] = React$1__default.createClass(Object.assign({
    getInitialState: getInitialState(tagName),
    propTypes: getPropTypes(tagName),
    filterProps: filterProps(tagName)
  }, DEFAULT_ELEM));
});

var index = Object.assign({}, i18n, lib);

return index;

})));
