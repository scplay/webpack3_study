const path = require('path');
const webpack = require('webpack');

// extract style to css file
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// html template inject
const HtmlWebpackPlugin = require('html-webpack-plugin');

// js compress
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

process.env.PRODUCTION = false;

module.exports = {
    /**
     * string | [string] | object { <key>: string | [string] } 
     * 
     * 
     */
    entry: './loader_study/test.js',

    /** 
     * 增加 Promise 等这polyfill 多了 257KB 
     * @see https://babeljs.io/docs/usage/polyfill/
     * 
     * 如果只想引入单独的 es6 es7 新方法可使用 core.js
     *      @see https://github.com/zloirock/core-js
     */
    // entry: ["babel-polyfill", './loader_study/test.js'],

    // 输出
    output: {
        // 编译时输出的根目录
        // 这是 filename 与 chunkFilename 编译到的目录，不影响 runtime 
        path: path.resolve(__dirname, 'dist'),

        // filename: 'main.js',

        // 使用 common chunk 一定要这么写，因为会编译出多个文件
        filename: '[name].[chunkhash].js',
        // filename: 'dist/[id].[hash].main.js',
        // 异步加载的模块的命名
        chunkFilename: '[id].[name].[chunkhash].js',

        // 运行时js载入根目录
        // 是最后代码在浏览器中运行时 runtime 载入对应的 module 时会加上的前缀
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
                    loader: "css-loader" // translates CSS into CommonJS
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
        },
        // import {xx} from 'Utils/xxx' .js 或 .vue 后缀就不用写了
        extensions: ['.js', '.vue']

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
    // devtool: 'cheap-source-map',

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
            title: 'Custom title',

            filename: '../index_build.html',

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
         * @see https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
         * 只能压缩 js 不能压缩 css 
         */
        // new UglifyJSPlugin(),

        // 对就 babel 的还有 BabelMinifyWebpackPlugin

        /**
         * 编译出来加个 Banner 头
         */
        new webpack.BannerPlugin("!!!!!! THIS IS A WEBPACK 3 STUDY CASE ZEON USE !!!!!!!")
    ],

    // 监听文件改动就重新编译
    // watch: true,

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
        // 允许外网访问
        disableHostCheck: true,
        // 绑定地址
        host: 'localhost',
        // 绑定端口
        port: 9000,
        // server 的 / 路由从哪个文件夹开始, 可以是数组，有多个 content base?
        // 我觉得这个其实用处不太，除非服务器也用 alias目录了，不然没有什么东西放在各种不同的目录下
        contentBase: [path.join(__dirname), path.join(__dirname, '/dist')],
        // 开启 gzip 压缩
        compress: true,
        // 自动打开 浏览器 ？ 并没有
        open: true,
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