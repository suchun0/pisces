import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';

export default {
  entry: './src/index.js',
  format: 'umd',
  moduleName: 'Pisces',
  plugins: [
    json(),
    buble()
  ],
  dest: './lib/index.js'
};
