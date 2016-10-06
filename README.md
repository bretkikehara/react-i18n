React i18n
==============================

React i18n facilitates localizing your application using multiple languages. The idea behind this library is to use bundles localization files into smaller parts for asynchronous digestion.

# Quickstart

This quickstart will cover the basic steps to use the react-i18n component. It is still necessary to load the localization bundles, so refer the [Load bundles section](#loading-bundles) for more details.

To add features to this project, look at the [Setup Development Environment](#setup-development-environment) for more information.

1. Save to package.json
    `npm i --save react-i18n`
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
                tag="common.helloWorld"
                options={{
                    name: "John"
                }} />
        );
    ```

# Loading Bundles

The preferred method is to asynchronously load your localization bundles to support multiple languages without needing to have the all bundles at page load. For the sake of speed, sync loading is also included.

## Loading Bundles - sync

Use `loadBundlesSync` or `loadBundleSync` to load multiple bundles or a single bundle, respectively.

```js
    import i18n from 'react-i18n';
    import bundles from '../i18n/en-US/index';

    i18n.setConfig({ ... });
    i18n.loadBundlesSync('en-US', {
        common: {
            helloWorld: "Hello {name}!",
        }
    });
```

## Loading Bundles - async

To asynchronously load the bundles, set the `url` config property. All localization bundles should be available at this URL.

```js
    import i18n from 'react-i18n';
    import bundles from '../i18n/en-US/index';

    i18n.setConfig({
        url: 'http://example.com/lang'
    });
```

#### Bundle URL

For example at this URL `http://example.com/lang`, the directory structure should be as follows:

```
├── lang
│   ├── en-US
│   │   ├── common.lang.json
│   │   ├── myPage.lang.json
│   ├── fr-FR
│   │   ├── common.lang.json
│   │   ├── myPage.lang.json
```

# Setup Development Environment

Run these commands to setup your local development environment.

```sh
$ git clone https://github.com/bretkikehara/react-i18n.git
$ cd react-i18n
$ npm i
$ npm run selenium:install
$ npm run test
```

