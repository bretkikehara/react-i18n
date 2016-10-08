import React, { Component, PropTypes } from 'react';
import fetch from 'node-fetch';

import lib from './lib';

const DEFAULT_PROP_TYPES = {
  id: PropTypes.string,
  tag: PropTypes.string.isRequired,
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

Object.keys(PROP_TYPES).forEach(function (key) {
  PROP_TYPES[key] = Object.assign(PROP_TYPES[key], DEFAULT_PROP_TYPES);
});

function getInitialState(tagName) {
  return function() {
    return {
      tagName,
      message: [ this.props.fallback ],
    };
  };
};

const PROP_WHITELIST = {
  id: 'id',
  className: 'className',
  onClick: 'onClick',
  href: 'href',
  target: 'target',
  tag: 'data-tag',
  type: 'type',
  for: 'htmlFor',
};

const DEFAULT_ELEM = {
  componentWillMount: function() {
    const localeKey = this.props.tag;
    lib._loadBundleAsync(localeKey).then(() => {
      const message = lib.getMessage(localeKey);
      if (message) {
        this.setState({
          message,
        });
      }
    });
  },
  filterProps: function() {
    const props = {};
    Object.keys(this.props).forEach((prop) => {
      const propKey = PROP_WHITELIST[prop];
      if (propKey) {
        props[propKey] = this.props[prop];
      }
    });
    return props;
  },
  render: function() {
    const state = this.state;
    const props = this.filterProps();
    return (
      <state.tagName { ...props }>
        { lib._renderMessage(state.message, this.props.options) }
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
