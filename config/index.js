
// eslint-disable-next-line import/no-commonjs
const path = require('path')

const config = {
  projectName: 'link',
  date: '2019-8-26',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2,
    '375': 1 / 2
  },
  alias: {
    '@/src': path.resolve(__dirname, '..', 'src')
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: {
    babel: {
      sourceMap: false,
      presets: [
        ['env', {
          modules: false
        }]
      ],
      plugins: [
        'transform-decorators-legacy',
        'transform-class-properties',
        'transform-object-rest-spread',
      ]
    }
  },
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  weapp: {
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            browsers: [
              'last 3 versions',
              'Android >= 4.1',
              'ios >= 8'
            ]
          }
        },
        pxtransform: {
          enable: true,
          config: {

          }
        },
        url: {
          enable: true,
          config: {
            limit: 10240 // 设定转换尺寸上限
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'], // 由于引用 `node_modules` 的模块，默认不会编译，所以需要额外给 H5 配置 `esnextModules`
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            browsers: [
              'last 3 versions',
              'Android >= 4.1',
              'ios >= 8'
            ]
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    devServer: {
      port: 80,
      host: 'wap.mylyh.com',
      // port: 800,
      // host: '192.168.137.1',
      // proxy: {
      //   '/devapi': {
      //     target: 'http://devuser.mylyh.com',
      //     pathRewrite: {'^/devapi' : ''},
      //     changeOrigin: true // 必需
      //   }
      // }
    },
    router: {
      mode: 'hash' // 或者是 'browser'
    },
    /* 文件名hash处理 */
    output: {
      filename: 'js/[name].[hash:8].js',
      chunkFilename: 'js/[name].[chunkhash:8].js'
    },
    miniCssExtractPluginOption: {
      filename: 'css/[name].[hash:8].css',
      chunkFilename: 'css/[id].[chunkhash:8].css'
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  if (process.env.NODE_ENV === 'test') {
    return merge({}, config, require('./test'))
  }
  return merge({}, config, require('./prod'))
}
