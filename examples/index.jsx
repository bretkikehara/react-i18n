
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from '../src/index';

i18n.setConfig({
  url: './lang',
  asyncLoadError: function (err, obj) {
    console.error(err, obj);
  }
});

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
          fallback="common bundle did not load."
          options={{
            name: 'John',
          }} />
        <i18n.p
          tag="common.nonexistantMessage"
          fallback="common bundle loaded but message doesn't exist in bundle." />

        <i18n.p
          tag="landing.welcome"
          fallback="landing bundle did not load." />
        <i18n.p
          tag="contact.email"
          fallback="contact bundle doesn't exist" />
      </div>
    );
  }
});

ReactDOM.render(<Examples></Examples>, document.querySelector('#examples'));
