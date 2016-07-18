const BODY = document.body;
const relativeValueReg = new RegExp(/^(\-|\+)\d/);
const numberReg = new RegExp(/^\d*\.?\d*$/);

export function getRoot() {
  /* Copyright (c) 2016 Benjamin De Cock
   * https://github.com/bendc/anchor-scroll/blob/master/scroll.js
   */
  if ('scrollingElement' in document) return document.scrollingElement;
  const html = document.documentElement;
  const start = html.scrollTop;
  html.scrollTop = start + 1;
  const end = html.scrollTop;
  html.scrollTop = start;
  return ((end > start) ? html : document.body);
}

export function assign(target, ...sources) {
  [...sources].map(source => {
    return Object.keys(source).map(propertyName => {
      target[propertyName] = source[propertyName];
    });
  });
  return target;
}

export function isElement(el) {
  return (el instanceof HTMLElement);
}

export function isString(value) {
  return (typeof value === 'string');
}

export function isNull(value) {
  return value === null;
}

export function isUndefined(value) {
  return (typeof value === 'undefined');
}

export function isNumber(value) {
  return ((typeof value === 'number') || numberReg.test(value));
}

export function isObject(value) {
  return (typeof value === 'object');
}

export function isFunction(value) {
  return (typeof value === 'function');
}

export function isBody(el) {
  return (el === BODY);
}

export function isRelativeValue(value) {
  if (!isString(value)) {
    return false;
  }

  return relativeValueReg.test(value);
}
