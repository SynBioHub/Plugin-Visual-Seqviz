const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
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
      "react": path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom")
    }
  },
  optimization: {
    minimize: true,
    // nodeEnv: "production",
    concatenateModules: false,
    minimizer: [
      // new UglifyJsPlugin()
      new TerserPlugin({
        parallel: 4,
        terserOptions: {
          comments: false,
          compress: {
            // delete unused code
            unused: true,
            // delete debugger
            drop_debugger: true, // eslint-disable-line
            // delete console
            drop_console: true, // eslint-disable-line
            // delete dead code
            dead_code: true // eslint-disable-line
          },
        },
      })
    ]
  },
};