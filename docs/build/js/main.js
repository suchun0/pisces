var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

var index = function () {
  if ('scrollingElement' in document) {
    return document.scrollingElement;
  }

  var html = document.documentElement;
  var start = html.scrollTop;
  var end;

  html.scrollTop = start + 1;

  end = html.scrollTop;

  html.scrollTop = start;

  if (end > start) {
    return html;
  }

  return document.body;
};

return index;

})));
});

var BODY = document.body;
var relativeValueReg = new RegExp(/^(\-|\+)\d/);
var numberReg = new RegExp(/^\d*\.?\d*$/);

// export function getRoot() {
//   /* Copyright (c) 2016 Benjamin De Cock
//    * https://github.com/bendc/anchor-scroll/blob/master/scroll.js
//    */
//   if ('scrollingElement' in document) return document.scrollingElement;
//   const html = document.documentElement;
//   const start = html.scrollTop;
//   html.scrollTop = start + 1;
//   const end = html.scrollTop;
//   html.scrollTop = start;
//   return ((end > start) ? html : document.body);
// }

function assign(target) {
  var arguments$1 = arguments;

  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) { sources[ len ] = arguments$1[ len + 1 ]; }

  [].concat( sources ).map(function (source) {
    return Object.keys(source).map(function (propertyName) {
      target[propertyName] = source[propertyName];
    });
  });
  return target;
}

function isElement(el) {
  return (el instanceof HTMLElement);
}

function isString(value) {
  return (typeof value === 'string');
}

function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return (typeof value === 'undefined');
}

function isNumber(value) {
  return ((typeof value === 'number') || numberReg.test(value));
}

function isObject(value) {
  return (typeof value === 'object');
}

function isFunction(value) {
  return (typeof value === 'function');
}

function isBody(el) {
  return (el === BODY);
}

function isRelativeValue(value) {
  if (!isString(value)) {
    return false;
  }

  return relativeValueReg.test(value);
}

console.log(

  index$1()

);
var Pisces = function Pisces(scrollingBox, options) {
  if ( scrollingBox === void 0 ) { scrollingBox = index$1(); }
  if ( options === void 0 ) { options = {}; }

  this.scrollingBox = scrollingBox;
  this.options = assign({}, Pisces.defaults(), options);
};

var prototypeAccessors = { start: {},max: {} };

Pisces.defaults = function defaults () {
  var duration = 600;
  var easing = function (t) { return Math.sqrt(1 - (--t * t)); };
  var onComplete = null;
  return { duration: duration, easing: easing, onComplete: onComplete };
};

prototypeAccessors.start.get = function () {
  var ref = this.scrollingBox;
    var scrollLeft = ref.scrollLeft;
    var scrollTop = ref.scrollTop;
  return { x: scrollLeft, y: scrollTop };
};

prototypeAccessors.max.get = function () {
  var el = this.scrollingBox;
  var x;
  var y;
  if (isBody(el)) {
    x = (el.scrollWidth - window.innerWidth);
    y = (el.scrollHeight - window.innerHeight);
  } else {
    x = (el.scrollWidth - el.clientWidth);
    y = (el.scrollHeight - el.clientHeight);
  }

  return { x: x, y: y };
};

Pisces.prototype._animate = function _animate (coords, options) {
    if ( options === void 0 ) { options = {}; }

  var _this = this;
  var _options = assign({}, _this.options, options);

  var start = performance.now();
  var step = function (timestamp) {
    var elapsed = Math.abs(timestamp - start);
    var progress = _options.easing(elapsed / _options.duration);
    _this.scrollingBox.scrollTop = (coords.start.y + coords.end.y * progress);
    _this.scrollingBox.scrollLeft = (coords.start.x + coords.end.x * progress);
    if (elapsed > _options.duration) { _this._completed(coords, _options); }
    else { _this._RAF = requestAnimationFrame(step); }
  };

  _this.cancel();
  _this._RAF = requestAnimationFrame(step);
  return this;
};

Pisces.prototype._completed = function _completed (coords, options) {
  this.cancel();
  this.scrollingBox.scrollTop = (coords.start.y + coords.end.y);
  this.scrollingBox.scrollLeft = (coords.start.x + coords.end.x);
  if (isFunction(options.onComplete)) { options.onComplete(); }
};

Pisces.prototype._getEndCoordinateValue = function _getEndCoordinateValue (coord, start, max) {
  if (isNumber(coord)) {
    if (coord > max) { coord = max; }
    return (coord - start);
  }

  if (isRelativeValue(coord)) {
    var value = (start - (start - ~~coord));
    if ((start + value) > max) { return (max - start); }
    else if ((start + value) < 0) { return -start; }
    return value;
  }

  return 0;
};

Pisces.prototype.scrollTo = function scrollTo (target, options) {
    if ( target === void 0 ) { target = null; }

  var ERROR_MESSAGE = 'target param should be a HTMLElement or and ' +
    'object formatted as: {x: Number, y: Number}';

  if (isNull(target) || isUndefined(target)) {
    return console.error('target param is required');
  } else if (!isObject(target) && !isString(target)) {
    return console.error(ERROR_MESSAGE);
  }

  if (isString(target)) {
    var element = this.scrollingBox.querySelector(target);
    if (isElement(element)) {
      return this.scrollToElement(element, options);
    }

    return console.error(ERROR_MESSAGE);
  }

  if (isElement(target)) {
    return this.scrollToElement(target, options);
  }

  return this.scrollToPosition(target, options);
};

Pisces.prototype.scrollToElement = function scrollToElement (el, options) {
  var start = this.start;
  var end = this.getElementOffset(el);
  if (!end) { return; }
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.scrollToPosition = function scrollToPosition (coords, options) {
  var start = this.start;
  var max = this.max;
  var x = (coords.hasOwnProperty('x')) ? coords.x : start.x;
  var y = (coords.hasOwnProperty('y')) ? coords.y : start.y;
  x = this._getEndCoordinateValue(x, start.x, max.x);
  y = this._getEndCoordinateValue(y, start.y, max.y);
  var end = { x: x, y: y };
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.scrollToTop = function scrollToTop (options) {
  var start = this.start;
  var end = { x: 0, y: -(start.y) };
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.scrollToBottom = function scrollToBottom (options) {
  var start = this.start;
  var max = this.max;
  var end ={ x: 0, y: (max.y - start.y) };
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.scrollToLeft = function scrollToLeft (options) {
  var start = this.start;
  var end ={ x: -(start.x), y: 0 };
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.scrollToRight = function scrollToRight (options) {
  var start = this.start;
  var max = this.max;
  var end ={ x: (max.x - start.x), y: 0 };
  return this._animate({ start: start, end: end }, options);
};

Pisces.prototype.set = function set (key, value) {
  this.options[key] = value;
  return this;
};

Pisces.prototype.cancel = function cancel () {
  this._RAF = cancelAnimationFrame(this._RAF);
  return this;
};

Pisces.prototype.getElementOffset = function getElementOffset (el) {
  if (!isBody(el) && !this.scrollingBox.contains(el)) {
    console.error('scrollingBox does not contains element');
    return false;
  }

  var start = this.start;
  var max = this.max;
  var e = el;
  var _top = 0;
  var _left = 0;
  var x = 0;
  var y = 0;

  do {
    _left += e.offsetLeft;
    _top += e.offsetTop;
    e = e.parentElement;
  } while (e !== this.scrollingBox);

  x = (_left - start.x);
  y = (_top - start.y);

  if (x > max.x) { x = max.x; }
  if (y > max.y) { y = max.y; }

  return { x: x, y: y };
};

Object.defineProperties( Pisces.prototype, prototypeAccessors );

var version = "0.0.16";

var index$2 = createCommonjsModule(function (module, exports) {
/**
 * gemini-scrollbar
 * @version 1.5.1
 * @link http://noeldelgado.github.io/gemini-scrollbar/
 * @license MIT
 */
(function() {
  var SCROLLBAR_WIDTH, DONT_CREATE_GEMINI, CLASSNAMES;

  CLASSNAMES = {
    element: 'gm-scrollbar-container',
    verticalScrollbar: 'gm-scrollbar -vertical',
    horizontalScrollbar: 'gm-scrollbar -horizontal',
    thumb: 'thumb',
    view: 'gm-scroll-view',
    autoshow: 'gm-autoshow',
    disable: 'gm-scrollbar-disable-selection',
    prevented: 'gm-prevented',
    resizeTrigger: 'gm-resize-trigger',
  };

  function getScrollbarWidth() {
    var e = document.createElement('div'), sw;
    e.style.position = 'absolute';
    e.style.top = '-9999px';
    e.style.width = '100px';
    e.style.height = '100px';
    e.style.overflow = 'scroll';
    e.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(e);
    sw = (e.offsetWidth - e.clientWidth);
    document.body.removeChild(e);
    return sw;
  }

  function addClass(el, classNames) {
    if (el.classList) {
      return classNames.forEach(function(cl) {
        el.classList.add(cl);
      });
    }
    el.className += ' ' + classNames.join(' ');
  }

  function removeClass(el, classNames) {
    if (el.classList) {
      return classNames.forEach(function(cl) {
        el.classList.remove(cl);
      });
    }
    el.className = el.className.replace(new RegExp('(^|\\b)' + classNames.join('|') + '(\\b|$)', 'gi'), ' ');
  }

  /* Copyright (c) 2015 Lucas Wiener
   * https://github.com/wnr/element-resize-detector
   */
  function isIE() {
    var agent = navigator.userAgent.toLowerCase();
    return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
  }

  function GeminiScrollbar(config) {
    this.element = null;
    this.autoshow = false;
    this.createElements = true;
    this.forceGemini = false;
    this.onResize = null;
    this.minThumbSize = 20;

    Object.keys(config || {}).forEach(function (propertyName) {
      this[propertyName] = config[propertyName];
    }, this);

    SCROLLBAR_WIDTH = getScrollbarWidth();
    DONT_CREATE_GEMINI = ((SCROLLBAR_WIDTH === 0) && (this.forceGemini === false));

    this._cache = {events: {}};
    this._created = false;
    this._cursorDown = false;
    this._prevPageX = 0;
    this._prevPageY = 0;

    this._document = null;
    this._viewElement = this.element;
    this._scrollbarVerticalElement = null;
    this._thumbVerticalElement = null;
    this._scrollbarHorizontalElement = null;
    this._scrollbarHorizontalElement = null;
  }

  GeminiScrollbar.prototype.create = function create() {
    var this$1 = this;

    if (DONT_CREATE_GEMINI) {
      addClass(this.element, [CLASSNAMES.prevented]);

      if (this.onResize) {
        // still need a resize trigger if we have an onResize callback, which
        // also means we need a separate _viewElement to do the scrolling.
        if (this.createElements === true) {
          this._viewElement = document.createElement('div');
          while(this.element.childNodes.length > 0) {
            this$1._viewElement.appendChild(this$1.element.childNodes[0]);
          }
          this.element.appendChild(this._viewElement);
        } else {
          this._viewElement = this.element.querySelector('.' + CLASSNAMES.view);
        }
        addClass(this.element, [CLASSNAMES.element]);
        addClass(this._viewElement, [CLASSNAMES.view]);
        this._createResizeTrigger();
      }

      return this;
    }

    if (this._created === true) {
      console.warn('calling on a already-created object');
      return this;
    }

    if (this.autoshow) {
      addClass(this.element, [CLASSNAMES.autoshow]);
    }

    this._document = document;

    if (this.createElements === true) {
      this._viewElement = document.createElement('div');
      this._scrollbarVerticalElement = document.createElement('div');
      this._thumbVerticalElement = document.createElement('div');
      this._scrollbarHorizontalElement = document.createElement('div');
      this._thumbHorizontalElement = document.createElement('div');
      while(this.element.childNodes.length > 0) {
        this$1._viewElement.appendChild(this$1.element.childNodes[0]);
      }

      this._scrollbarVerticalElement.appendChild(this._thumbVerticalElement);
      this._scrollbarHorizontalElement.appendChild(this._thumbHorizontalElement);
      this.element.appendChild(this._scrollbarVerticalElement);
      this.element.appendChild(this._scrollbarHorizontalElement);
      this.element.appendChild(this._viewElement);
    } else {
      this._viewElement = this.element.querySelector('.' + CLASSNAMES.view);
      this._scrollbarVerticalElement = this.element.querySelector('.' + CLASSNAMES.verticalScrollbar.split(' ').join('.'));
      this._thumbVerticalElement = this._scrollbarVerticalElement.querySelector('.' + CLASSNAMES.thumb);
      this._scrollbarHorizontalElement = this.element.querySelector('.' + CLASSNAMES.horizontalScrollbar.split(' ').join('.'));
      this._thumbHorizontalElement = this._scrollbarHorizontalElement.querySelector('.' + CLASSNAMES.thumb);
    }

    addClass(this.element, [CLASSNAMES.element]);
    addClass(this._viewElement, [CLASSNAMES.view]);
    addClass(this._scrollbarVerticalElement, CLASSNAMES.verticalScrollbar.split(/\s/));
    addClass(this._scrollbarHorizontalElement, CLASSNAMES.horizontalScrollbar.split(/\s/));
    addClass(this._thumbVerticalElement, [CLASSNAMES.thumb]);
    addClass(this._thumbHorizontalElement, [CLASSNAMES.thumb]);

    this._scrollbarVerticalElement.style.display = '';
    this._scrollbarHorizontalElement.style.display = '';

    this._createResizeTrigger();

    this._created = true;

    return this._bindEvents().update();
  };

  GeminiScrollbar.prototype._createResizeTrigger = function createResizeTrigger() {
    // We need to arrange for self.scrollbar.update to be called whenever
    // the DOM is changed resulting in a size-change for our div. To make
    // this happen, we use a technique described here:
    // http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/.
    //
    // The idea is that we create an <object> element in our div, which we
    // arrange to have the same size as that div. The <object> element
    // contains a Window object, to which we can attach an onresize
    // handler.
    //
    // (React appears to get very confused by the object (we end up with
    // Chrome windows which only show half of the text they are supposed
    // to), so we always do this manually.)

    var obj = document.createElement('object');
    addClass(obj, [CLASSNAMES.resizeTrigger]);
    obj.type = 'text/html';
    var resizeHandler = this._resizeHandler.bind(this);
    obj.onload = function () {
      var win = obj.contentDocument.defaultView;
      win.addEventListener('resize', resizeHandler);
    };

    //IE: Does not like that this happens before, even if it is also added after.
    if (!isIE()) {
      obj.data = 'about:blank';
    }

    this.element.appendChild(obj);

    //IE: This must occur after adding the object to the DOM.
    if (isIE()) {
      obj.data = 'about:blank';
    }

    this._resizeTriggerElement = obj;
  };

  GeminiScrollbar.prototype.update = function update() {
    if (DONT_CREATE_GEMINI) {
      return this;
    }

    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    this._viewElement.style.width = ((this.element.offsetWidth + SCROLLBAR_WIDTH).toString() + 'px');
    this._viewElement.style.height = ((this.element.offsetHeight + SCROLLBAR_WIDTH).toString() + 'px');

    this._naturalThumbSizeX = this._scrollbarHorizontalElement.clientWidth / this._viewElement.scrollWidth * this._scrollbarHorizontalElement.clientWidth;
    this._naturalThumbSizeY = this._scrollbarVerticalElement.clientHeight / this._viewElement.scrollHeight * this._scrollbarVerticalElement.clientHeight;

    this._scrollTopMax = this._viewElement.scrollHeight - this._viewElement.clientHeight;
    this._scrollLeftMax = this._viewElement.scrollWidth - this._viewElement.clientWidth;

    if (this._naturalThumbSizeY < this.minThumbSize) {
      this._thumbVerticalElement.style.height = this.minThumbSize + 'px';
    } else if (this._scrollTopMax) {
      this._thumbVerticalElement.style.height = this._naturalThumbSizeY + 'px';
    } else {
      this._thumbVerticalElement.style.height = '0px';
    }

    if (this._naturalThumbSizeX < this.minThumbSize) {
      this._thumbHorizontalElement.style.width = this.minThumbSize + 'px';
    } else if (this._scrollLeftMax) {
      this._thumbHorizontalElement.style.width = this._naturalThumbSizeX + 'px';
    } else {
      this._thumbHorizontalElement.style.width = '0px';
    }

    this._thumbSizeY = this._thumbVerticalElement.clientHeight;
    this._thumbSizeX = this._thumbHorizontalElement.clientWidth;

    this._trackTopMax = this._scrollbarVerticalElement.clientHeight - this._thumbSizeY;
    this._trackLeftMax = this._scrollbarHorizontalElement.clientWidth - this._thumbSizeX;

    this._scrollHandler();

    return this;
  };

  GeminiScrollbar.prototype.destroy = function destroy() {
    var this$1 = this;

    if (this._resizeTriggerElement) {
      this.element.removeChild(this._resizeTriggerElement);
      this._resizeTriggerElement = null;
    }

    if (DONT_CREATE_GEMINI) {
      return this;
    }

    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    this._unbinEvents();

    removeClass(this.element, [CLASSNAMES.element, CLASSNAMES.autoshow]);

    if (this.createElements === true) {
      this.element.removeChild(this._scrollbarVerticalElement);
      this.element.removeChild(this._scrollbarHorizontalElement);
      while(this._viewElement.childNodes.length > 0) {
        this$1.element.appendChild(this$1._viewElement.childNodes[0]);
      }
      this.element.removeChild(this._viewElement);
    } else {
      this._viewElement.style.width = '';
      this._viewElement.style.height = '';
      this._scrollbarVerticalElement.style.display = 'none';
      this._scrollbarHorizontalElement.style.display = 'none';
    }

    this._created = false;
    this._document = null;

    return null;
  };

  GeminiScrollbar.prototype.getViewElement = function getViewElement() {
    return this._viewElement;
  };

  GeminiScrollbar.prototype._bindEvents = function _bindEvents() {
    this._cache.events.scrollHandler = this._scrollHandler.bind(this);
    this._cache.events.clickVerticalTrackHandler = this._clickVerticalTrackHandler.bind(this);
    this._cache.events.clickHorizontalTrackHandler = this._clickHorizontalTrackHandler.bind(this);
    this._cache.events.clickVerticalThumbHandler = this._clickVerticalThumbHandler.bind(this);
    this._cache.events.clickHorizontalThumbHandler = this._clickHorizontalThumbHandler.bind(this);
    this._cache.events.mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
    this._cache.events.mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);

    this._viewElement.addEventListener('scroll', this._cache.events.scrollHandler);
    this._scrollbarVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
    this._scrollbarHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
    this._thumbVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
    this._thumbHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
    this._document.addEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);

    return this;
  };

  GeminiScrollbar.prototype._unbinEvents = function _unbinEvents() {
    this._viewElement.removeEventListener('scroll', this._cache.events.scrollHandler);
    this._scrollbarVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
    this._scrollbarHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
    this._thumbVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
    this._thumbHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
    this._document.removeEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
    this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);

    return this;
  };

  GeminiScrollbar.prototype._scrollHandler = function _scrollHandler() {
    var x = (this._viewElement.scrollLeft * this._trackLeftMax / this._scrollLeftMax) || 0;
    var y = (this._viewElement.scrollTop * this._trackTopMax / this._scrollTopMax) || 0;

    this._thumbHorizontalElement.style.msTransform = 'translateX(' + x + 'px)';
    this._thumbHorizontalElement.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    this._thumbHorizontalElement.style.transform = 'translate3d(' + x + 'px, 0, 0)';

    this._thumbVerticalElement.style.msTransform = 'translateY(' + y + 'px)';
    this._thumbVerticalElement.style.webkitTransform = 'translate3d(0, ' + y + 'px, 0)';
    this._thumbVerticalElement.style.transform = 'translate3d(0, ' + y + 'px, 0)';
  };

  GeminiScrollbar.prototype._resizeHandler = function _resizeHandler() {
    this.update();
    if (this.onResize) {
      this.onResize();
    }
  };

  GeminiScrollbar.prototype._clickVerticalTrackHandler = function _clickVerticalTrackHandler(e) {
    var offset = e.offsetY - this._naturalThumbSizeY * .5
      , thumbPositionPercentage = offset * 100 / this._scrollbarVerticalElement.clientHeight;

    this._viewElement.scrollTop = thumbPositionPercentage * this._viewElement.scrollHeight / 100;
  };

  GeminiScrollbar.prototype._clickHorizontalTrackHandler = function _clickHorizontalTrackHandler(e) {
    var offset = e.offsetX - this._naturalThumbSizeX * .5
      , thumbPositionPercentage = offset * 100 / this._scrollbarHorizontalElement.clientWidth;

    this._viewElement.scrollLeft = thumbPositionPercentage * this._viewElement.scrollWidth / 100;
  };

  GeminiScrollbar.prototype._clickVerticalThumbHandler = function _clickVerticalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageY = this._thumbSizeY - e.offsetY;
  };

  GeminiScrollbar.prototype._clickHorizontalThumbHandler = function _clickHorizontalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageX = this._thumbSizeX - e.offsetX;
  };

  GeminiScrollbar.prototype._startDrag = function _startDrag(e) {
    e.stopImmediatePropagation();
    this._cursorDown = true;
    addClass(document.body, [CLASSNAMES.disable]);
    this._document.addEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    this._document.onselectstart = function() {return false;};
  };

  GeminiScrollbar.prototype._mouseUpDocumentHandler = function _mouseUpDocumentHandler() {
    this._cursorDown = false;
    this._prevPageX = this._prevPageY = 0;
    removeClass(document.body, [CLASSNAMES.disable]);
    this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    this._document.onselectstart = null;
  };

  GeminiScrollbar.prototype._mouseMoveDocumentHandler = function _mouseMoveDocumentHandler(e) {
    if (this._cursorDown === false) {return;}

    var offset, thumbClickPosition;

    if (this._prevPageY) {
      offset = e.clientY - this._scrollbarVerticalElement.getBoundingClientRect().top;
      thumbClickPosition = this._thumbSizeY - this._prevPageY;

      this._viewElement.scrollTop = this._scrollTopMax * (offset - thumbClickPosition) / this._trackTopMax;

      return void 0;
    }

    if (this._prevPageX) {
      offset = e.clientX - this._scrollbarHorizontalElement.getBoundingClientRect().left;
      thumbClickPosition = this._thumbSizeX - this._prevPageX;

      this._viewElement.scrollLeft = this._scrollLeftMax * (offset - thumbClickPosition) / this._trackLeftMax;
    }
  };

  {
    module.exports = GeminiScrollbar;
  }
})();
});

var textGradientDefault = createCommonjsModule(function (module, exports) {
/*
 * @module TextGradientDefault
 * text-gradient v0.2.0
 */
(function(factory) {
    'use strict';
    {
        module.exports = factory();
    }
}(function factory() {
    'use strict';
    return {
        __wrapperElement : null,

        /* Initialize.
         * @method _init <private, abstract>
         */
        _init : function _init() {
            this.__wrapperElement = document.createElement('span');

            this._include(this.__wrapperElement.style, {
                display : 'inline-block',
                color : this.options.fallbackColor || this.options.to,
                background : '-webkit-linear-gradient(' + this.options.direction + ', ' + this.options.to + ',' + this.options.from + ')',
                webkitBackgroundClip : 'text',
                webkitTextFillColor : 'transparent'
            });

            this.updateText(this.options.text);
            this.element.appendChild(this.__wrapperElement);
        },

        /* Implementation to update the text contents of this.element keeping the gradient intact.
         * @method updateText <public, abstract> [Function]
         */
        updateText : function updateText(text) {
            if (this._destroyed === true) {
                return console.warn('TextGradient: calling on destroyed object');
            }

            this.__wrapperElement.textContent = this.options.text = text;
        },

        /* Implementation to remove the gradient and created elements.
         * @method destroy <public, abstract> [Function]
         */
        destroy : function destroy() {
            var this$1 = this;

            if (this._destroyed === true) {
                return console.warn('TextGradient: calling on destroyed object');
            }

            while(this.element.childNodes.length > 0) {
                this$1.element.removeChild(this$1.element.childNodes[0]);
            }
            this.element.textContent = this.options.text;

            this.element = null;
            this.options = null;
            this.__wrapperElement = null;
            this._destroyed = true;
            return null;
        }
    };
}));
});

var textGradientSvg = createCommonjsModule(function (module, exports) {
/*
 * @module TextGradientSVG
 * text-gradient v0.2.0
 */
(function(factory) { 'use strict';
    {
        module.exports = factory();
    }
}(function factory() { 'use strict';
     return {
        __wrapperElement : null,
        __textElement : null,
        __maskedClone : null,

        /* Initialize.
         * @method _init <private, abstract>
         */
        _init : function _init() {
            this.__wrapperElement = document.createElement('span');
            this.__textElement = document.createElement('span');

            this._include(this.__wrapperElement.style, {
                position : 'relative',
                display : 'inline-block',
                color : this.options.fallbackColor || this.options.to,
            });

            this.__createGradient();
            this.__createMaskedClone();
            this.__wrapperElement.appendChild(this.__textElement);

            this.updateText(this.options.text);
            this.element.appendChild(this.__wrapperElement);
        },

        /* Creates the SVG Mask and Gradient that will be applied to the element.
         * @method __createGradient <private> [Function]
         */
        __createGradient : function __createGradient() {
            var svgMaskString = "" +
                "<mask id='tg-mask-" + this._id +"'  maskContentUnits='objectBoundingBox'>" +
                    "<linearGradient id='tg-linear-"+ this._id +"' {coords}>" +
                        "<stop stop-color='white' offset='0'/>" +
                        "<stop stop-color='white' stop-opacity='0' offset='1'/>" +
                    "</linearGradient>" +
                    "<rect x='0' y='0' width='1' height='1' fill='url(#tg-linear-"+ this._id +")'/>" +
                "</mask>";

            switch(this.options.direction) {
                case 'top': svgMaskString = svgMaskString.replace(/{coords}/, "x1='0' x2='0' y1='1' y2='0'"); break;
                case 'bottom': svgMaskString = svgMaskString.replace(/{coords}/, "x1='0' x2='0' y1='0' y2='1'"); break;
                case 'left': svgMaskString = svgMaskString.replace(/{coords}/, "x1='1' x2='0' y1='0' y2='0'"); break;
                default: svgMaskString = svgMaskString.replace(/{coords}/, "x1='0' x2='1' y1='0' y2='0'"); break;
            }

            this._svgDefsContainer.insertAdjacentHTML('afterbegin', svgMaskString);
        },

        /* Creates a new element to apply the masking.
         * @method __createMaskedClone <private> [Function]
         */
        __createMaskedClone : function __createMaskedClone() {
            this.__maskedClone = document.createElement('span');

            this._include(this.__maskedClone.style, {
                mask : 'url(#tg-mask-' + this._id +')',
                color : this.options.from,
                position : 'absolute',
                left : 0,
            });

            this.__wrapperElement.appendChild(this.__maskedClone);
        },

        /* Implementation to update the text contents of this.element keeping the gradient intact.
         * @method updateText <public, abstract> [Function]
         */
        updateText : function updateText(text) {
            if (this._destroyed === true) {
                return console.warn('TextGradient: calling on destroyed object');
            }

            this.options.text = text;
            this.__textElement.textContent = text;
            this.__maskedClone.textContent = text;
         },

        /* Implementation to remove the gradient and created elements.
         * @method destroy <public, abstract> [Function]
         */
        destroy : function destroy() {
            var this$1 = this;

            if (this._destroyed === true) {
                return console.warn('TextGradient: calling on destroyed object');
            }

            var svgMaskElement = document.getElementById('tg-mask-' + this._id);
            this._svgDefsContainer.removeChild(svgMaskElement);

            while(this.element.childNodes.length > 0) {
                this$1.element.removeChild(this$1.element.childNodes[0]);
            }
            this.element.textContent = this.options.text;

            this.element = null;
            this.options = null;
            this.__wrapperElement = null;
            this.__textElement = null;
            this.__maskedClone = null;
            this._svgDefsContainer = null;
            this._destroyed = true;
        }
     };
}));
});

var index$3 = createCommonjsModule(function (module, exports) {
/**
 * text-gradient v0.2.0
 * https://github.com/noeldelgado/text-gradient
 * License MIT
 */
(function(factory) {
    'use strict';
    {
        module.exports = factory(
            textGradientDefault,
            textGradientSvg
        );
    }
}(function factory(TextGradientDefault, TextGradientSVG) {
    'use strict';
    TextGradient.version = '0.2.0';

    /* Instances id counter, increased by the constructor Class.
     * Used to generate unique IDs for the SVG implementation.
     * @property _id <protected, static> [Number]
     */
    TextGradient._id = 0;

    /* Holds the implementation Object to be included to the main Class.
     * @property _implementation <protected, static> [Object] TextGradientDefault
     */
    TextGradient._implementation = TextGradientDefault;

    /* Checks if the implementation needs to be changed.
     * @method _updateImplementation <protected, static> [Function]
     */
    TextGradient._updateImplementation = function _updateImplementation() {
        if (('WebkitTextFillColor' in document.documentElement.style) === false) {
            this._implementation = TextGradientSVG;
            document.body.insertAdjacentHTML('afterbegin', "<svg id='tg-svg-container' height='0' width='0' style='position:absolute'><defs></defs></svg>");
            this._svgDefsContainer = document.getElementById('tg-svg-container').getElementsByTagName('defs')[0];
        }
    };

    TextGradient._svgDefsContainer = null;

    /* Merge the contents of two or more objects together into the first object.
     * @helper _include <private> [Function]
     */
    function _include(a, b) {
        var property;
        for (property in b) {
            if (b.hasOwnProperty(property)) {
                a[property] = b[property];
            }
        }
        return a;
    }

    /* Main Class. Holds the behaviour that can run on all implementations.
     * This class allows to extend the behavior through a strategy of module inclusion.
     * That is that once feature support is determined, the module that holds the specific behaviour is included into the class.
     * @argument element <required> [NodeElement] (undefined) Element to apply the text gradient effect.
     * @argument options <optional> [Object] (see defaults) Gradient color-stops, gradient-direction, text.
     */
    function TextGradient(element, config) {
        if ((element.nodeType > 0) === false) {
            throw new Error('TextGradient [constructor]: "element" param should be a NodeElement');
        }

        this.element = element;

        this._id = TextGradient._id++;
        this._svgDefsContainer = TextGradient._svgDefsContainer;
        this._include = _include;

        this.options = _include({
            text : this.element.textContent,
            from : 'transparent',
            to : 'transparent',
            direction : 'right',
            fallbackColor : ''
        }, config);

        this.element.textContent = '';
        this._init();

        return this;
    }

    TextGradient.prototype = {
        _destroyed : false,

        /* Initialize.
         * All implementations should include this method.
         * @method _init <private, abstract>
         */
        _init : function _init() {
            throw new Error('TextGradient.prototype._init not implemented');
        },

        /* Implementation to update the text contents of this.element keeping the gradient intact.
         * All implementations should include this method.
         * @method updateText <public, abstract> [Function]
         */
        updateText : function updateText() {
            throw new Error('TextGradient.prototype.update not implemented');
        },

        /* Implementation to remove the gradient and created elements.
         * All implementations should include this method.
         * @method destroy <public, abstract> [Function]
         */
        destroy : function destroy() {
            throw new Error('TextGradient.properties.destroy not implemented');
        }
    };

    /* Sets the implementation and includes its methods/properties */
    TextGradient._updateImplementation();
    _include(TextGradient.prototype, TextGradient._implementation);

    return TextGradient;
}));
});

var index$4 = createCommonjsModule(function (module, exports) {
/**
 * share-url v1.0.0
 * @link https://github.com/noeldelgado/share-url
 * @license MIT
 */
(function(root, factory) {
    { module.exports = factory(root); }
}(commonjsGlobal, function factory(root) {
    var ENDPOINTS = {
        facebook    : 'https://www.facebook.com/sharer/sharer.php?',
        twitter     : 'https://twitter.com/share?',
        googlePlus  : 'https://plus.google.com/share?',
        pinterest   : 'https://pinterest.com/pin/create/button/?',
        reddit      : 'http://www.reddit.com/submit?',
        delicious   : 'https://delicious.com/save?',
        linkedin    : 'https://www.linkedin.com/shareArticle?'
    };

    return {
        facebook    : facebook,
        twitter     : twitter,
        googlePlus  : googlePlus,
        pinterest   : pinterest,
        reddit      : reddit,
        delicious   : delicious,
        linkedin    : linkedin,
        email       : email
    };

    function _generateUrlParams(data) {
        return Object.keys(data || {}).map(function(propertyName) {
            return propertyName + '=' + encodeURIComponent(data[propertyName]);
        }).join('&');
    }

    /* Compose the share on facebook url string.
     * @argument data [Object] <required>
     * @argument data.u [String] <required>
     * @return url
     */
    function facebook(data) {
        return ENDPOINTS.facebook + _generateUrlParams(data);
    }

    /* Compose the share on twitter url string.
     * @argument data [Object] <required>
     * @argument data.text [String] <optional> Pre-populated text highlighted in the Tweet composer.
     * @argument data.in_reply_to [String] <optional> Status ID string of a parent Tweet such as a Tweet from your account (if applicable).
     * @argument data.url [String] <optional> URL included with the Tweet.
     * @argument data.hashtags [String] <optional> A comma-separated list of hashtags to be appended to default Tweet text.
     * @argument data.via [String] <optional> Attribute the source of a Tweet to a Twitter username.
     * @argument data.related [String] <optional> A comma-separated list of accounts related to the content of the shared URI.
     * @info https://dev.twitter.com/web/tweet-button/parameters
     * @return url
     */
    function twitter(data) {
        return ENDPOINTS.twitter + _generateUrlParams(data);
    }

    /* Compose the share on google+ url string.
     * @argument data [Object] <required>
     * @argument data.url [String] <required> The URL of the page to share.
     * @info https://developers.google.com/+/web/share/
     * @return url
     */
    function googlePlus(data) {
        return ENDPOINTS.googlePlus + _generateUrlParams(data);
    }

    /* Compose the share on pinterest url string.
     * @argument data [Object] <required>
     * @argument data.url <required>
     * @argument data.media <required>
     * @argument data.description <required>
     * @info https://developers.pinterest.com/pin_it/
     * @return url
     */
    function pinterest(data) {
        return ENDPOINTS.pinterest + _generateUrlParams(data);
    }

    /* Compose the submit to reddit url string.
     * @argument data [Object] <required>
     * @argument data.url <required>
     * @argument data.title <optional>
     * @info http://www.reddit.com/buttons/
     * @return url
     */
    function reddit(data) {
        return ENDPOINTS.reddit + _generateUrlParams(data);
    }

    /* Compose the url string to post on delicious.
     * @argument data [Object] <required>
     * @argument url [String] <required>
     * @argument title [String] <optional>
     * @info https://delicious.com/tools
     * @return url
     */
    function delicious(data) {
        return ENDPOINTS.delicious + _generateUrlParams(data);
    }

    /* Compose the share article on linkedin url string.
     * @argument data [Object] <required>
     * @argument data.url [String, 1024] <required> The url-encoded URL of the page that you wish to share.
     * @argument data.mini [Boolean] <required> A required argument who's value must always be: true
     * @argument title [String, 200] <optional> The url-encoded title value that you wish you use.
     * @argument summary [String, 256] <optional> The url-encoded description that you wish you use.
     * @argument source [String, 200] <optional> The url-encoded source of the content (e.g. your website or application name)
     * @info https://developer.linkedin.com/docs/share-on-linkedin
     * @return url
     */
    function linkedin(data) {
        return ENDPOINTS.linkedin + _generateUrlParams(data);
    }

    /* Compose the send email url string.
     * @argument data [Object] <required>
     * @argument to [String] <required>
     * @argument subject [String] <optional>
     * @argument cc [String] <optional>
     * @argument bcc [String] <optional>
     * @argument body [String] <optional>
     * @info https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Email_links
     * @return url
     */
    function email(data) {
        var to = data.to;
        delete data.to;
        var params = _generateUrlParams(data);
        return 'mailto:' + (params.length ? (to + '?' + params) : to);
    }
}));
});

var Tween = createCommonjsModule(function (module, exports) {
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time, preserve) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : TWEEN.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time) || preserve) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
	TWEEN.now = function () {
		var time = process.hrtime();

		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
         window.performance !== undefined &&
		 window.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	TWEEN.now = function () {
		return new Date().getTime();
	};
}


TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _repeatDelayTime;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	this.to = function (properties, duration) {

		_valuesEnd = properties;

		if (duration !== undefined) {
			_duration = duration;
		}

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : TWEEN.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_object[property] === undefined) {
				continue;
			}

			// Save the starting value.
			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object, _object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.end = function () {

		this.update(_startTime + _duration);
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.repeatDelay = function (amount) {

		_repeatDelayTime = amount;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object, _object);
			}

			_onStartCallbackFired = true;
		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end);
					} else {
						end = parseFloat(end);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				if (_repeatDelayTime !== undefined) {
					_startTime = time + _repeatDelayTime;
				} else {
					_startTime = time + _delayTime;
				}

				return true;

			} else {

				if (_onCompleteCallback !== null) {

					_onCompleteCallback.call(_object, _object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof undefined === 'function' && undefined.amd) {

		// AMD
		undefined([], function () {
			return TWEEN;
		});

	} else {

		// Node.js
		module.exports = TWEEN;

	}

})(commonjsGlobal);
});

// print pisces version
var versionElement = [].slice.call(document.querySelectorAll('.version'));
versionElement.map(function (el) {
  el.innerHTML = "v" + version;
  el.classList.remove('hide');
});
versionElement = null;

// set gradient text-gradient
[].slice.call(document.querySelectorAll('.-grad')).forEach(function (i) {
  new index$3(i, {
    from: '#6B6ED8', to: 'rgb(74, 197, 195)'
  });
}
                                                          );
// init and cache
var scrollingBox = document.querySelector('.demo-scrolling-box');
var gemini = new index$2({
  element: scrollingBox,
  createElements: false,
  autoshow: 1
}).create();
var pisces = new Pisces(gemini.getViewElement());

var form = document.querySelector('#demo-form');
var output = document.getElementById('output');
var scrollToOption = document.getElementById('scroll-to-option');

var items = document.querySelectorAll('.demo-scrolling-box li');
var itemsOptions = document.getElementById('scroll-to-element');
var elementsOptions = document.getElementById('elements-select-wrapper');
var coordOptions = document.getElementById('coords-input-wrapper');
var coordX = document.getElementById('coord-x');
var coordY = document.getElementById('coord-y');
var easesOptgroup = document.querySelector('optgroup[label="eases"]');
var easingOption = document.getElementById('easing-option');
var reDot = new RegExp(/\./);
var durationOption = document.getElementById('duration-option');

// create Tween.js easing options
var TweenEasings = Tween.Easing;
var tweenjsOptgroup = document.createElement('optgroup');
tweenjsOptgroup.label = 'tween.js';
Object.keys(TweenEasings).forEach(function(e) {
  Object.keys(TweenEasings[e]).forEach(function(o) {
    var option = document.createElement('option');
    option.value = "Tween.Easing." + e + "." + o;
    option.text = e + "." + o;
    tweenjsOptgroup.appendChild(option);
  });
});
easingOption.appendChild(tweenjsOptgroup);

// create sharable urls
var t = {
  related: 'pixelia_me',
  text: ("pisces " + version + " — Scroll to locations of any scrolling box in a smooth fashion "),
  url: 'http://noeldelgado.github.io/pisces/',
  via: 'pixelia_me'
};
document.querySelector('.js-share-twitter').href = index$4.twitter(t);

var f = {
  u: 'http://noeldelgado.github.io/pisces/'
};
document.querySelector('.js-share-facebook').href = index$4.facebook(f);


function formSubmitHandler(ev) {
  ev.preventDefault();

  var options = {};

  if (durationOption.value) {
    options.duration = durationOption.value;
  }

  if (easingOption.value !== 'default') {
    var ease;
    easingOption.value.split(reDot).forEach(function (i) {
      ease = (typeof window[i] === 'undefined') ? ease[i] : window[i];
    });
    options.easing = ease;
  }

  switch(scrollToOption.value) {
    case 'element':
      var el = items[(itemsOptions.value || 15) - 1];
      pisces.scrollToElement(el, options);
      break;
    case 'position':
      var coords = {x: coordX.value, y: coordY.value};
      pisces.scrollToPosition(coords, options);
      break;
    default:
      pisces[scrollToOption.value](options);
      break;
  }

  return false;
}

function changeHandler(ev) {
  elementsOptions.style.display = "none";
  itemsOptions.disabled = true;
  coordOptions.style.display = "none";

  switch(ev.target.value) {
    case 'element':
      elementsOptions.style.display = "";
      itemsOptions.disabled = false;
      break;
    case 'position':
      coordOptions.style.display = "";
      break;
  }
}

form.addEventListener('submit', formSubmitHandler);
scrollToOption.addEventListener('change', changeHandler);

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQvanMvbWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2pzL19lbnRyaWVzL21haW4uanMiXSwibmFtZXMiOlsibGV0IiwiY29uc3QiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFDO0FBQ3JDLFNBQVMsT0FBTyxRQUFRLDBCQUEwQixDQUFDOztBQUVuRCxPQUFPLE1BQU0sTUFBTSxrQkFBa0IsQ0FBQztBQUN0QyxPQUFPLFlBQVksTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBQ2pDLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQzs7O0FBRzdCQSxHQUFHLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQzFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLENBQUEsQ0FBQyxBQUFHO0VBQ3ZCLEVBQUUsQ0FBQyxTQUFTLEdBQUcsR0FBRSxHQUFFLE9BQU8sQUFBRSxDQUFDO0VBQzdCLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzdCLENBQUMsQ0FBQztBQUNILGNBQWMsR0FBRyxJQUFJLENBQUM7OztBQUd0QixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLENBQUEsQ0FBQyxBQUFHO0VBQzlELElBQUksWUFBWSxDQUFDLENBQUMsRUFBRTtJQUNsQixJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxtQkFBbUI7R0FDekMsQ0FBQyxDQUFDO0NBQ0o7MkRBQzBEOztBQUUzREMsR0FBSyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbkVBLEdBQUssQ0FBQyxN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Q1IsS0FBSyxVQUFVO01BQ2JBLEdBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQ2xELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7TUFDekMsTUFBTTtJQUNSO01BQ0UsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztNQUN0QyxNQUFNO0dBQ1Q7O0VBRUQsT0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxFQUFFLEVBQUU7RUFDekIsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0VBQ3ZDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0VBQzdCLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7RUFFcEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUs7SUFDcEIsS0FBSyxTQUFTO01BQ1osZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO01BQ25DLFlBQVksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO01BQzlCLE1BQU07SUFDUixLQUFLLFVBQVU7TUFDYixZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7TUFDaEMsTUFBTTtHQUNUO0NBQ0Y7O0FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25ELGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBpc2NlcyBmcm9tICcuLi8uLi8uLi8uLi9zcmMnO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5cbmltcG9ydCBHZW1pbmkgZnJvbSAnZ2VtaW5pLXNjcm9sbGJhcic7XG5pbXBvcnQgVGV4dEdyYWRpZW50IGZyb20gJ3RleHQtZ3JhZGllbnQnO1xuaW1wb3J0IFNoYXJlVXJsIGZyb20gJ3NoYXJlLXVybCc7XG5pbXBvcnQgVHdlZW4gZnJvbSAndHdlZW4uanMnO1xuXG4vLyBwcmludCBwaXNjZXMgdmVyc2lvblxubGV0IHZlcnNpb25FbGVtZW50ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudmVyc2lvbicpKTtcbnZlcnNpb25FbGVtZW50Lm1hcChlbCA9PiB7XG4gIGVsLmlubmVySFRNTCA9IGB2JHt2ZXJzaW9ufWA7XG4gIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbn0pO1xudmVyc2lvbkVsZW1lbnQgPSBudWxsO1xuXG4vLyBzZXQgZ3JhZGllbnQgdGV4dC1ncmFkaWVudFxuW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuLWdyYWQnKSkuZm9yRWFjaChpID0+IHtcbiAgbmV3IFRleHRHcmFkaWVudChpLCB7XG4gICAgZnJvbTogJyM2QjZFRDgnLCB0bzogJ3JnYig3NCwgMTk3LCAxOTUpJ1xuICB9KTtcbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4vLyBpbml0IGFuZCBjYWNoZVxuY29uc3Qgc2Nyb2xsaW5nQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRlbW8tc2Nyb2xsaW5nLWJveCcpO1xuY29uc3QgZ2VtaW5pID0gbmV3IEdlbWluaSh7XG4gIGVsZW1lbnQ6IHNjcm9sbGluZ0JveCxcbiAgY3JlYXRlRWxlbWVudHM6IGZhbHNlLFxuICBhdXRvc2hvdzogMVxufSkuY3JlYXRlKCk7XG5jb25zdCBwaXNjZXMgPSBuZXcgUGlzY2VzKGdlbWluaS5nZXRWaWV3RWxlbWVudCgpKTtcblxuY29uc3QgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZW1vLWZvcm0nKTtcbmNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbmNvbnN0IHNjcm9sbFRvT3B0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njcm9sbC10by1vcHRpb24nKTtcblxuY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVtby1zY3JvbGxpbmctYm94IGxpJyk7XG5jb25zdCBpdGVtc09wdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Nyb2xsLXRvLWVsZW1lbnQnKTtcbmNvbnN0IGVsZW1lbnRzT3B0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbGVtZW50cy1zZWxlY3Qtd3JhcHBlcicpO1xuY29uc3QgY29vcmRPcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvb3Jkcy1pbnB1dC13cmFwcGVyJyk7XG5jb25zdCBjb29yZFggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29vcmQteCcpO1xuY29uc3QgY29vcmRZID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvb3JkLXknKTtcbmNvbnN0IGVhc2VzT3B0Z3JvdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdvcHRncm91cFtsYWJlbD1cImVhc2VzXCJdJyk7XG5jb25zdCBlYXNpbmdPcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWFzaW5nLW9wdGlvbicpO1xuY29uc3QgcmVEb3QgPSBuZXcgUmVnRXhwKC9cXC4vKTtcbmNvbnN0IGR1cmF0aW9uT3B0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uLW9wdGlvbicpO1xuXG4vLyBjcmVhdGUgVHdlZW4uanMgZWFzaW5nIG9wdGlvbnNcbmNvbnN0IFR3ZWVuRWFzaW5ncyA9IFR3ZWVuLkVhc2luZztcbmNvbnN0IHR3ZWVuanNPcHRncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGdyb3VwJyk7XG50d2VlbmpzT3B0Z3JvdXAubGFiZWwgPSAndHdlZW4uanMnO1xuT2JqZWN0LmtleXMoVHdlZW5FYXNpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgT2JqZWN0LmtleXMoVHdlZW5FYXNpbmdzW2VdKS5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udmFsdWUgPSBgVHdlZW4uRWFzaW5nLiR7ZX0uJHtvfWA7XG4gICAgb3B0aW9uLnRleHQgPSBgJHtlfS4ke299YDtcbiAgICB0d2VlbmpzT3B0Z3JvdXAuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfSk7XG59KTtcbmVhc2luZ09wdGlvbi5hcHBlbmRDaGlsZCh0d2VlbmpzT3B0Z3JvdXApO1xuXG4vLyBjcmVhdGUgc2hhcmFibGUgdXJsc1xuY29uc3QgdCA9IHtcbiAgcmVsYXRlZDogJ3BpeGVsaWFfbWUnLFxuICB0ZXh0OiBgcGlzY2VzICR7dmVyc2lvbn0g4oCUIFNjcm9sbCB0byBsb2NhdGlvbnMgb2YgYW55IHNjcm9sbGluZyBib3ggaW4gYSBzbW9vdGggZmFzaGlvbiBgLFxuICB1cmw6ICdodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL3Bpc2Nlcy8nLFxuICB2aWE6ICdwaXhlbGlhX21lJ1xufTtcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaGFyZS10d2l0dGVyJykuaHJlZiA9IFNoYXJlVXJsLnR3aXR0ZXIodCk7XG5cbmNvbnN0IGYgPSB7XG4gIHU6ICdodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL3Bpc2Nlcy8nXG59O1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNoYXJlLWZhY2Vib29rJykuaHJlZiA9IFNoYXJlVXJsLmZhY2Vib29rKGYpO1xuXG5cbmZ1bmN0aW9uIGZvcm1TdWJtaXRIYW5kbGVyKGV2KSB7XG4gIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gIGlmIChkdXJhdGlvbk9wdGlvbi52YWx1ZSkge1xuICAgIG9wdGlvbnMuZHVyYXRpb24gPSBkdXJhdGlvbk9wdGlvbi52YWx1ZTtcbiAgfVxuXG4gIGlmIChlYXNpbmdPcHRpb24udmFsdWUgIT09ICdkZWZhdWx0Jykge1xuICAgIGxldCBlYXNlO1xuICAgIGVhc2luZ09wdGlvbi52YWx1ZS5zcGxpdChyZURvdCkuZm9yRWFjaChpID0+IHtcbiAgICAgIGVhc2UgPSAodHlwZW9mIHdpbmRvd1tpXSA9PT0gJ3VuZGVmaW5lZCcpID8gZWFzZVtpXSA6IHdpbmRvd1tpXTtcbiAgICB9KTtcbiAgICBvcHRpb25zLmVhc2luZyA9IGVhc2U7XG4gIH1cblxuICBzd2l0Y2goc2Nyb2xsVG9PcHRpb24udmFsdWUpIHtcbiAgICBjYXNlICdlbGVtZW50JzpcbiAgICAgIGNvbnN0IGVsID0gaXRlbXNbKGl0ZW1zT3B0aW9ucy52YWx1ZSB8fCAxNSkgLSAxXTtcbiAgICAgIHBpc2Nlcy5zY3JvbGxUb0VsZW1lbnQoZWwsIG9wdGlvbnMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncG9zaXRpb24nOlxuICAgICAgY29uc3QgY29vcmRzID0ge3g6IGNvb3JkWC52YWx1ZSwgeTogY29vcmRZLnZhbHVlfTtcbiAgICAgIHBpc2Nlcy5zY3JvbGxUb1Bvc2l0aW9uKGNvb3Jkcywgb3B0aW9ucyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcGlzY2VzW3Njcm9sbFRvT3B0aW9uLnZhbHVlXShvcHRpb25zKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VIYW5kbGVyKGV2KSB7XG4gIGVsZW1lbnRzT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIGl0ZW1zT3B0aW9ucy5kaXNhYmxlZCA9IHRydWU7XG4gIGNvb3JkT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgc3dpdGNoKGV2LnRhcmdldC52YWx1ZSkge1xuICAgIGNhc2UgJ2VsZW1lbnQnOlxuICAgICAgZWxlbWVudHNPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgaXRlbXNPcHRpb25zLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwb3NpdGlvbic6XG4gICAgICBjb29yZE9wdGlvbnMuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZvcm1TdWJtaXRIYW5kbGVyKTtcbnNjcm9sbFRvT3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZUhhbmRsZXIpO1xuIl19