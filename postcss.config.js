console.log(process.env.NODE_ENV);

module.exports = {
    // parser: 'sugarss',


    plugins: {
        // 'postcss-import': {},

        /**
         * 这个需要 npm postcss-cssnext
         * @see http://cssnext.io/
         * 使用css变量声明 --var-name: 10px | var(--var-name)
         * 与 @apply --var-block
         */
        'postcss-cssnext': {
            warnForDuplicates: false
        },

        /**
         * post css 好像自带这个了
         * 如果安了 css next 就不需要 autoprefixer 了
         */
        // 'autoprefixer': {},

        /**
         * 这样引入 autoprefixer 需要安装 npm
         */
        // require('autoprefixer') 

        /**
         * 这个也是自带的，直接就可以压缩css
         */
        'cssnano': {}
    }
}