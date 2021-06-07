const pkg = require('./package')
const webpack = require('webpack')

const timestamp = new Date().getTime()

const useDev = process.env.FOR === 'dev'

module.exports = {
  publicRuntimeConfig: {
    version: pkg.version,
    useDev,
    url: useDev // this is to get the right social media card images for prod and dev
      ? 'https://dev.opennem.org.au'
      : 'https://opennem.org.au'
  },

  env: {
    mapboxToken: process.env.MAPBOX_TOKEN || '',
    DATA_BASE_URL: useDev
      ? 'https://data.dev.opennem.org.au/'
      : process.env.DATA_BASE_URL
  },

  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000
  },

  head: {
    htmlAttrs: {
      lang: 'en-AU',
      translate: 'no'
    },
    titleTemplate: 'OpenNEM%s',
    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'content-language', content: 'en-AU' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=no'
      },
      { hid: 'description', name: 'description', content: pkg.description },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content:
          'OpenNEM: An Open Platform for National Electricity Market Data'
      },
      { name: 'twitter:site', content: '@OpenNEM' },
      { name: 'twitter:description', content: pkg.description },
      {
        hid: 'twitter:image:src',
        name: 'twitter:image:src',
        content: 'https://opennem.org.au/images/screens/opennem-nem.png'
      },
      // Facebook
      {
        hid: 'og:title',
        property: 'og:title',
        content:
          'OpenNEM: An Open Platform for National Electricity Market Data'
      },
      { property: 'og:type', content: 'website' },
      {
        hid: 'og:url',
        property: 'og:url',
        content: 'https://opennem.org.au'
      },
      { property: 'og:description', content: pkg.description },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://opennem.org.au/images/screens/opennem-nem.png'
      },
      { hid: 'og:image:width', property: 'og:image:width', content: '1447' },
      { hid: 'og:image:height', property: 'og:image:height', content: '932' }
    ],

    link: [
      {
        rel: 'stylesheet',
        href: '/css/fontawesome.min.css'
      },
      {
        rel: 'stylesheet',
        href: '/css/brands.min.css'
      },
      {
        rel: 'stylesheet',
        href: '/css/light.min.css'
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/icons/favicon-196x196.png',
        sizes: '196x196'
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/icons/favicon-96x96.png',
        sizes: '96x96'
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/icons/favicon-32x32.png',
        sizes: '32x32'
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/icons/favicon-16x16.png',
        sizes: '16x16'
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/icons/favicon-128x128.png',
        sizes: '128x128'
      },

      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-57x57.png',
        sizes: '57x57'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-114x114.png',
        sizes: '114x114'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-72x72.png',
        sizes: '72x72'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-144x144.png',
        sizes: '144x144'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-60x60.png',
        sizes: '60x60'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-120x120.png',
        sizes: '120x120'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-76x76.png',
        sizes: '76x76'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/icons/apple-touch-icon-152x152.png',
        sizes: '152x152'
      }
    ],
    script: [
      { src: '/scripts/ga.js' },
      { src: 'https://cdn.polyfill.io/v2/polyfill.min.js?features=default' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#e34a33' },

  /*
  ** Global CSS
  */
  css: ['@/assets/scss/app.scss'],

  generate: {
    routes: [
      '/energy/au/',
      '/energy/nem/',
      '/energy/nsw1/',
      '/energy/qld1/',
      '/energy/sa1/',
      '/energy/tas1/',
      '/energy/vic1/',
      '/energy/wem/',
      '/facilities/au/',
      '/facilities/nem/',
      '/facilities/nsw1/',
      '/facilities/qld1/',
      '/facilities/sa1/',
      '/facilities/tas1/',
      '/facilities/vic1/',
      '/facilities/wem/',
      '/widget/',
      '/widget/small/',
      '/widget/large/'
    ]
  },

  router: {
    base: '/',
    trailingSlash: true
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~plugins/mixins.js',
    '~plugins/filters.js',
    '~plugins/directives.js',
    '~plugins/tooltip.js',
    '~plugins/sentry.js',
    { src: '~/plugins/mapbox', mode: 'client' }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],

  proxy: {
    '/api': {
      target: process.env.API_BASE_URL || 'https://api.opennem.org.au',
      pathRewrite: {
        '^/api': '/'
      }
    }
  },

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    publicPath: `/_nuxt_${timestamp}/`,
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    ],
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
