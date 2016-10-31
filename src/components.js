import React, { PropTypes } from 'react';

import lib from './lib';

const LOCALE_ATTR = 'data-i18n';

const DEFAULT_PROP_TYPES = {
  id: PropTypes.string,
  [LOCALE_ATTR]: PropTypes.string.isRequired,
  options: PropTypes.object,
  fallback: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

const PROP_TYPES = {
  a: {
    href: PropTypes.string,
    target: PropTypes.string,
  },
  button: {
    type: PropTypes.string,
  },
  label: {
    for: PropTypes.string,
  },
};

Object.keys(PROP_TYPES).forEach((key) => {
  PROP_TYPES[key] = Object.assign(PROP_TYPES[key], DEFAULT_PROP_TYPES);
});

function getInitialState(tagName) {
  return function () {
    return {
      tagName,
      message: [
        this.props.fallback,
      ],
    };
  };
}

function renderNode(item, index) {
  return (
    <span key={ index }>
      { item }
    </span>
  );
}

const PROP_WHITELIST = {
  id: 'id',
  className: 'className',
  onClick: 'onClick',
  href: 'href',
  target: 'target',
  [LOCALE_ATTR]: LOCALE_ATTR,
  type: 'type',
  for: 'htmlFor',
};

const DEFAULT_ELEM = {
  componentWillMount: function () {
    const localeKey = this.props[LOCALE_ATTR];

    lib.load(localeKey).then(this.updateMessage);
  },
  componentWillUnmount: function () {
    this.deleteChange();
    this.unmount = true;
  },
  updateMessage: function () {
    const localeKey = this.props[LOCALE_ATTR];
    const [bName, bKey] = lib.parseLocaleKey(localeKey);
    const message = (lib.getBundle(bName) || {})[bKey];
    if (!this.unmount && message) {
      this.setState({
        message,
      });
    }
  },
  filterProps: function () {
    const props = {};
    Object.keys(this.props).forEach((prop) => {
      const propKey = PROP_WHITELIST[prop];
      if (propKey) {
        props[propKey] = this.props[prop];
      }
    });
    return props;
  },
  render: function () {
    const state = this.state;
    const props = this.filterProps();
    return (
      <state.tagName { ...props }>
        { lib.renderI18n(state.message, this.props.options, renderNode) }
      </state.tagName>
    );
  },
};

const i18n = {};
const VALID_TAGS = [
  'p', 'span', 'a', 'strong', 'button',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'label',
];
VALID_TAGS.forEach((tagName) => {
  i18n[tagName] = React.createClass(Object.assign({
    getInitialState: getInitialState(tagName),
    propTypes: PROP_TYPES[tagName] || DEFAULT_PROP_TYPES,
  }, DEFAULT_ELEM));
});

export default i18n;
