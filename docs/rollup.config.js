const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const buble = require('rollup-plugin-buble');

// `entry` and `dest` properties are omitted in purpose
// this configuration file is consume by tarima
// https://github.com/tacoss/tarima#38---rollupjs
module.exports = {
  // entry: './src/js/_entries/main.js',
  // dest: './test/test.js',
  format: 'cjs',
  plugins: [
    resolve(),
    commonjs(),
    json(),
    buble()
  ]
};
