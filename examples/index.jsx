
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from '../src/index';

const LANGS = [
  {
    label: 'langauges.en-US',
    value: 'en-US',
  },
  {
    label: 'langauges.fr-FR',
    value: 'fr-FR',
  }
];

i18n.setConfig({
  url: './lang',
  asyncLoadError: function (err, obj) {
    console.error(err, obj);
  }
});

const LANGUAGES_BUNDLE = {
  'en-US': 'English',
  'fr-FR': 'Français',
};

i18n.loadSync({
  'en-US': {
    'langauges': LANGUAGES_BUNDLE,
    'common': {
      'header': '{ project } examples',
      'helloWorld': 'Hello, {name}!',
      'clicked': 'Click {count}',
      'myLabel': "My Label",
    },
  },
  'fr-FR': {
    'langauges': LANGUAGES_BUNDLE,
    'common': {
      'header': '{ project } exemples',
      'helloWorld': 'Bonjour, {name}!',
      'clicked': 'Cliquez {count}',
      'myLabel': "My Label",
    },
  },
});

let CONSTANT_EXAMPLE;

/*
  function updateLang() {
    i18n.load('common').then(() => {
      CONSTANT_EXAMPLE = i18n.renderI18n('common.header', {
        project: 'i18n',
      });
    });
  }
  updateLang();

  i18n.on(i18n.EVENTS.LANG_CHANGE, () => {
    updateLang();
  });
*/
const destroy = i18n.onUpdate('common', function () {
  CONSTANT_EXAMPLE = i18n.renderI18n('common.header', {
    project: 'i18n',
  });
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
  changeLang: function ({ target }) {
    i18n.setConfig({
      lang: target.value,
    });
  },
  render: function() {
    return (
      <div>
        <select onChange={ this.changeLang }>
          { LANGS.map((lang, index) => {
            return (
              <i18n.option
                key={ index }
                value={ lang.value }
                data-i18n={ lang.label } />
            );
          }) }
        </select>

        <h1>{ CONSTANT_EXAMPLE }</h1>

        <i18n.p
          id="helloWorld"
          data-i18n="common.helloWorld"
          fallback="common bundle did not load."
          options={{
            name: 'John',
          }} />
        <i18n.p
          id="nonexistentMessage"
          data-i18n="common.nonexistentMessage"
          fallback="message does not exist" />

        <i18n.p
          id="welcome"
          data-i18n="landing.welcome"
          fallback="async load did not work" />

        <i18n.p
          id="email"
          data-i18n="contact.email"
          fallback="bundle does not exist" />

        <i18n.a
          id="a_clicked"
          data-i18n="common.clicked"
          options={{
            count: this.state.count,
          }}
          onClick={ this.clickHandler } />

        <i18n.button
          id="btn_clicked"
          data-i18n="common.clicked"
          options={{
            count: this.state.count,
          }}
          onClick={ this.clickHandler } />

        <div>
          <i18n.label
            id="myLabel"
            data-i18n="common.myLabel"
            for="myLabel" />

          <input type="text" id="myLabel" />
        </div>
      </div>
    );
  }
});

ReactDOM.render(<Examples></Examples>, document.querySelector('#examples'));

export default i18n;
