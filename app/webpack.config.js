const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  target: 'node14',
  entry: './src/handler.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'handler.js',
    path: path.resolve(__dirname, 'dist'),
    // XXX: Why is this required?
    library: {
      name: 'mylib',
      type: 'commonjs2',
    }
  },
  optimization: {
    minimize: false,
  },
  externalsPresets: { node: true },
  // Don't complain this dependency is missing
  externals: [nodeExternals(), 'pino-pretty'],
};
