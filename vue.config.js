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
    host: 'localhost',
    open: true,
    port: 8080,
    overlay: {
      warnings: false,
      errors: false,
    },
    proxy: {
      '/api': {
        target: 'http://10.202.244.79:9768',
        // target: 'http://192.168.1.124:9768',
        // target: 'http://localhost:9768',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
