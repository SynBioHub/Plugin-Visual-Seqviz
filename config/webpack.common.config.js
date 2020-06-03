const path = require('path');

module.exports = {
  entry: {
    index: './src/index.jsx',
  },
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env", { modules: false }],
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
      },
      {
        test: /\.(csv|tsv)$/,
        exclude: /node_modules/,
        use: ['csv-loader'],
      },
      {
        test: /\.xml$/,
        exclude: /node_modules/,
        use: ['xml-loader'],
      },
    ]
  }
}