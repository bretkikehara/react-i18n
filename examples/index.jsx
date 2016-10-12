
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
    'clicked': 'Click {count}',
    'myLabel': "My Label",
  },
});

// Create Example Component
const Examples = React.createClass({
  getInitialState: function() {
    return {
      count: 0,
    }
  },
  clickHandler: function () {
    this.setState({
      count: this.state.count + 1,
    });
  },
  render: function() {
    return (
      <div>
        <i18n.p
          id="helloWorld"
          data-key="common.helloWorld"
          fallback="common bundle did not load."
          options={{
            name: 'John',
          }} />
        <i18n.p
          id="nonexistentMessage"
          data-key="common.nonexistentMessage"
          fallback="message does not exist" />

        <i18n.p
          id="welcome"
          data-key="landing.welcome"
          fallback="async load did not work" />

        <i18n.p
          id="email"
          data-key="contact.email"
          fallback="bundle does not exist" />

        <i18n.a
          id="a_clicked"
          data-key="common.clicked"
          options={{
            count: this.state.count,
          }}
          onClick={ this.clickHandler } />

        <i18n.button
          id="btn_clicked"
          data-key="common.clicked"
          options={{
            count: this.state.count,
          }}
          onClick={ this.clickHandler } />

        <div>
          <i18n.label
            id="myLabel"
            data-key="common.myLabel"
            for="myLabel" />

          <input type="text" id="myLabel" />
        </div>
      </div>
    );
  }
});

ReactDOM.render(<Examples></Examples>, document.querySelector('#examples'));
