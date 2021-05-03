const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  chainWebpack: (config) => {
    config.optimization.delete('splitChunks')
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: []
    }
  },

  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: { extract: false },
  filenameHashing: false,
  configureWebpack: {

    plugins: [
      new WebpackShellPlugin({
          onBuildEnd: ['node finalize.js']
      }),
    ]
  }

}
