module.exports = {
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Windy'
      return args
    })
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          strictMath: true,
        },
      },
    },
  },
  devServer: {
    host: '0.0.0.0',
    open: true,
    port: 8080,
    overlay: {
      warnings: false,
      errors: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:9768',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
