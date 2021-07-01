const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './handler.ts',
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
  },
  optimization: {
    // minimize: false,
  },
  // Don't complain this dependency is missing
  externals: ['pino-pretty'],
};
