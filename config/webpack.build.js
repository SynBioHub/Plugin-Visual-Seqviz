const path = require('path');
const TerserPlugin = require('terser-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    // vendor: ["@babel/polyfill", "react","react-dom"],
    seqviz: path.join(__dirname, "..", "src", "app.js"),
  },
  output: {
    path: path.resolve(__dirname, "../public"),
    filename: "[name].js",
    library: 'seqviz',
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: "this",
  },
  mode: "production",
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  module: {
    rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env", {
              modules: false
            }],
            "@babel/preset-react"
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-object-rest-spread",
            '@babel/plugin-transform-runtime',
            "babel-plugin-module-resolver",
            "babel-plugin-transform-imports",
          ]
        }
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|webp|svg)(\?.*)?$/,
        exclude: /node_modules/,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader"
          }
        ]
      },
      {
        test: /\.(css)$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom")
    }
  },
  // plugins: [
  //   new webpack.BannerPlugin(banner)
  //   new BundleAnalyzerPlugin({ defaultSizes: "stat" })
  // ],
  optimization: {
    minimize: true,
    nodeEnv: "production",
    minimizer: [
      // new UglifyJsPlugin()
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
      })
    ]
  },
};