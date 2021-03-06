React i18n
==============================

React i18n facilitates localizing your application using multiple languages. The idea behind this library is to group localization files into smaller bundle for easier digestion. Lazy loading is supported out of the box.

Bundle text can be managed manually using JSON/es5 modules or automatically using Google Sheets. [i18n-cli](https://github.com/bretkikehara/i18n-cli) will aide in importing from Google Sheets and exporting existing bundles to CSV.

### Another localization library!!!
1. Ease of migrating html.
  Use existing tags such as paragraph and span tags, just prefix the exising tags and add the `data-i18n` attribute.
  ```
  <p>
    Hello { name }!
  </p>
  ```
  becomes
  ```
  i18n.loadSync({
    'en-US': {
      common: {
        helloUser: 'Hello { name }!',
      }
    }
  });

  <i18n.p
    data-i18n="common.helloUser"
    className=""
    fallback=""
    options={{
      name: 'John',
    }}
  />
  ```
2. Avoid injecting text via `innerHTML` since this is counter intuitive to react lifecycle rendering. In other words, `innerHTML` doesn't play well with nested React nodes.
```
  <i18n.p
    data-i18n="common.helloUser"
    className=""
    fallback=""
    options={{
      name: (
        <myCustomComponent>
          John
        <myCustomComponent>
      ),
    }}
  />
```
3. Unopinionated data formatting. This lib facilitates localization message rendering. Data formatting library must be provided by the user.
```
  i18n.loadSync({
    'en-US': {
      common: {
        callUsNow: 'Call {phoneNumber} to work with a licensed Advisor',
      }
    }
  });

  <i18n.p
    data-i18n="common.callUsNow"
    className=""
    fallback=""
    options={{
      phoneNumber: '800-123-4567',
    }}
  />

  <i18n.p
    data-i18n="common.callUsNow"
    className=""
    fallback=""
    options={{
      phoneNumber: '(800) 123-4567',
    }}
  />
```

# Quickstart

This quickstart will cover the basic steps to use the react-i18n component. It is still necessary to load the localization bundles, so refer the [Load bundles section](#loading-bundles) for more details.

To add features to this project, look at the [Setup Development Environment](#setup-development-environment) for more information.

1. Save to package.json
    ```sh
    $ npm i --save @bretkikehara/react-i18n
    ````

2. Configure the localization inside your app base:
    ```js
    import i18n from 'react-i18n';

    i18n.setConfig({ ... });
    ```

3. [Load your localization bundles](#loading-bundles)!
4. Define your JSX component:
    ```js
    import i18n from 'react-i18n';

    // creates the JSX node
    const paragraph = (
      <i18n.p
        className="my-custom-class"
        data-i18n="common.helloWorld"
        options={{
          name: "John"
        }}
        fallback="Hello world!" />
    );
    ```
    
# Bundle file structure

### JSON bundles

JSON bundles should be nested inside its respective localization.

```
├── lang
│   ├── en-US
│   │   ├── common.lang.json
│   │   ├── myPage.lang.json
│   ├── fr-FR
│   │   ├── common.lang.json
│   │   ├── myPage.lang.json
```

### Module bundles

Module bundles should be nested in the same manner as the JSON bundles, but also include an index.js for easy import of the bundles for synchronous loading.

```
├── lang
│   ├── index.js
│   ├── en-US
│   │   ├── index.js
│   │   ├── common.lang.js
│   │   ├── myPage.lang.js
│   ├── fr-FR
│   │   ├── index.js
│   │   ├── common.lang.js
│   │   ├── myPage.lang.js
```

# Loading Bundles

The preferred method is to asynchronously load your localization bundles to support multiple languages without needing to have the all bundles at page load. For the sake of speed, sync loading is also included.

## Loading Bundles - sync

Use `loadSync` to load multiple bundles on all supported locales on application init. For example, if French and English are the only supported languages:

```js
import i18n from 'react-i18n';
import bundles from '../i18n/index';

i18n.setConfig({ ... });

/**
* bundles = {
*  'en-US': {
*    common: {
*      helloWorld: "Hello {name}!",
*    }
*  },
*  'fr-FR': {
*    common: {
*      helloWorld: "Bonjour {name}!",
*    }
*  },
* }
*/
i18n.loadSync(bundles);

const node = <i18n.p data-i18n="common.helloWorld" options={{ name: 'John' }} />
```

## Loading Bundles - async

To asynchronously load the bundles, set the `url` config property. All localization bundles should be available at this URL.

```js
import i18n from 'react-i18n';

i18n.setConfig({
  url: 'http://example.com/lang'
});

// The ajax call will automatically execute under the hood.
const node = <i18n.p tag="common.helloWorld" options={{ name: 'John' }} />
```

# Setup Development Environment

Run these commands to setup your local development environment. It is assumed that Java Development Kit has alredy been installed.

```sh
$ git clone https://github.com/bretkikehara/react-i18n.git
$ cd react-i18n
$ npm install
$ npm run selenium:install
$ npm run selenium
$ npm run test
```

### Problems running Selenium?

1. Check is JDK is available in your path.
    ```sh
    $ javac -version
    ```

2. Is `selenium-standalone` installed globally? If so, remove the local `selenium-standalone` from node_modules.
    ```sh
    $ rm -rf node_mdules/selenium-standalone
    ```

# Folders dist vs lib

The `lib` and `dist` folder exists to fulfill different scenarios where the library may come in handy. The `lib` holds the transpiled es5 module ready to be included Webpack or Browerify. The `dist` is useful to load script tag since its a prepacked umd module.

# Publish release

Bump the version in the `package.json` according to [semantic versioning](http://semver.org/). The build task must be explicitly run due to [npm issue 3059](https://github.com/npm/npm/issues/3059).

```sh
$ npm run release && npm publish
```
