
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from '../src/index';

i18n.loadBundlesSync('en-US', {
  'common': {
    'helloWorld': 'Hello, {name}!',
  },
});

// Create Example Component
const Examples = React.createClass({
  render: function() {
    return (
      <div>
        <i18n.p
          tag="common.helloWorld"
          fallback="fallback"
          options={{
            name: 'John',
          }} />
      </div>
    );
  }
});

ReactDOM.render(<Examples></Examples>, document.querySelector('#examples'));
