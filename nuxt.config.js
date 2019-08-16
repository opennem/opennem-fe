const pkg = require('./package')
const webpack = require('webpack')

module.exports = {
  mode: 'universal',

  server: {
    host: '0.0.0.0'
  },

  head: {
    title: 'OpenNEM: An Open Platform for National Electricity Market Data',
    meta: [
      { charset: 'utf-8' },
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
        content: 'https://opennem-nuxt.netlify.com/images/energy/nem.png'
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
        content: 'https://opennem-nuxt.netlify.com'
      },
      { property: 'og:description', content: pkg.description },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://opennem-nuxt.netlify.com/images/energy/nem.png'
      },
      { property: 'og:image:width', content: '2768' },
      { property: 'og:image:height', content: '1922' }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css'
      },
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
      '/energy/nem',
      '/energy/nsw1',
      '/energy/qld1',
      '/energy/sa1',
      '/energy/tas1',
      '/energy/vic1',
      '/facilities/nem',
      '/facilities/nsw1',
      '/facilities/qld1',
      '/facilities/sa1',
      '/facilities/tas1',
      '/facilities/vic1'
    ]
  },

  router: {
    base: '/'
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~plugins/filters.js',
    '~plugins/tooltip.js',
    { src: '~/plugins/leaflet', ssr: false }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios'
  ],
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
