import React, { Component, PropTypes } from 'react';
import fetch from 'node-fetch';

import lib from './lib';

const DEFAULT_PROP_TYPES = {
  tag: PropTypes.string.isRequired,
  options: PropTypes.object,
  fallback: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

const PROP_TYPES = {
  a: Object.assign({
    href: PropTypes.string,
    target: PropTypes.string,
  }, DEFAULT_PROP_TYPES),
};

function getPropTypes(tagName) {
  return PROP_TYPES[tagName] || DEFAULT_PROP_TYPES;
}

function getInitialState(tagName) {
  return function() {
    return {
      tagName,
      message: [ this.props.fallback ],
    };
  };
};

const DEFAULT_RENDER_PROPS = {
  className: true,
};

const ELEM_RENDER_PROPS = {
  a: Object.assign({
    href: true,
    target: true,
    onClick: true,
    className: true,
  }, DEFAULT_RENDER_PROPS),
};

function renderDataProp(value) {
  return typeof value === 'object' ? JSON.stringify(value) : value;
}

function filterProps(tagName) {
  const tagProps = ELEM_RENDER_PROPS[tagName] || DEFAULT_RENDER_PROPS;
  return function () {
    const props = {};
    Object.keys(this.props).forEach((prop) => {
      const isElemProp = tagProps[prop];
      const propKey = isElemProp ? prop : `data-${ prop }`;
      const propValue = this.props[prop];
      props[propKey] = isElemProp ? propValue : renderDataProp(propValue);
    });
    return props;
  };
}

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
['p', 'span', 'a', 'strong'].forEach((tagName) => {
  i18n[tagName] = React.createClass(Object.assign({
    getInitialState: getInitialState(tagName),
    propTypes: getPropTypes(tagName),
    filterProps: filterProps(tagName),
  }, DEFAULT_ELEM));
});

export default i18n;
