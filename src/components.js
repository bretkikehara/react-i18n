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
  option: {
    value: PropTypes.string,
  }
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

const PROP_WHITELIST = {
  id: 'id',
  className: 'className',
  onClick: 'onClick',
  href: 'href',
  target: 'target',
  [LOCALE_ATTR]: LOCALE_ATTR,
  type: 'type',
  for: 'htmlFor',
  value: 'value',
};

const RENDERER = lib.RENDERER;

const DEFAULT_ELEM = {
  componentWillMount: function () {
    const localeKey = this.props[LOCALE_ATTR];
    this.destroyUpdate = lib.onUpdate(localeKey, () => {
      this.updateMessage(this.props);
    });

    this.renderer = this.state.tagName === 'option' ? RENDERER.renderString : RENDERER.renderNode;
  },
  componentWillUnmount: function () {
    this.destroyUpdate();
    this.unmount = true;
  },
  componentWillReceiveProps: function (nextProps) {
    this.updateMessage(nextProps);
  },
  updateMessage: function (props) {
    const localeKey = props[LOCALE_ATTR];
    const message = lib.getMessage(localeKey);
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
        { lib.renderI18n(state.message, this.props.options, this.renderer) }
      </state.tagName>
    );
  },
};

const i18n = {};
const VALID_TAGS = [
  'p', 'span', 'a', 'strong', 'button',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'label', 'option',
];
VALID_TAGS.forEach((tagName) => {
  i18n[tagName] = React.createClass(Object.assign({
    getInitialState: getInitialState(tagName),
    propTypes: PROP_TYPES[tagName] || DEFAULT_PROP_TYPES,
  }, DEFAULT_ELEM));
});

export default i18n;
