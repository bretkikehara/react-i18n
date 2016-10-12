module.exports = {
  baseUrl: 'http://local.dev',
  port: 4445,
  services: ['sauce'],
  user: process.env.SAUCE_USER,
  key: process.env.SAUCE_KEY,
  sauceConnect: true,
  sauceConnectOpts: {
    tunnelIdentifier: 'react-i18n',
  },
};
