const path = require('path');

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: process.env.VUE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/metronic/vue/demo7/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        // If using the runtime only build
        vue$: 'vue/dist/vue.runtime.esm.js', // 'vue/dist/vue.runtime.common.js' for webpack 1
        // Or if using full build of Vue (runtime + compiler)
        // vue$: 'vue/dist/vue.esm.js'      // 'vue/dist/vue.common.js' for webpack 1
      },
      symlinks: false,
    },
    watch: true,
  },
  chainWebpack: config => {
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.configFile = path.resolve(__dirname, '.eslintrc.js');
        return options;
      });
  },
  // css: {
  //   loaderOptions: {
  //     postcss: {
  //       config: {
  //         path: __dirname
  //       }
  //     },
  //     scss: {
  //       prependData: `@import "@/assets/sass/vendors/vue/vuetify/variables.scss";`
  //     }
  //   }
  // },
  transpileDependencies: ['vuetify'],
};
