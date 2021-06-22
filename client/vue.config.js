module.exports = {
  configureWebpack: {
    devtool: 'cheap-module-source-map',
    // devtool: "source-map"
  },

  transpileDependencies: [
    'vuex-module-decorators'
  ],

  chainWebpack: config => {
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader')
  },

  devServer: {
    port: 3077, //client_port
    proxy: 'http://localhost:16770', // server_port
  },

  pluginOptions: {
    svgSprite: {
      /*
        * The directory containing your SVG files.
        */
      dir: 'src/assets/icons',
      /*
        * The reqex that will be used for the Webpack rule.
        */
      test: /\.(svg)(\?.*)?$/,
      /*
        * @see https://github.com/kisenka/svg-sprite-loader#configuration
        */
      loaderOptions: {
        extract: true,
        spriteFilename: 'img/icons.[hash:8].svg' // or 'img/icons.svg' if filenameHashing == false
      },
      /*
        * @see https://github.com/kisenka/svg-sprite-loader#configuration
        */
      pluginOptions: {
        plainSprite: true
      }    
    }    
  },
}
