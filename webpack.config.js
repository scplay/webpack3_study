const path = require('path');
const webpack = require('webpack');

// extract style to css file
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// html template inject
const HtmlWebpackPlugin = require('html-webpack-plugin');

// js compress
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const DotenvPlugin = require('dotenv-webpack');

process.env.PRODUCTION = false;

module.exports = {
    /**
     * string | [string] | object { <key>: string | [string] } 
     * 
     * 
     */
    // entry: './loader_study/test.js',

    /** 
     * 增加 Promise 等这polyfill 多了 257KB 
     * @see https://babeljs.io/docs/usage/polyfill/
     * 
     * 如果只想引入单独的 es6 es7 新方法可使用 core.js
     *      @see https://github.com/zloirock/core-js
     */
    // entry: ["babel-polyfill", './loader_study/test.js'],

    /**
     * 需要增加一个通用库时 entry 的写法
     */
    entry: {
        app: "./loader_study/main.js",
        vendor: ["lodash"],
    },

    // 输出
    output: {
        // 编译完成时各种模块的输出到的根目录
        // 这是 filename 与 chunkFilename 编译到的目录，只在编译输出文件时起作用 
        path: path.resolve(__dirname, 'dist'),

        // filename: 'main.js',

        // 使用 common chunk 一定要这么写，因为会编译出多个文件
        filename: '[name].[chunkhash].js',
        // filename: 'dist/[id].[hash].main.js',

        // 异步加载的模块的命名
        chunkFilename: '[id].[name].[chunkhash].js',

        /**
         * 对于需要加载一些不编译的静态文件时有作用，
         * 可能是编译完成后输出的文件放到了路径不同的 CDN 或其他服务器上 
         * 文档建议这个值如果存在，应与 devServer.publicPath 一致 
         *  
         * @example 比如 path 值是 dist ， filename 值是 xx.js , 最终编译好的文件在
         * dist/xx.js 中，而 html 的 script src 的值取决于（html plugin会根据
         * filename的位置，自动的修改与 output.path + output.filename 相对应的路径 
         * 如果 html 与 dist 同目录，src中的路径是 xx.js 或 dist/xx.js)
         * 如果 html 是 ../xx.html , src中的路径是 dist/xx.js
         * 而如果 dist 文件夹最后放在 laravel 的 public/wx/dist 中 
         * 如果 publicPath 的值是 /wx/ , 最后html中 src 的值是 /wx/dist/xx.js
         * 
         */
        publicPath: '/dist/',

        // 导出的各种类型输出库的名字，如果不设置整个编译结果就是个IIFE
        library: {
            /**
             * this就是root 可能是 winodw 或 global
             */
            root: "rootZeon",
            /**
             * 这个默认是匿名的， 也就是 requireJS 直接使用文件名
             * 只有 libraryTarget: "umd" 并且umdNamedDefine: true 时
             */
            amd: "amdZeon",
            /**
             * 用于 node 载入模块的名字
             */
            commonjs: "commonZeon",
        },

        /**
         * 这是指模块多种输出格式兼容
         * "var" | "assign" | "this" | "window" | "global" | 
         * "commonjs" | "commonjs2" | "commonjs-module" | 
         * "amd" | "umd" | "umd2" | "jsonp"
         */
        libraryTarget: "umd",
        // amd 要有名字必须有这个
        umdNamedDefine: true,

        // 模块化输出时的注释文字
        auxiliaryComment: {
            root: "Root Comment",
            commonjs: "CommonJS Comment",
            commonjs2: "CommonJS2 Comment",
            amd: "AMD Comment"
        }
    },

    module: {
        rules: [{
            test: /\.css$/,
            // webpack 并没有自带 loader 这两个都要自己安装
            // npm install style-loader --save-dev
            // npm install css-loader --save-dev

            /**
             * css loader 会入 import 中读出 css 样式
             * style loader 会把样式插入到 html 中的 style 标签中 
             */
            // use: [
            //     'style-loader',
            //     'css-loader'
            // ]

            /**
             * 配合 extract text plugin 可以把 style 中的 css 提取成文件
             */
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: {
                    loader: "css-loader",

                    // 如需要压缩可以这样写
                    options: {
                        // minimize: false // true
                        // minimize: true 
                    }
                }
            })
        }, {
            /**
             * 使用 babel 转码 es6 语法，注意是语法，不是 es6 函数
             * npm install --save-dev babel-loader babel-core babel-preset-env
             * preset-env is a preset contain babel plugins package for many es6 es7 syntax
             */
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }
        }, {
            /**
             * less
             */
            test: /\.less$/,

            /**
             * 用 ExtractTextPlugin 提出成单独的文件
             */
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    /**
                     * translates CSS into CommonJS
                     * 
                     * css loader 自带 cssnano , options 中 minified true 即可
                     * @see https://github.com/webpack-contrib/css-loader
                     */
                    loader: "css-loader",
                    options: {
                        // 使用 css module
                        // 在 react 上比较有用
                        // modules: true
                    }
                }, {
                    /**
                     * 如果使用 postcss 要放在 style - css loader 后面，
                     * 其他预编译 css loader的前面
                     * 并且可以直接替换 css - loader 的位置？
                     */
                    loader: 'postcss-loader'
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            }),

            // use: [{
            //     loader: "style-loader" // creates style nodes from JS strings
            // }, {
            //     loader: "css-loader" // translates CSS into CommonJS
            // }, {
            //     loader: "less-loader" // compiles Less to CSS
            // }]
        }, {
            /**
             * 使用自定义的 loader 在 node_modules 中新建一个 zc-loader
             */
            test: /\.zc$/,
            use: [{
                loader: 'babel-loader'
            }, {
                loader: 'zc-loader'
            }]
        }]
    },

    /**
     * 解析处理，如
     *      模块路径别名 alias
     *      node_modules 的目录切换 modules
     *      引用文件自动补全后比 extensions
     */
    resolve: {
        // import {xx} from 'Utils/xxx.js' 目录解析的路径替换
        alias: {
            Utils: path.resolve(__dirname, 'src/utils/'),
            src: path.resolve(__dirname, 'loader_study/'),
            root: path.resolve(__dirname),
        },
        // import {xx} from 'Utils/xxx' .js 或 .vue 后缀就不用写了
        extensions: ['.js', '.vue'],

        // 此目录优先于 node_modules/ 搜索 模块位置
        // modules: path.resolve(__dirname, 'other_node_modules/'),

        /**
         * @see http://www.tangshuang.net/3343.html
         * 当引用 jQu 会直接找global.jQuery（如果要CJS或ReqJs等格式要写）, 而不打包
         * 这种主要用于包已经在 CDN 中，本地不需要再打包一遍
         */
        // externals : [
        //     // require('jQu') -> module.exports = jQuery
        //     jQu: 'jQuery',
        //     lo: {
        //         commonjs: "lodash", // export.modules 
        //         amd: "lodash", // requireJs
        //         root: "_" // indicates global variable
        //     }
        // ]

    },

    /**
     * devtool
     * This option controls if and how source maps are generated.
     * 
     * @see https://webpack.js.org/configuration/devtool/#components/sidebar/sidebar.jsx
     * 
     * eval 会把 module 中的代码改成 eval('source code'); 这样，所以不能用于生产环境
     *      编译完模块会保留原始的名字，不是太好看，不过编译也不能用这个， devServer 是能看的
     * 
     * cheap-eval-source-map ？没看出来和eval 差不多？
     * 
     * cheap-source-map 这个就不会 eval只是在 对应的 module 下面写了一行 # sourceMappingURL=main.js.map
     * 
     * hidden-source-map 没有 source map ，这是默认的选项吗 ？
     * 
     * nosources-source-map 这个是生成source map 但是在代码里不映射，也就是debug断点一片空白，这是什么呢？
     * 
     * 更细粒度的控制原码映射，比如什么模块显示，什么不显示
     * @see https://webpack.js.org/plugins/source-map-dev-tool-plugin/
     * 
     */
    // devtool: 'eval',
    // devtool: 'eval-source-map',

    /**
     * 各种插件
     */
    plugins: [
        /**
         * 这个 define 好像可能就像 c 语言的 define ，用来定义常量, 
         * 最后编译的时候只会把 PRODUCTION 对应的值，toString 然后插入到代码里的各种地方而已
         * 对应的还有两个 
         *    EnvironmentPlugin 就是  process.env.XXX 的 shorthand 方法
         *    DotenvPlugin 就是可以像 Laravel 那样用 .env 文件来当环境变量
         *      @see https://github.com/mrsteele/dotenv-webpack 
         *      还是觉得 define 简明  
         */
        new webpack.DefinePlugin({
            PRODUCTION: true,
            // key 就会被替换成 value
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),

            'process.env.PRODUCTION': 'this is in development stage',
        }),

        /**
         * env plugin 就是 define 的简写
         * @see https://webpack.js.org/plugins/environment-plugin/
         * 配合 require('dotenv').config()
         * 但是 Variables coming from process.env are always strings.
         * 所以 里面这个 app_debug 是 "true" 不是 true
         * 
         */
        // new webpack.EnvironmentPlugin(['APP_DEBUG', 'SOME_AK']),

        /**
         * 这个是 dotenv + EnvironmentPlugin 
         * dotenv for webpack plugin
         * @see https://github.com/mrsteele/dotenv-webpack
         */
        new DotenvPlugin({
            path: '.env' // can ignore or set other env path
        }),


        // 自动载入预设的模块，不需要在代码中 import 可以直接用
        // new webpack.ProvidePlugin({
        //     identifier: 'module1',
        //     // ...
        // })

        /**
         * 将插入到 html style 元素中的 css 提出到一个单独的 css 文件中在 index html 中就可以引用了
         * 需要在 loader 处配合使用
         *      @see https://webpack.js.org/plugins/extract-text-webpack-plugin/
         */
        new ExtractTextPlugin({
            filename: "[id].[contenthash:6].css",
        }),

        /**
         * 代码优化：把相同的引用提取到同一个模块中
         * 
         * Prevent Duplication
         */
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'common' // Specify the common bundle's name.
        // }),

        /**
         * If you have multiple webpack entry points, they will all be 
         * included with script tags in the generated HTML.
         * 
         * 多个入口或用 hash js name 时，extract css 文件时，都需要动态注入
         */
        new HtmlWebpackPlugin({
            title: 'Custom Title',

            /**
             * ../ 这个文件的位置是根据 output.path 相对的
             * 但是 devServer 时，是按 publicPath 输出的
             * 主要是编译模板文件最终输出的位置
             */
            // filename: '../index_prod.html',
            filename: 'index_prod.html',

            /**
             * @see https://github.com/kangax/html-minifier#options-quick-reference
             * 传入 html-minifier 的配置对象 
             */
            minify: {
                collapseWhitespace: true,

                removeComments: true,
            },

            // template: 'src/tpl.html',

            template: 'src/tpl.ejs'
        }),

        /**
         * 当使用 vendor 库时需要使用 common chuck 合并多个文件同时使用的 js 库
         */
        new webpack.optimize.CommonsChunkPlugin({
            // (the commons chunk name)
            name: "vendor",

            // 不写默认是 [name].js 或 按 output 配置
            // (the filename of the commons chunk)
            // filename: "vendor.js",

            // minChunks: 3,
            // (Modules must be shared between 3 entries)

            // chunks: ["pageA", "pageB"],
            // (Only use these entries)
        }),


        /** 
         * @see https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
         * 只能压缩 js 不能压缩 css 
         * 可以在 CLI 中加入 -p 或 --optimize-minimize，会自动引用 UglifyJSPlugin？
         * 
         */
        // new UglifyJSPlugin(),


        // 对就 babel 的还有 BabelMinifyWebpackPlugin
        /**
         * 编译出来加个 Banner 头
         */
        new webpack.BannerPlugin("!!!!!! THIS IS A WEBPACK 3 STUDY CASE ZEON USE !!!!!!!"),

    ],

    // 监听文件改动就重新编译
    // watch: true,

    // 缓存
    cache: true,

    /**
     * devServer 提供一个简单服务器 用于实时预览编译结果，
     *      开启 webpack-dev-server 时会自动 watch true 监听编译
     *      基于 webpack-dev-middleware 可以解决 跨域的问题
     * 使用 devServer
     *      npm install webpack-dev-server --save-dev
     * 使用时不是 webpack xxx 而是 webpack-dev-server xxx
     * 参考 npm run serve
     */
    devServer: {
        // 开启 watch 
        // 不检查访问者的 host
        disableHostCheck: true,
        // 绑定地址
        host: 'localhost',
        // 绑定端口
        port: 9020,

        // 可以提供静态资源，优先级高于 publicPath, 默认也是 / 
        // contentBase: [path.join(__dirname), path.join(__dirname, '/dist')],

        // 这是服务器的根目录, 默认就是/, 如果不写，编译输出按
        // output 中的 publicPath 路径，但是写了这个后就按
        // 这个路径开始编译
        // publicPath: '/',

        // 开启 gzip 压缩
        compress: true,

        // 自动打开 浏览器 win下ok
        // open: true,

        // 开启 HMR ?
        // hot: true,
        
        // 不 refresh page，最好在 CLI 上写 --inline，
        // 写这里要加载 webpack 的 HMR Plugin
        // inline: true

        // 代理跨域请求
        proxy: {
            "/api": {
                // 所有 /api 请求都会重定向给 my-dev.me
                target: "http://wemall.me/",
                // /api/xxx 重写为 http://wemall.me/xxx 
                pathRewrite: { "^/api": "" },
                // 这个一定要写，不然不能使用本地 vhost
                changeOrigin: true
            }
        }
    }

}
