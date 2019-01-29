import getScrollingElement from 'get-scrollingelement';
import * as util from './Pisces/Util';
import { version } from '../package.json';

export default class Pisces {
  static defaults() {
    const duration = 600;
    const easing = t => Math.sqrt(1 - (--t * t));
    const onComplete = null;
    return { duration, easing, onComplete };
  }

  get start() {
    const { scrollLeft, scrollTop } = this.scrollingBox;
    return { x: scrollLeft, y: scrollTop };
  }

  get max() {
    const el = this.scrollingBox;
    let x;
    let y;
    if (util.isBody(el)) {
      x = (el.scrollWidth - window.innerWidth);
      y = (el.scrollHeight - window.innerHeight);
    } else {
      x = (el.scrollWidth - el.clientWidth);
      y = (el.scrollHeight - el.clientHeight);
    }

    return { x, y };
  }

  constructor(scrollingBox = getScrollingElement(), options = {}) {
    this.scrollingBox = scrollingBox;
    this.options = util.assign({}, Pisces.defaults(), options);
  }

  _animate(coords, options = {}) {
    const _this = this;
    const _options = util.assign({}, _this.options, options);

    const start = performance.now();
    const step = function (timestamp) {
      const elapsed = Math.abs(timestamp - start);
      const progress = _options.easing(elapsed / _options.duration);
      const x = coords.start.x + coords.end.x * progress;
      const y = coords.start.y + coords.end.y * progress;
      _this._setScroll(x, y);
      if (elapsed > _options.duration) _this._completed(coords, _options);
      else _this._RAF = requestAnimationFrame(step);
    };

    _this.cancel();
    _this._RAF = requestAnimationFrame(step);
    return this;
  }

  _completed(coords, options) {
    this.cancel();
    this._setScroll(coords.start.x + coords.end.x, coords.start.y + coords.end.y);
    if (util.isFunction(options.onComplete)) options.onComplete();
  }

  _getEndCoordinateValue(coord, start, max) {
    if (util.isNumber(coord)) {
      if (coord > max) coord = max;
      return (coord - start);
    }

    if (util.isRelativeValue(coord)) {
      const value = (start - (start - ~~coord));
      if ((start + value) > max) return (max - start);
      else if ((start + value) < 0) return -start;
      return value;
    }

    return 0;
  }

  _setScroll(x = 0, y = 0) {
    const { scrollingBox } = this;
    const { scrollTop: currentScrollTop, scrollLeft: currentScrollLeft } = scrollingBox;
    if (x !== currentScrollLeft) scrollingBox.scrollLeft = x;
    if (y !== currentScrollTop) scrollingBox.scrollTop = y;
  }

  scrollTo(target = null, options) {
    const ERROR_MESSAGE = 'target param should be a HTMLElement or and ' +
      'object formatted as: {x: Number, y: Number}';

    if (util.isNull(target) || util.isUndefined(target)) {
      return console.error('target param is required');
    } else if (!util.isObject(target) && !util.isString(target)) {
      return console.error(ERROR_MESSAGE);
    }

    if (util.isString(target)) {
      const element = this.scrollingBox.querySelector(target);
      if (util.isElement(element)) {
        return this.scrollToElement(element, options);
      }

      return console.error(ERROR_MESSAGE);
    }

    if (util.isElement(target)) {
      return this.scrollToElement(target, options);
    }

    return this.scrollToPosition(target, options);
  }

  scrollToElement(el, options) {
    const start = this.start;
    const end = this.getElementOffset(el);
    if (!end) return;
    return this._animate({ start, end }, options);
  }

  scrollToPosition(coords, options) {
    const start = this.start;
    const max = this.max;
    let x = (coords.hasOwnProperty('x')) ? coords.x : start.x;
    let y = (coords.hasOwnProperty('y')) ? coords.y : start.y;
    x = this._getEndCoordinateValue(x, start.x, max.x);
    y = this._getEndCoordinateValue(y, start.y, max.y);
    const end = { x, y };
    return this._animate({ start, end }, options);
  }

  scrollToTop(options) {
    const start = this.start;
    const end = { x: 0, y: -(start.y) };
    return this._animate({ start, end }, options);
  }

  scrollToBottom(options) {
    const start = this.start;
    const max = this.max;
    const end =  { x: 0, y: (max.y - start.y) };
    return this._animate({ start, end }, options);
  }

  scrollToLeft(options) {
    const start = this.start;
    const end =  { x: -(start.x), y: 0 };
    return this._animate({ start, end }, options);
  }

  scrollToRight(options) {
    const start = this.start;
    const max = this.max;
    const end =  { x: (max.x - start.x), y: 0 };
    return this._animate({ start, end }, options);
  }

  set(key, value) {
    this.options[key] = value;
    return this;
  }

  cancel() {
    this._RAF = cancelAnimationFrame(this._RAF);
    return this;
  }

  getElementOffset(el) {
    if (!util.isBody(el) && !this.scrollingBox.contains(el)) {
      console.error('scrollingBox does not contains element');
      return false;
    }

    const start = this.start;
    const max = this.max;
    let e = el;
    let _top = 0;
    let _left = 0;
    let x = 0;
    let y = 0;

    do {
      _left += e.offsetLeft;
      _top += e.offsetTop;
      e = e.parentElement;
    } while (e !== this.scrollingBox);

    x = (_left - start.x);
    y = (_top - start.y);

    if (x > max.x) x = max.x;
    if (y > max.y) y = max.y;

    return { x, y };
  }
};

Pisces.VERSION = version;
