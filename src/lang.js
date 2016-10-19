import React, { Children, PropTypes } from 'react';

import lib from './lib';

const Lang = React.createClass({
  propTypes: {
    lang: PropTypes.string,
    url: PropTypes.string,
    ext: PropTypes.string,
    children: PropTypes.node,
  },

  componentWillMount: function () {
    lib.setConfig({
      lang: this.props.lang,
      ext: this.props.ext,
      url: this.props.url,
    });
  },

  componentWillUnmount: function () {
    this.changeSubscription.remove();
  },

  render: function () {
    return Children.only(this.props.children);
  }
});

export default Lang;
