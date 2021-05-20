const CracoLessPlugin = require('craco-less')

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { 
                '@primary-color': 'rgb(116, 167, 0)',
                '@font-family': `'Plex', 'Roboto', 'Open Sans', sans-serif`
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}
