import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';

export default {
  entry: './src/index.js',
  dest: './lib/index.js',
  format: 'umd',
  moduleName: 'Pisces',
  plugins: [
    json(),
    resolve(),
    buble()
  ]
};
