var getScrollingElement = function () {
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

var BODY = document.body;
var relativeValueReg = new RegExp(/^(\-|\+)\d/);
var numberReg = new RegExp(/^\d*\.?\d*$/);

function assign(target) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

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

var version$1 = "0.0.18";

var Pisces = function Pisces(scrollingBox, options) {
  if ( scrollingBox === void 0 ) scrollingBox = getScrollingElement();
  if ( options === void 0 ) options = {};

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
    if ( options === void 0 ) options = {};

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
    if ( target === void 0 ) target = null;

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

Pisces.VERSION = version$1;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index = createCommonjsModule(function (module, exports) {
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
    
    {
        module.exports = factory();
    }
}(function factory() {
    
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
(function(factory) { 
    {
        module.exports = factory();
    }
}(function factory() { 
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

var index$1 = createCommonjsModule(function (module, exports) {
/**
 * text-gradient v0.2.0
 * https://github.com/noeldelgado/text-gradient
 * License MIT
 */
(function(factory) {
    
    {
        module.exports = factory(
            textGradientDefault,
            textGradientSvg
        );
    }
}(function factory(TextGradientDefault, TextGradientSVG) {
    
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

var index$2 = createCommonjsModule(function (module, exports) {
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

var version = Pisces.VERSION;

// print pisces version
var versionElement = [].slice.call(document.querySelectorAll('.version'));
versionElement.map(function (el) {
  el.innerHTML = "v" + version;
  el.classList.remove('hide');
});
versionElement = null;

// set gradient text-gradient
[].slice.call(document.querySelectorAll('.-grad')).forEach(function (i) {
  new index$1(i, {
    from: '#6B6ED8', to: 'rgb(74, 197, 195)'
  });
}
                                                          );
// init and cache
var scrollingBox = document.querySelector('.demo-scrolling-box');
var gemini = new index({
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
document.querySelector('.js-share-twitter').href = index$2.twitter(t);

var f = {
  u: 'http://noeldelgado.github.io/pisces/'
};
document.querySelector('.js-share-facebook').href = index$2.facebook(f);


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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvbm9kZV9tb2R1bGVzL2dldC1zY3JvbGxpbmdlbGVtZW50L2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9saWIvaW5kZXguZXMuanMiLCIvVXNlcnMvbm9lbC9Qcm9qZWN0cy9wZXJzb25hbC9naXRodWIvcGlzY2VzL2RvY3Mvbm9kZV9tb2R1bGVzL2dlbWluaS1zY3JvbGxiYXIvaW5kZXguanMiLCIvVXNlcnMvbm9lbC9Qcm9qZWN0cy9wZXJzb25hbC9naXRodWIvcGlzY2VzL2RvY3Mvbm9kZV9tb2R1bGVzL3RleHQtZ3JhZGllbnQvdGV4dC1ncmFkaWVudC1kZWZhdWx0LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy90ZXh0LWdyYWRpZW50L3RleHQtZ3JhZGllbnQtc3ZnLmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy90ZXh0LWdyYWRpZW50L2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy9zaGFyZS11cmwvaW5kZXguanMiLCIvVXNlcnMvbm9lbC9Qcm9qZWN0cy9wZXJzb25hbC9naXRodWIvcGlzY2VzL2RvY3Mvbm9kZV9tb2R1bGVzL3R3ZWVuLmpzL3NyYy9Ud2Vlbi5qcyIsIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvZG9jcy9zcmMvanMvX2VudHJpZXMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIGlmICgnc2Nyb2xsaW5nRWxlbWVudCcgaW4gZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudDtcbiAgfVxuXG4gIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGNvbnN0IHN0YXJ0ID0gaHRtbC5zY3JvbGxUb3A7XG4gIGxldCBlbmQ7XG5cbiAgaHRtbC5zY3JvbGxUb3AgPSBzdGFydCArIDE7XG5cbiAgZW5kID0gaHRtbC5zY3JvbGxUb3A7XG5cbiAgaHRtbC5zY3JvbGxUb3AgPSBzdGFydDtcblxuICBpZiAoZW5kID4gc3RhcnQpIHtcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIHJldHVybiBkb2N1bWVudC5ib2R5O1xufVxuIiwiaW1wb3J0IGdldFNjcm9sbGluZ0VsZW1lbnQgZnJvbSAnZ2V0LXNjcm9sbGluZ2VsZW1lbnQnO1xuXG5jb25zdCBCT0RZID0gZG9jdW1lbnQuYm9keTtcbmNvbnN0IHJlbGF0aXZlVmFsdWVSZWcgPSBuZXcgUmVnRXhwKC9eKFxcLXxcXCspXFxkLyk7XG5jb25zdCBudW1iZXJSZWcgPSBuZXcgUmVnRXhwKC9eXFxkKlxcLj9cXGQqJC8pO1xuXG5mdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCAuLi5zb3VyY2VzKSB7XG4gIFsuLi5zb3VyY2VzXS5tYXAoc291cmNlID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc291cmNlKS5tYXAocHJvcGVydHlOYW1lID0+IHtcbiAgICAgIHRhcmdldFtwcm9wZXJ0eU5hbWVdID0gc291cmNlW3Byb3BlcnR5TmFtZV07XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnQoZWwpIHtcbiAgcmV0dXJuIChlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKTtcbn1cblxuZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKTtcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcbiAgcmV0dXJuICgodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgfHwgbnVtYmVyUmVnLnRlc3QodmFsdWUpKTtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzQm9keShlbCkge1xuICByZXR1cm4gKGVsID09PSBCT0RZKTtcbn1cblxuZnVuY3Rpb24gaXNSZWxhdGl2ZVZhbHVlKHZhbHVlKSB7XG4gIGlmICghaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHJlbGF0aXZlVmFsdWVSZWcudGVzdCh2YWx1ZSk7XG59XG5cbnZhciB2ZXJzaW9uID0gXCIwLjAuMThcIjtcblxuY2xhc3MgUGlzY2VzIHtcbiAgc3RhdGljIGRlZmF1bHRzKCkge1xuICAgIGNvbnN0IGR1cmF0aW9uID0gNjAwO1xuICAgIGNvbnN0IGVhc2luZyA9IHQgPT4gTWF0aC5zcXJ0KDEgLSAoLS10ICogdCkpO1xuICAgIGNvbnN0IG9uQ29tcGxldGUgPSBudWxsO1xuICAgIHJldHVybiB7IGR1cmF0aW9uLCBlYXNpbmcsIG9uQ29tcGxldGUgfTtcbiAgfVxuXG4gIGdldCBzdGFydCgpIHtcbiAgICBjb25zdCB7IHNjcm9sbExlZnQsIHNjcm9sbFRvcCB9ID0gdGhpcy5zY3JvbGxpbmdCb3g7XG4gICAgcmV0dXJuIHsgeDogc2Nyb2xsTGVmdCwgeTogc2Nyb2xsVG9wIH07XG4gIH1cblxuICBnZXQgbWF4KCkge1xuICAgIGNvbnN0IGVsID0gdGhpcy5zY3JvbGxpbmdCb3g7XG4gICAgbGV0IHg7XG4gICAgbGV0IHk7XG4gICAgaWYgKGlzQm9keShlbCkpIHtcbiAgICAgIHggPSAoZWwuc2Nyb2xsV2lkdGggLSB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgICB5ID0gKGVsLnNjcm9sbEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSAoZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aCk7XG4gICAgICB5ID0gKGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc2Nyb2xsaW5nQm94ID0gZ2V0U2Nyb2xsaW5nRWxlbWVudCgpLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNjcm9sbGluZ0JveCA9IHNjcm9sbGluZ0JveDtcbiAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIFBpc2Nlcy5kZWZhdWx0cygpLCBvcHRpb25zKTtcbiAgfVxuXG4gIF9hbmltYXRlKGNvb3Jkcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIGNvbnN0IF9vcHRpb25zID0gYXNzaWduKHt9LCBfdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3Qgc3RlcCA9IGZ1bmN0aW9uICh0aW1lc3RhbXApIHtcbiAgICAgIGNvbnN0IGVsYXBzZWQgPSBNYXRoLmFicyh0aW1lc3RhbXAgLSBzdGFydCk7XG4gICAgICBjb25zdCBwcm9ncmVzcyA9IF9vcHRpb25zLmVhc2luZyhlbGFwc2VkIC8gX29wdGlvbnMuZHVyYXRpb24pO1xuICAgICAgX3RoaXMuc2Nyb2xsaW5nQm94LnNjcm9sbFRvcCA9IChjb29yZHMuc3RhcnQueSArIGNvb3Jkcy5lbmQueSAqIHByb2dyZXNzKTtcbiAgICAgIF90aGlzLnNjcm9sbGluZ0JveC5zY3JvbGxMZWZ0ID0gKGNvb3Jkcy5zdGFydC54ICsgY29vcmRzLmVuZC54ICogcHJvZ3Jlc3MpO1xuICAgICAgaWYgKGVsYXBzZWQgPiBfb3B0aW9ucy5kdXJhdGlvbikgX3RoaXMuX2NvbXBsZXRlZChjb29yZHMsIF9vcHRpb25zKTtcbiAgICAgIGVsc2UgX3RoaXMuX1JBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgICB9O1xuXG4gICAgX3RoaXMuY2FuY2VsKCk7XG4gICAgX3RoaXMuX1JBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9jb21wbGV0ZWQoY29vcmRzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICB0aGlzLnNjcm9sbGluZ0JveC5zY3JvbGxUb3AgPSAoY29vcmRzLnN0YXJ0LnkgKyBjb29yZHMuZW5kLnkpO1xuICAgIHRoaXMuc2Nyb2xsaW5nQm94LnNjcm9sbExlZnQgPSAoY29vcmRzLnN0YXJ0LnggKyBjb29yZHMuZW5kLngpO1xuICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMub25Db21wbGV0ZSkpIG9wdGlvbnMub25Db21wbGV0ZSgpO1xuICB9XG5cbiAgX2dldEVuZENvb3JkaW5hdGVWYWx1ZShjb29yZCwgc3RhcnQsIG1heCkge1xuICAgIGlmIChpc051bWJlcihjb29yZCkpIHtcbiAgICAgIGlmIChjb29yZCA+IG1heCkgY29vcmQgPSBtYXg7XG4gICAgICByZXR1cm4gKGNvb3JkIC0gc3RhcnQpO1xuICAgIH1cblxuICAgIGlmIChpc1JlbGF0aXZlVmFsdWUoY29vcmQpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IChzdGFydCAtIChzdGFydCAtIH5+Y29vcmQpKTtcbiAgICAgIGlmICgoc3RhcnQgKyB2YWx1ZSkgPiBtYXgpIHJldHVybiAobWF4IC0gc3RhcnQpO1xuICAgICAgZWxzZSBpZiAoKHN0YXJ0ICsgdmFsdWUpIDwgMCkgcmV0dXJuIC1zdGFydDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHNjcm9sbFRvKHRhcmdldCA9IG51bGwsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBFUlJPUl9NRVNTQUdFID0gJ3RhcmdldCBwYXJhbSBzaG91bGQgYmUgYSBIVE1MRWxlbWVudCBvciBhbmQgJyArXG4gICAgICAnb2JqZWN0IGZvcm1hdHRlZCBhczoge3g6IE51bWJlciwgeTogTnVtYmVyfSc7XG5cbiAgICBpZiAoaXNOdWxsKHRhcmdldCkgfHwgaXNVbmRlZmluZWQodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ3RhcmdldCBwYXJhbSBpcyByZXF1aXJlZCcpO1xuICAgIH0gZWxzZSBpZiAoIWlzT2JqZWN0KHRhcmdldCkgJiYgIWlzU3RyaW5nKHRhcmdldCkpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKEVSUk9SX01FU1NBR0UpO1xuICAgIH1cblxuICAgIGlmIChpc1N0cmluZyh0YXJnZXQpKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zY3JvbGxpbmdCb3gucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuICAgICAgaWYgKGlzRWxlbWVudChlbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKEVSUk9SX01FU1NBR0UpO1xuICAgIH1cblxuICAgIGlmIChpc0VsZW1lbnQodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9FbGVtZW50KHRhcmdldCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9Qb3NpdGlvbih0YXJnZXQsIG9wdGlvbnMpO1xuICB9XG5cbiAgc2Nyb2xsVG9FbGVtZW50KGVsLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICAgIGNvbnN0IGVuZCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldChlbCk7XG4gICAgaWYgKCFlbmQpIHJldHVybjtcbiAgICByZXR1cm4gdGhpcy5fYW5pbWF0ZSh7IHN0YXJ0LCBlbmQgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBzY3JvbGxUb1Bvc2l0aW9uKGNvb3Jkcywgb3B0aW9ucykge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5zdGFydDtcbiAgICBjb25zdCBtYXggPSB0aGlzLm1heDtcbiAgICBsZXQgeCA9IChjb29yZHMuaGFzT3duUHJvcGVydHkoJ3gnKSkgPyBjb29yZHMueCA6IHN0YXJ0Lng7XG4gICAgbGV0IHkgPSAoY29vcmRzLmhhc093blByb3BlcnR5KCd5JykpID8gY29vcmRzLnkgOiBzdGFydC55O1xuICAgIHggPSB0aGlzLl9nZXRFbmRDb29yZGluYXRlVmFsdWUoeCwgc3RhcnQueCwgbWF4LngpO1xuICAgIHkgPSB0aGlzLl9nZXRFbmRDb29yZGluYXRlVmFsdWUoeSwgc3RhcnQueSwgbWF4LnkpO1xuICAgIGNvbnN0IGVuZCA9IHsgeCwgeSB9O1xuICAgIHJldHVybiB0aGlzLl9hbmltYXRlKHsgc3RhcnQsIGVuZCB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHNjcm9sbFRvVG9wKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgY29uc3QgZW5kID0geyB4OiAwLCB5OiAtKHN0YXJ0LnkpIH07XG4gICAgcmV0dXJuIHRoaXMuX2FuaW1hdGUoeyBzdGFydCwgZW5kIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20ob3B0aW9ucykge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5zdGFydDtcbiAgICBjb25zdCBtYXggPSB0aGlzLm1heDtcbiAgICBjb25zdCBlbmQgPSAgeyB4OiAwLCB5OiAobWF4LnkgLSBzdGFydC55KSB9O1xuICAgIHJldHVybiB0aGlzLl9hbmltYXRlKHsgc3RhcnQsIGVuZCB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHNjcm9sbFRvTGVmdChvcHRpb25zKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICAgIGNvbnN0IGVuZCA9ICB7IHg6IC0oc3RhcnQueCksIHk6IDAgfTtcbiAgICByZXR1cm4gdGhpcy5fYW5pbWF0ZSh7IHN0YXJ0LCBlbmQgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBzY3JvbGxUb1JpZ2h0KG9wdGlvbnMpIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgY29uc3QgbWF4ID0gdGhpcy5tYXg7XG4gICAgY29uc3QgZW5kID0gIHsgeDogKG1heC54IC0gc3RhcnQueCksIHk6IDAgfTtcbiAgICByZXR1cm4gdGhpcy5fYW5pbWF0ZSh7IHN0YXJ0LCBlbmQgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5fUkFGID0gY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fUkFGKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldEVsZW1lbnRPZmZzZXQoZWwpIHtcbiAgICBpZiAoIWlzQm9keShlbCkgJiYgIXRoaXMuc2Nyb2xsaW5nQm94LmNvbnRhaW5zKGVsKSkge1xuICAgICAgY29uc29sZS5lcnJvcignc2Nyb2xsaW5nQm94IGRvZXMgbm90IGNvbnRhaW5zIGVsZW1lbnQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgY29uc3QgbWF4ID0gdGhpcy5tYXg7XG4gICAgbGV0IGUgPSBlbDtcbiAgICBsZXQgX3RvcCA9IDA7XG4gICAgbGV0IF9sZWZ0ID0gMDtcbiAgICBsZXQgeCA9IDA7XG4gICAgbGV0IHkgPSAwO1xuXG4gICAgZG8ge1xuICAgICAgX2xlZnQgKz0gZS5vZmZzZXRMZWZ0O1xuICAgICAgX3RvcCArPSBlLm9mZnNldFRvcDtcbiAgICAgIGUgPSBlLnBhcmVudEVsZW1lbnQ7XG4gICAgfSB3aGlsZSAoZSAhPT0gdGhpcy5zY3JvbGxpbmdCb3gpO1xuXG4gICAgeCA9IChfbGVmdCAtIHN0YXJ0LngpO1xuICAgIHkgPSAoX3RvcCAtIHN0YXJ0LnkpO1xuXG4gICAgaWYgKHggPiBtYXgueCkgeCA9IG1heC54O1xuICAgIGlmICh5ID4gbWF4LnkpIHkgPSBtYXgueTtcblxuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfVxufVxuXG5QaXNjZXMuVkVSU0lPTiA9IHZlcnNpb247XG5cbmV4cG9ydCBkZWZhdWx0IFBpc2NlcztcbiIsIi8qKlxuICogZ2VtaW5pLXNjcm9sbGJhclxuICogQHZlcnNpb24gMS41LjFcbiAqIEBsaW5rIGh0dHA6Ly9ub2VsZGVsZ2Fkby5naXRodWIuaW8vZ2VtaW5pLXNjcm9sbGJhci9cbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBTQ1JPTExCQVJfV0lEVEgsIERPTlRfQ1JFQVRFX0dFTUlOSSwgQ0xBU1NOQU1FUztcblxuICBDTEFTU05BTUVTID0ge1xuICAgIGVsZW1lbnQ6ICdnbS1zY3JvbGxiYXItY29udGFpbmVyJyxcbiAgICB2ZXJ0aWNhbFNjcm9sbGJhcjogJ2dtLXNjcm9sbGJhciAtdmVydGljYWwnLFxuICAgIGhvcml6b250YWxTY3JvbGxiYXI6ICdnbS1zY3JvbGxiYXIgLWhvcml6b250YWwnLFxuICAgIHRodW1iOiAndGh1bWInLFxuICAgIHZpZXc6ICdnbS1zY3JvbGwtdmlldycsXG4gICAgYXV0b3Nob3c6ICdnbS1hdXRvc2hvdycsXG4gICAgZGlzYWJsZTogJ2dtLXNjcm9sbGJhci1kaXNhYmxlLXNlbGVjdGlvbicsXG4gICAgcHJldmVudGVkOiAnZ20tcHJldmVudGVkJyxcbiAgICByZXNpemVUcmlnZ2VyOiAnZ20tcmVzaXplLXRyaWdnZXInLFxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFNjcm9sbGJhcldpZHRoKCkge1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIHN3O1xuICAgIGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGUuc3R5bGUudG9wID0gJy05OTk5cHgnO1xuICAgIGUuc3R5bGUud2lkdGggPSAnMTAwcHgnO1xuICAgIGUuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4JztcbiAgICBlLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gICAgZS5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSAnc2Nyb2xsYmFyJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGUpO1xuICAgIHN3ID0gKGUub2Zmc2V0V2lkdGggLSBlLmNsaWVudFdpZHRoKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGUpO1xuICAgIHJldHVybiBzdztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENsYXNzKGVsLCBjbGFzc05hbWVzKSB7XG4gICAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgICAgcmV0dXJuIGNsYXNzTmFtZXMuZm9yRWFjaChmdW5jdGlvbihjbCkge1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGNsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgY2xhc3NOYW1lcykge1xuICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICAgIHJldHVybiBjbGFzc05hbWVzLmZvckVhY2goZnVuY3Rpb24oY2wpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cCgnKF58XFxcXGIpJyArIGNsYXNzTmFtZXMuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xuICB9XG5cbiAgLyogQ29weXJpZ2h0IChjKSAyMDE1IEx1Y2FzIFdpZW5lclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vd25yL2VsZW1lbnQtcmVzaXplLWRldGVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBpc0lFKCkge1xuICAgIHZhciBhZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gYWdlbnQuaW5kZXhPZihcIm1zaWVcIikgIT09IC0xIHx8IGFnZW50LmluZGV4T2YoXCJ0cmlkZW50XCIpICE9PSAtMSB8fCBhZ2VudC5pbmRleE9mKFwiIGVkZ2UvXCIpICE9PSAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEdlbWluaVNjcm9sbGJhcihjb25maWcpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuYXV0b3Nob3cgPSBmYWxzZTtcbiAgICB0aGlzLmNyZWF0ZUVsZW1lbnRzID0gdHJ1ZTtcbiAgICB0aGlzLmZvcmNlR2VtaW5pID0gZmFsc2U7XG4gICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG4gICAgdGhpcy5taW5UaHVtYlNpemUgPSAyMDtcblxuICAgIE9iamVjdC5rZXlzKGNvbmZpZyB8fCB7fSkuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHlOYW1lKSB7XG4gICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBjb25maWdbcHJvcGVydHlOYW1lXTtcbiAgICB9LCB0aGlzKTtcblxuICAgIFNDUk9MTEJBUl9XSURUSCA9IGdldFNjcm9sbGJhcldpZHRoKCk7XG4gICAgRE9OVF9DUkVBVEVfR0VNSU5JID0gKChTQ1JPTExCQVJfV0lEVEggPT09IDApICYmICh0aGlzLmZvcmNlR2VtaW5pID09PSBmYWxzZSkpO1xuXG4gICAgdGhpcy5fY2FjaGUgPSB7ZXZlbnRzOiB7fX07XG4gICAgdGhpcy5fY3JlYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2N1cnNvckRvd24gPSBmYWxzZTtcbiAgICB0aGlzLl9wcmV2UGFnZVggPSAwO1xuICAgIHRoaXMuX3ByZXZQYWdlWSA9IDA7XG5cbiAgICB0aGlzLl9kb2N1bWVudCA9IG51bGw7XG4gICAgdGhpcy5fdmlld0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50ID0gbnVsbDtcbiAgfVxuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIGlmIChET05UX0NSRUFURV9HRU1JTkkpIHtcbiAgICAgIGFkZENsYXNzKHRoaXMuZWxlbWVudCwgW0NMQVNTTkFNRVMucHJldmVudGVkXSk7XG5cbiAgICAgIGlmICh0aGlzLm9uUmVzaXplKSB7XG4gICAgICAgIC8vIHN0aWxsIG5lZWQgYSByZXNpemUgdHJpZ2dlciBpZiB3ZSBoYXZlIGFuIG9uUmVzaXplIGNhbGxiYWNrLCB3aGljaFxuICAgICAgICAvLyBhbHNvIG1lYW5zIHdlIG5lZWQgYSBzZXBhcmF0ZSBfdmlld0VsZW1lbnQgdG8gZG8gdGhlIHNjcm9sbGluZy5cbiAgICAgICAgaWYgKHRoaXMuY3JlYXRlRWxlbWVudHMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLl92aWV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgIHdoaWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3ZpZXdFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl92aWV3RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTTkFNRVMudmlldyk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5lbGVtZW50XSk7XG4gICAgICAgIGFkZENsYXNzKHRoaXMuX3ZpZXdFbGVtZW50LCBbQ0xBU1NOQU1FUy52aWV3XSk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVJlc2l6ZVRyaWdnZXIoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZWQgPT09IHRydWUpIHtcbiAgICAgIGNvbnNvbGUud2FybignY2FsbGluZyBvbiBhIGFscmVhZHktY3JlYXRlZCBvYmplY3QnKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmF1dG9zaG93KSB7XG4gICAgICBhZGRDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLmF1dG9zaG93XSk7XG4gICAgfVxuXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcblxuICAgIGlmICh0aGlzLmNyZWF0ZUVsZW1lbnRzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLl92aWV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHdoaWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fdmlld0VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudCk7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50KTtcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCk7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fdmlld0VsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92aWV3RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTTkFNRVMudmlldyk7XG4gICAgICB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnZlcnRpY2FsU2Nyb2xsYmFyLnNwbGl0KCcgJykuam9pbignLicpKTtcbiAgICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50ID0gdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NOQU1FUy50aHVtYik7XG4gICAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTTkFNRVMuaG9yaXpvbnRhbFNjcm9sbGJhci5zcGxpdCgnICcpLmpvaW4oJy4nKSk7XG4gICAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50ID0gdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnRodW1iKTtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLmVsZW1lbnRdKTtcbiAgICBhZGRDbGFzcyh0aGlzLl92aWV3RWxlbWVudCwgW0NMQVNTTkFNRVMudmlld10pO1xuICAgIGFkZENsYXNzKHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCwgQ0xBU1NOQU1FUy52ZXJ0aWNhbFNjcm9sbGJhci5zcGxpdCgvXFxzLykpO1xuICAgIGFkZENsYXNzKHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LCBDTEFTU05BTUVTLmhvcml6b250YWxTY3JvbGxiYXIuc3BsaXQoL1xccy8pKTtcbiAgICBhZGRDbGFzcyh0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudCwgW0NMQVNTTkFNRVMudGh1bWJdKTtcbiAgICBhZGRDbGFzcyh0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LCBbQ0xBU1NOQU1FUy50aHVtYl0pO1xuXG4gICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgICB0aGlzLl9jcmVhdGVSZXNpemVUcmlnZ2VyKCk7XG5cbiAgICB0aGlzLl9jcmVhdGVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzLl9iaW5kRXZlbnRzKCkudXBkYXRlKCk7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fY3JlYXRlUmVzaXplVHJpZ2dlciA9IGZ1bmN0aW9uIGNyZWF0ZVJlc2l6ZVRyaWdnZXIoKSB7XG4gICAgLy8gV2UgbmVlZCB0byBhcnJhbmdlIGZvciBzZWxmLnNjcm9sbGJhci51cGRhdGUgdG8gYmUgY2FsbGVkIHdoZW5ldmVyXG4gICAgLy8gdGhlIERPTSBpcyBjaGFuZ2VkIHJlc3VsdGluZyBpbiBhIHNpemUtY2hhbmdlIGZvciBvdXIgZGl2LiBUbyBtYWtlXG4gICAgLy8gdGhpcyBoYXBwZW4sIHdlIHVzZSBhIHRlY2huaXF1ZSBkZXNjcmliZWQgaGVyZTpcbiAgICAvLyBodHRwOi8vd3d3LmJhY2thbGxleWNvZGVyLmNvbS8yMDEzLzAzLzE4L2Nyb3NzLWJyb3dzZXItZXZlbnQtYmFzZWQtZWxlbWVudC1yZXNpemUtZGV0ZWN0aW9uLy5cbiAgICAvL1xuICAgIC8vIFRoZSBpZGVhIGlzIHRoYXQgd2UgY3JlYXRlIGFuIDxvYmplY3Q+IGVsZW1lbnQgaW4gb3VyIGRpdiwgd2hpY2ggd2VcbiAgICAvLyBhcnJhbmdlIHRvIGhhdmUgdGhlIHNhbWUgc2l6ZSBhcyB0aGF0IGRpdi4gVGhlIDxvYmplY3Q+IGVsZW1lbnRcbiAgICAvLyBjb250YWlucyBhIFdpbmRvdyBvYmplY3QsIHRvIHdoaWNoIHdlIGNhbiBhdHRhY2ggYW4gb25yZXNpemVcbiAgICAvLyBoYW5kbGVyLlxuICAgIC8vXG4gICAgLy8gKFJlYWN0IGFwcGVhcnMgdG8gZ2V0IHZlcnkgY29uZnVzZWQgYnkgdGhlIG9iamVjdCAod2UgZW5kIHVwIHdpdGhcbiAgICAvLyBDaHJvbWUgd2luZG93cyB3aGljaCBvbmx5IHNob3cgaGFsZiBvZiB0aGUgdGV4dCB0aGV5IGFyZSBzdXBwb3NlZFxuICAgIC8vIHRvKSwgc28gd2UgYWx3YXlzIGRvIHRoaXMgbWFudWFsbHkuKVxuXG4gICAgdmFyIG9iaiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIGFkZENsYXNzKG9iaiwgW0NMQVNTTkFNRVMucmVzaXplVHJpZ2dlcl0pO1xuICAgIG9iai50eXBlID0gJ3RleHQvaHRtbCc7XG4gICAgdmFyIHJlc2l6ZUhhbmRsZXIgPSB0aGlzLl9yZXNpemVIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgb2JqLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3aW4gPSBvYmouY29udGVudERvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUhhbmRsZXIpO1xuICAgIH07XG5cbiAgICAvL0lFOiBEb2VzIG5vdCBsaWtlIHRoYXQgdGhpcyBoYXBwZW5zIGJlZm9yZSwgZXZlbiBpZiBpdCBpcyBhbHNvIGFkZGVkIGFmdGVyLlxuICAgIGlmICghaXNJRSgpKSB7XG4gICAgICBvYmouZGF0YSA9ICdhYm91dDpibGFuayc7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG9iaik7XG5cbiAgICAvL0lFOiBUaGlzIG11c3Qgb2NjdXIgYWZ0ZXIgYWRkaW5nIHRoZSBvYmplY3QgdG8gdGhlIERPTS5cbiAgICBpZiAoaXNJRSgpKSB7XG4gICAgICBvYmouZGF0YSA9ICdhYm91dDpibGFuayc7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVzaXplVHJpZ2dlckVsZW1lbnQgPSBvYmo7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgaWYgKERPTlRfQ1JFQVRFX0dFTUlOSSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZWQgPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2NhbGxpbmcgb24gYSBub3QteWV0LWNyZWF0ZWQgb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl92aWV3RWxlbWVudC5zdHlsZS53aWR0aCA9ICgodGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoICsgU0NST0xMQkFSX1dJRFRIKS50b1N0cmluZygpICsgJ3B4Jyk7XG4gICAgdGhpcy5fdmlld0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKCh0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgU0NST0xMQkFSX1dJRFRIKS50b1N0cmluZygpICsgJ3B4Jyk7XG5cbiAgICB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWCA9IHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmNsaWVudFdpZHRoIC8gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsV2lkdGggKiB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWSA9IHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5jbGllbnRIZWlnaHQgLyB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxIZWlnaHQgKiB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fc2Nyb2xsVG9wTWF4ID0gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5fdmlld0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHRoaXMuX3Njcm9sbExlZnRNYXggPSB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxXaWR0aCAtIHRoaXMuX3ZpZXdFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgaWYgKHRoaXMuX25hdHVyYWxUaHVtYlNpemVZIDwgdGhpcy5taW5UaHVtYlNpemUpIHtcbiAgICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubWluVGh1bWJTaXplICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbFRvcE1heCkge1xuICAgICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fbmF0dXJhbFRodW1iU2l6ZVkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbmF0dXJhbFRodW1iU2l6ZVggPCB0aGlzLm1pblRodW1iU2l6ZSkge1xuICAgICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubWluVGh1bWJTaXplICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbExlZnRNYXgpIHtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWCArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2lkdGggPSAnMHB4JztcbiAgICB9XG5cbiAgICB0aGlzLl90aHVtYlNpemVZID0gdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHRoaXMuX3RodW1iU2l6ZVggPSB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgdGhpcy5fdHJhY2tUb3BNYXggPSB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gdGhpcy5fdGh1bWJTaXplWTtcbiAgICB0aGlzLl90cmFja0xlZnRNYXggPSB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aCAtIHRoaXMuX3RodW1iU2l6ZVg7XG5cbiAgICB0aGlzLl9zY3JvbGxIYW5kbGVyKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9yZXNpemVUcmlnZ2VyRWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX3Jlc2l6ZVRyaWdnZXJFbGVtZW50KTtcbiAgICAgIHRoaXMuX3Jlc2l6ZVRyaWdnZXJFbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoRE9OVF9DUkVBVEVfR0VNSU5JKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnNvbGUud2FybignY2FsbGluZyBvbiBhIG5vdC15ZXQtY3JlYXRlZCBvYmplY3QnKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3VuYmluRXZlbnRzKCk7XG5cbiAgICByZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLmVsZW1lbnQsIENMQVNTTkFNRVMuYXV0b3Nob3ddKTtcblxuICAgIGlmICh0aGlzLmNyZWF0ZUVsZW1lbnRzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50KTtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCk7XG4gICAgICB3aGlsZSh0aGlzLl92aWV3RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3ZpZXdFbGVtZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX3ZpZXdFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IG51bGw7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmdldFZpZXdFbGVtZW50ID0gZnVuY3Rpb24gZ2V0Vmlld0VsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdFbGVtZW50O1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2JpbmRFdmVudHMgPSBmdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuc2Nyb2xsSGFuZGxlciA9IHRoaXMuX3Njcm9sbEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRyYWNrSGFuZGxlciA9IHRoaXMuX2NsaWNrVmVydGljYWxUcmFja0hhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyID0gdGhpcy5fY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIgPSB0aGlzLl9jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlciA9IHRoaXMuX2NsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZVVwRG9jdW1lbnRIYW5kbGVyID0gdGhpcy5fbW91c2VVcERvY3VtZW50SGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIgPSB0aGlzLl9tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX3ZpZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2NhY2hlLmV2ZW50cy5zY3JvbGxIYW5kbGVyKTtcbiAgICB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUcmFja0hhbmRsZXIpO1xuICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja0hvcml6b250YWxUcmFja0hhbmRsZXIpO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyKTtcbiAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja0hvcml6b250YWxUaHVtYkhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9jYWNoZS5ldmVudHMubW91c2VVcERvY3VtZW50SGFuZGxlcik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl91bmJpbkV2ZW50cyA9IGZ1bmN0aW9uIF91bmJpbkV2ZW50cygpIHtcbiAgICB0aGlzLl92aWV3RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9jYWNoZS5ldmVudHMuc2Nyb2xsSGFuZGxlcik7XG4gICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlcik7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVGh1bWJIYW5kbGVyKTtcbiAgICB0aGlzLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlVXBEb2N1bWVudEhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fc2Nyb2xsSGFuZGxlciA9IGZ1bmN0aW9uIF9zY3JvbGxIYW5kbGVyKCkge1xuICAgIHZhciB4ID0gKHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbExlZnQgKiB0aGlzLl90cmFja0xlZnRNYXggLyB0aGlzLl9zY3JvbGxMZWZ0TWF4KSB8fCAwO1xuICAgIHZhciB5ID0gKHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFRvcCAqIHRoaXMuX3RyYWNrVG9wTWF4IC8gdGhpcy5fc2Nyb2xsVG9wTWF4KSB8fCAwO1xuXG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS5tc1RyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB4ICsgJ3B4KSc7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAncHgsIDAsIDApJztcbiAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgeCArICdweCwgMCwgMCknO1xuXG4gICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuc3R5bGUubXNUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgeSArICdweCknO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX3Jlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbiBfcmVzaXplSGFuZGxlcigpIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIGlmICh0aGlzLm9uUmVzaXplKSB7XG4gICAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgfVxuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrVmVydGljYWxUcmFja0hhbmRsZXIgPSBmdW5jdGlvbiBfY2xpY2tWZXJ0aWNhbFRyYWNrSGFuZGxlcihlKSB7XG4gICAgdmFyIG9mZnNldCA9IGUub2Zmc2V0WSAtIHRoaXMuX25hdHVyYWxUaHVtYlNpemVZICogLjVcbiAgICAgICwgdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgPSBvZmZzZXQgKiAxMDAgLyB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsVG9wID0gdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgKiB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxIZWlnaHQgLyAxMDA7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlcihlKSB7XG4gICAgdmFyIG9mZnNldCA9IGUub2Zmc2V0WCAtIHRoaXMuX25hdHVyYWxUaHVtYlNpemVYICogLjVcbiAgICAgICwgdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgPSBvZmZzZXQgKiAxMDAgLyB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbExlZnQgPSB0aHVtYlBvc2l0aW9uUGVyY2VudGFnZSAqIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFdpZHRoIC8gMTAwO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIgPSBmdW5jdGlvbiBfY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlcihlKSB7XG4gICAgdGhpcy5fc3RhcnREcmFnKGUpO1xuICAgIHRoaXMuX3ByZXZQYWdlWSA9IHRoaXMuX3RodW1iU2l6ZVkgLSBlLm9mZnNldFk7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fY2xpY2tIb3Jpem9udGFsVGh1bWJIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlcihlKSB7XG4gICAgdGhpcy5fc3RhcnREcmFnKGUpO1xuICAgIHRoaXMuX3ByZXZQYWdlWCA9IHRoaXMuX3RodW1iU2l6ZVggLSBlLm9mZnNldFg7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fc3RhcnREcmFnID0gZnVuY3Rpb24gX3N0YXJ0RHJhZyhlKSB7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gdHJ1ZTtcbiAgICBhZGRDbGFzcyhkb2N1bWVudC5ib2R5LCBbQ0xBU1NOQU1FUy5kaXNhYmxlXSk7XG4gICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlTW92ZURvY3VtZW50SGFuZGxlcik7XG4gICAgdGhpcy5fZG9jdW1lbnQub25zZWxlY3RzdGFydCA9IGZ1bmN0aW9uKCkge3JldHVybiBmYWxzZTt9O1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX21vdXNlVXBEb2N1bWVudEhhbmRsZXIgPSBmdW5jdGlvbiBfbW91c2VVcERvY3VtZW50SGFuZGxlcigpIHtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldlBhZ2VYID0gdGhpcy5fcHJldlBhZ2VZID0gMDtcbiAgICByZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCBbQ0xBU1NOQU1FUy5kaXNhYmxlXSk7XG4gICAgdGhpcy5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlTW92ZURvY3VtZW50SGFuZGxlcik7XG4gICAgdGhpcy5fZG9jdW1lbnQub25zZWxlY3RzdGFydCA9IG51bGw7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fbW91c2VNb3ZlRG9jdW1lbnRIYW5kbGVyID0gZnVuY3Rpb24gX21vdXNlTW92ZURvY3VtZW50SGFuZGxlcihlKSB7XG4gICAgaWYgKHRoaXMuX2N1cnNvckRvd24gPT09IGZhbHNlKSB7cmV0dXJuO31cblxuICAgIHZhciBvZmZzZXQsIHRodW1iQ2xpY2tQb3NpdGlvbjtcblxuICAgIGlmICh0aGlzLl9wcmV2UGFnZVkpIHtcbiAgICAgIG9mZnNldCA9IGUuY2xpZW50WSAtIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgICB0aHVtYkNsaWNrUG9zaXRpb24gPSB0aGlzLl90aHVtYlNpemVZIC0gdGhpcy5fcHJldlBhZ2VZO1xuXG4gICAgICB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9zY3JvbGxUb3BNYXggKiAob2Zmc2V0IC0gdGh1bWJDbGlja1Bvc2l0aW9uKSAvIHRoaXMuX3RyYWNrVG9wTWF4O1xuXG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2UGFnZVgpIHtcbiAgICAgIG9mZnNldCA9IGUuY2xpZW50WCAtIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgICB0aHVtYkNsaWNrUG9zaXRpb24gPSB0aGlzLl90aHVtYlNpemVYIC0gdGhpcy5fcHJldlBhZ2VYO1xuXG4gICAgICB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxMZWZ0ID0gdGhpcy5fc2Nyb2xsTGVmdE1heCAqIChvZmZzZXQgLSB0aHVtYkNsaWNrUG9zaXRpb24pIC8gdGhpcy5fdHJhY2tMZWZ0TWF4O1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHZW1pbmlTY3JvbGxiYXI7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LkdlbWluaVNjcm9sbGJhciA9IEdlbWluaVNjcm9sbGJhcjtcbiAgfVxufSkoKTtcbiIsIi8qXG4gKiBAbW9kdWxlIFRleHRHcmFkaWVudERlZmF1bHRcbiAqIHRleHQtZ3JhZGllbnQgdjAuMi4wXG4gKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LlRleHRHcmFkaWVudERlZmF1bHQgPSBmYWN0b3J5KCk7XG4gICAgfVxufShmdW5jdGlvbiBmYWN0b3J5KCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICByZXR1cm4ge1xuICAgICAgICBfX3dyYXBwZXJFbGVtZW50IDogbnVsbCxcblxuICAgICAgICAvKiBJbml0aWFsaXplLlxuICAgICAgICAgKiBAbWV0aG9kIF9pbml0IDxwcml2YXRlLCBhYnN0cmFjdD5cbiAgICAgICAgICovXG4gICAgICAgIF9pbml0IDogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAgICAgICB0aGlzLl9fd3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgICAgICAgICAgIHRoaXMuX2luY2x1ZGUodGhpcy5fX3dyYXBwZXJFbGVtZW50LnN0eWxlLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheSA6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgIGNvbG9yIDogdGhpcy5vcHRpb25zLmZhbGxiYWNrQ29sb3IgfHwgdGhpcy5vcHRpb25zLnRvLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQgOiAnLXdlYmtpdC1saW5lYXItZ3JhZGllbnQoJyArIHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gKyAnLCAnICsgdGhpcy5vcHRpb25zLnRvICsgJywnICsgdGhpcy5vcHRpb25zLmZyb20gKyAnKScsXG4gICAgICAgICAgICAgICAgd2Via2l0QmFja2dyb3VuZENsaXAgOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgd2Via2l0VGV4dEZpbGxDb2xvciA6ICd0cmFuc3BhcmVudCdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRleHQodGhpcy5vcHRpb25zLnRleHQpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX193cmFwcGVyRWxlbWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogSW1wbGVtZW50YXRpb24gdG8gdXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnRzIG9mIHRoaXMuZWxlbWVudCBrZWVwaW5nIHRoZSBncmFkaWVudCBpbnRhY3QuXG4gICAgICAgICAqIEBtZXRob2QgdXBkYXRlVGV4dCA8cHVibGljLCBhYnN0cmFjdD4gW0Z1bmN0aW9uXVxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlVGV4dCA6IGZ1bmN0aW9uIHVwZGF0ZVRleHQodGV4dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1RleHRHcmFkaWVudDogY2FsbGluZyBvbiBkZXN0cm95ZWQgb2JqZWN0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy50ZXh0ID0gdGV4dDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiBJbXBsZW1lbnRhdGlvbiB0byByZW1vdmUgdGhlIGdyYWRpZW50IGFuZCBjcmVhdGVkIGVsZW1lbnRzLlxuICAgICAgICAgKiBAbWV0aG9kIGRlc3Ryb3kgPHB1YmxpYywgYWJzdHJhY3Q+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3kgOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1RleHRHcmFkaWVudDogY2FsbGluZyBvbiBkZXN0cm95ZWQgb2JqZWN0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fX3dyYXBwZXJFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG59KSk7XG4iLCIvKlxuICogQG1vZHVsZSBUZXh0R3JhZGllbnRTVkdcbiAqIHRleHQtZ3JhZGllbnQgdjAuMi4wXG4gKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7ICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5UZXh0R3JhZGllbnRTVkcgPSBmYWN0b3J5KCk7XG4gICAgfVxufShmdW5jdGlvbiBmYWN0b3J5KCkgeyAndXNlIHN0cmljdCc7XG4gICAgIHJldHVybiB7XG4gICAgICAgIF9fd3JhcHBlckVsZW1lbnQgOiBudWxsLFxuICAgICAgICBfX3RleHRFbGVtZW50IDogbnVsbCxcbiAgICAgICAgX19tYXNrZWRDbG9uZSA6IG51bGwsXG5cbiAgICAgICAgLyogSW5pdGlhbGl6ZS5cbiAgICAgICAgICogQG1ldGhvZCBfaW5pdCA8cHJpdmF0ZSwgYWJzdHJhY3Q+XG4gICAgICAgICAqL1xuICAgICAgICBfaW5pdCA6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICAgICAgdGhpcy5fX3dyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGhpcy5fX3RleHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbmNsdWRlKHRoaXMuX193cmFwcGVyRWxlbWVudC5zdHlsZSwge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uIDogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5IDogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgY29sb3IgOiB0aGlzLm9wdGlvbnMuZmFsbGJhY2tDb2xvciB8fCB0aGlzLm9wdGlvbnMudG8sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fX2NyZWF0ZUdyYWRpZW50KCk7XG4gICAgICAgICAgICB0aGlzLl9fY3JlYXRlTWFza2VkQ2xvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fdGV4dEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRleHQodGhpcy5vcHRpb25zLnRleHQpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX193cmFwcGVyRWxlbWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogQ3JlYXRlcyB0aGUgU1ZHIE1hc2sgYW5kIEdyYWRpZW50IHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50LlxuICAgICAgICAgKiBAbWV0aG9kIF9fY3JlYXRlR3JhZGllbnQgPHByaXZhdGU+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIF9fY3JlYXRlR3JhZGllbnQgOiBmdW5jdGlvbiBfX2NyZWF0ZUdyYWRpZW50KCkge1xuICAgICAgICAgICAgdmFyIHN2Z01hc2tTdHJpbmcgPSBcIlwiICtcbiAgICAgICAgICAgICAgICBcIjxtYXNrIGlkPSd0Zy1tYXNrLVwiICsgdGhpcy5faWQgK1wiJyAgbWFza0NvbnRlbnRVbml0cz0nb2JqZWN0Qm91bmRpbmdCb3gnPlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8bGluZWFyR3JhZGllbnQgaWQ9J3RnLWxpbmVhci1cIisgdGhpcy5faWQgK1wiJyB7Y29vcmRzfT5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxzdG9wIHN0b3AtY29sb3I9J3doaXRlJyBvZmZzZXQ9JzAnLz5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxzdG9wIHN0b3AtY29sb3I9J3doaXRlJyBzdG9wLW9wYWNpdHk9JzAnIG9mZnNldD0nMScvPlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8L2xpbmVhckdyYWRpZW50PlwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8cmVjdCB4PScwJyB5PScwJyB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPSd1cmwoI3RnLWxpbmVhci1cIisgdGhpcy5faWQgK1wiKScvPlwiICtcbiAgICAgICAgICAgICAgICBcIjwvbWFzaz5cIjtcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0b3AnOiBzdmdNYXNrU3RyaW5nID0gc3ZnTWFza1N0cmluZy5yZXBsYWNlKC97Y29vcmRzfS8sIFwieDE9JzAnIHgyPScwJyB5MT0nMScgeTI9JzAnXCIpOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOiBzdmdNYXNrU3RyaW5nID0gc3ZnTWFza1N0cmluZy5yZXBsYWNlKC97Y29vcmRzfS8sIFwieDE9JzAnIHgyPScwJyB5MT0nMCcgeTI9JzEnXCIpOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0Jzogc3ZnTWFza1N0cmluZyA9IHN2Z01hc2tTdHJpbmcucmVwbGFjZSgve2Nvb3Jkc30vLCBcIngxPScxJyB4Mj0nMCcgeTE9JzAnIHkyPScwJ1wiKTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogc3ZnTWFza1N0cmluZyA9IHN2Z01hc2tTdHJpbmcucmVwbGFjZSgve2Nvb3Jkc30vLCBcIngxPScwJyB4Mj0nMScgeTE9JzAnIHkyPScwJ1wiKTsgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N2Z0RlZnNDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgc3ZnTWFza1N0cmluZyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogQ3JlYXRlcyBhIG5ldyBlbGVtZW50IHRvIGFwcGx5IHRoZSBtYXNraW5nLlxuICAgICAgICAgKiBAbWV0aG9kIF9fY3JlYXRlTWFza2VkQ2xvbmUgPHByaXZhdGU+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIF9fY3JlYXRlTWFza2VkQ2xvbmUgOiBmdW5jdGlvbiBfX2NyZWF0ZU1hc2tlZENsb25lKCkge1xuICAgICAgICAgICAgdGhpcy5fX21hc2tlZENsb25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbmNsdWRlKHRoaXMuX19tYXNrZWRDbG9uZS5zdHlsZSwge1xuICAgICAgICAgICAgICAgIG1hc2sgOiAndXJsKCN0Zy1tYXNrLScgKyB0aGlzLl9pZCArJyknLFxuICAgICAgICAgICAgICAgIGNvbG9yIDogdGhpcy5vcHRpb25zLmZyb20sXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgIGxlZnQgOiAwLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fbWFza2VkQ2xvbmUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIEltcGxlbWVudGF0aW9uIHRvIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50cyBvZiB0aGlzLmVsZW1lbnQga2VlcGluZyB0aGUgZ3JhZGllbnQgaW50YWN0LlxuICAgICAgICAgKiBAbWV0aG9kIHVwZGF0ZVRleHQgPHB1YmxpYywgYWJzdHJhY3Q+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVRleHQgOiBmdW5jdGlvbiB1cGRhdGVUZXh0KHRleHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdUZXh0R3JhZGllbnQ6IGNhbGxpbmcgb24gZGVzdHJveWVkIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGV4dCA9IHRleHQ7XG4gICAgICAgICAgICB0aGlzLl9fdGV4dEVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgdGhpcy5fX21hc2tlZENsb25lLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgIH0sXG5cbiAgICAgICAgLyogSW1wbGVtZW50YXRpb24gdG8gcmVtb3ZlIHRoZSBncmFkaWVudCBhbmQgY3JlYXRlZCBlbGVtZW50cy5cbiAgICAgICAgICogQG1ldGhvZCBkZXN0cm95IDxwdWJsaWMsIGFic3RyYWN0PiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95IDogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdUZXh0R3JhZGllbnQ6IGNhbGxpbmcgb24gZGVzdHJveWVkIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3ZnTWFza0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGctbWFzay0nICsgdGhpcy5faWQpO1xuICAgICAgICAgICAgdGhpcy5fc3ZnRGVmc0NvbnRhaW5lci5yZW1vdmVDaGlsZChzdmdNYXNrRWxlbWVudCk7XG5cbiAgICAgICAgICAgIHdoaWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fX3dyYXBwZXJFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX190ZXh0RWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9fbWFza2VkQ2xvbmUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc3ZnRGVmc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgIH07XG59KSk7XG4iLCIvKipcbiAqIHRleHQtZ3JhZGllbnQgdjAuMi4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbm9lbGRlbGdhZG8vdGV4dC1ncmFkaWVudFxuICogTGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgICAgICByZXF1aXJlKCcuL3RleHQtZ3JhZGllbnQtZGVmYXVsdCcpLFxuICAgICAgICAgICAgcmVxdWlyZSgnLi90ZXh0LWdyYWRpZW50LXN2ZycpXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LlRleHRHcmFkaWVudCA9IGZhY3RvcnkoXG4gICAgICAgICAgICB3aW5kb3cuVGV4dEdyYWRpZW50RGVmYXVsdCxcbiAgICAgICAgICAgIHdpbmRvdy5UZXh0R3JhZGllbnRTVkdcbiAgICAgICAgKTtcbiAgICB9XG59KGZ1bmN0aW9uIGZhY3RvcnkoVGV4dEdyYWRpZW50RGVmYXVsdCwgVGV4dEdyYWRpZW50U1ZHKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFRleHRHcmFkaWVudC52ZXJzaW9uID0gJzAuMi4wJztcblxuICAgIC8qIEluc3RhbmNlcyBpZCBjb3VudGVyLCBpbmNyZWFzZWQgYnkgdGhlIGNvbnN0cnVjdG9yIENsYXNzLlxuICAgICAqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyBmb3IgdGhlIFNWRyBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKiBAcHJvcGVydHkgX2lkIDxwcm90ZWN0ZWQsIHN0YXRpYz4gW051bWJlcl1cbiAgICAgKi9cbiAgICBUZXh0R3JhZGllbnQuX2lkID0gMDtcblxuICAgIC8qIEhvbGRzIHRoZSBpbXBsZW1lbnRhdGlvbiBPYmplY3QgdG8gYmUgaW5jbHVkZWQgdG8gdGhlIG1haW4gQ2xhc3MuXG4gICAgICogQHByb3BlcnR5IF9pbXBsZW1lbnRhdGlvbiA8cHJvdGVjdGVkLCBzdGF0aWM+IFtPYmplY3RdIFRleHRHcmFkaWVudERlZmF1bHRcbiAgICAgKi9cbiAgICBUZXh0R3JhZGllbnQuX2ltcGxlbWVudGF0aW9uID0gVGV4dEdyYWRpZW50RGVmYXVsdDtcblxuICAgIC8qIENoZWNrcyBpZiB0aGUgaW1wbGVtZW50YXRpb24gbmVlZHMgdG8gYmUgY2hhbmdlZC5cbiAgICAgKiBAbWV0aG9kIF91cGRhdGVJbXBsZW1lbnRhdGlvbiA8cHJvdGVjdGVkLCBzdGF0aWM+IFtGdW5jdGlvbl1cbiAgICAgKi9cbiAgICBUZXh0R3JhZGllbnQuX3VwZGF0ZUltcGxlbWVudGF0aW9uID0gZnVuY3Rpb24gX3VwZGF0ZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICBpZiAoKCdXZWJraXRUZXh0RmlsbENvbG9yJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5faW1wbGVtZW50YXRpb24gPSBUZXh0R3JhZGllbnRTVkc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIFwiPHN2ZyBpZD0ndGctc3ZnLWNvbnRhaW5lcicgaGVpZ2h0PScwJyB3aWR0aD0nMCcgc3R5bGU9J3Bvc2l0aW9uOmFic29sdXRlJz48ZGVmcz48L2RlZnM+PC9zdmc+XCIpO1xuICAgICAgICAgICAgdGhpcy5fc3ZnRGVmc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0Zy1zdmctY29udGFpbmVyJykuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RlZnMnKVswXTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBUZXh0R3JhZGllbnQuX3N2Z0RlZnNDb250YWluZXIgPSBudWxsO1xuXG4gICAgLyogTWVyZ2UgdGhlIGNvbnRlbnRzIG9mIHR3byBvciBtb3JlIG9iamVjdHMgdG9nZXRoZXIgaW50byB0aGUgZmlyc3Qgb2JqZWN0LlxuICAgICAqIEBoZWxwZXIgX2luY2x1ZGUgPHByaXZhdGU+IFtGdW5jdGlvbl1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfaW5jbHVkZShhLCBiKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eTtcbiAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBiKSB7XG4gICAgICAgICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBhW3Byb3BlcnR5XSA9IGJbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIC8qIE1haW4gQ2xhc3MuIEhvbGRzIHRoZSBiZWhhdmlvdXIgdGhhdCBjYW4gcnVuIG9uIGFsbCBpbXBsZW1lbnRhdGlvbnMuXG4gICAgICogVGhpcyBjbGFzcyBhbGxvd3MgdG8gZXh0ZW5kIHRoZSBiZWhhdmlvciB0aHJvdWdoIGEgc3RyYXRlZ3kgb2YgbW9kdWxlIGluY2x1c2lvbi5cbiAgICAgKiBUaGF0IGlzIHRoYXQgb25jZSBmZWF0dXJlIHN1cHBvcnQgaXMgZGV0ZXJtaW5lZCwgdGhlIG1vZHVsZSB0aGF0IGhvbGRzIHRoZSBzcGVjaWZpYyBiZWhhdmlvdXIgaXMgaW5jbHVkZWQgaW50byB0aGUgY2xhc3MuXG4gICAgICogQGFyZ3VtZW50IGVsZW1lbnQgPHJlcXVpcmVkPiBbTm9kZUVsZW1lbnRdICh1bmRlZmluZWQpIEVsZW1lbnQgdG8gYXBwbHkgdGhlIHRleHQgZ3JhZGllbnQgZWZmZWN0LlxuICAgICAqIEBhcmd1bWVudCBvcHRpb25zIDxvcHRpb25hbD4gW09iamVjdF0gKHNlZSBkZWZhdWx0cykgR3JhZGllbnQgY29sb3Itc3RvcHMsIGdyYWRpZW50LWRpcmVjdGlvbiwgdGV4dC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBUZXh0R3JhZGllbnQoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICAgIGlmICgoZWxlbWVudC5ub2RlVHlwZSA+IDApID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0R3JhZGllbnQgW2NvbnN0cnVjdG9yXTogXCJlbGVtZW50XCIgcGFyYW0gc2hvdWxkIGJlIGEgTm9kZUVsZW1lbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5faWQgPSBUZXh0R3JhZGllbnQuX2lkKys7XG4gICAgICAgIHRoaXMuX3N2Z0RlZnNDb250YWluZXIgPSBUZXh0R3JhZGllbnQuX3N2Z0RlZnNDb250YWluZXI7XG4gICAgICAgIHRoaXMuX2luY2x1ZGUgPSBfaW5jbHVkZTtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfaW5jbHVkZSh7XG4gICAgICAgICAgICB0ZXh0IDogdGhpcy5lbGVtZW50LnRleHRDb250ZW50LFxuICAgICAgICAgICAgZnJvbSA6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICB0byA6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICBkaXJlY3Rpb24gOiAncmlnaHQnLFxuICAgICAgICAgICAgZmFsbGJhY2tDb2xvciA6ICcnXG4gICAgICAgIH0sIGNvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBUZXh0R3JhZGllbnQucHJvdG90eXBlID0ge1xuICAgICAgICBfZGVzdHJveWVkIDogZmFsc2UsXG5cbiAgICAgICAgLyogSW5pdGlhbGl6ZS5cbiAgICAgICAgICogQWxsIGltcGxlbWVudGF0aW9ucyBzaG91bGQgaW5jbHVkZSB0aGlzIG1ldGhvZC5cbiAgICAgICAgICogQG1ldGhvZCBfaW5pdCA8cHJpdmF0ZSwgYWJzdHJhY3Q+XG4gICAgICAgICAqL1xuICAgICAgICBfaW5pdCA6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0R3JhZGllbnQucHJvdG90eXBlLl9pbml0IG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIEltcGxlbWVudGF0aW9uIHRvIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50cyBvZiB0aGlzLmVsZW1lbnQga2VlcGluZyB0aGUgZ3JhZGllbnQgaW50YWN0LlxuICAgICAgICAgKiBBbGwgaW1wbGVtZW50YXRpb25zIHNob3VsZCBpbmNsdWRlIHRoaXMgbWV0aG9kLlxuICAgICAgICAgKiBAbWV0aG9kIHVwZGF0ZVRleHQgPHB1YmxpYywgYWJzdHJhY3Q+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVRleHQgOiBmdW5jdGlvbiB1cGRhdGVUZXh0KCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0R3JhZGllbnQucHJvdG90eXBlLnVwZGF0ZSBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiBJbXBsZW1lbnRhdGlvbiB0byByZW1vdmUgdGhlIGdyYWRpZW50IGFuZCBjcmVhdGVkIGVsZW1lbnRzLlxuICAgICAgICAgKiBBbGwgaW1wbGVtZW50YXRpb25zIHNob3VsZCBpbmNsdWRlIHRoaXMgbWV0aG9kLlxuICAgICAgICAgKiBAbWV0aG9kIGRlc3Ryb3kgPHB1YmxpYywgYWJzdHJhY3Q+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIGRlc3Ryb3kgOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0R3JhZGllbnQucHJvcGVydGllcy5kZXN0cm95IG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIFNldHMgdGhlIGltcGxlbWVudGF0aW9uIGFuZCBpbmNsdWRlcyBpdHMgbWV0aG9kcy9wcm9wZXJ0aWVzICovXG4gICAgVGV4dEdyYWRpZW50Ll91cGRhdGVJbXBsZW1lbnRhdGlvbigpO1xuICAgIF9pbmNsdWRlKFRleHRHcmFkaWVudC5wcm90b3R5cGUsIFRleHRHcmFkaWVudC5faW1wbGVtZW50YXRpb24pO1xuXG4gICAgcmV0dXJuIFRleHRHcmFkaWVudDtcbn0pKTtcbiIsIi8qKlxuICogc2hhcmUtdXJsIHYxLjAuMFxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZWxkZWxnYWRvL3NoYXJlLXVybFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJvb3QpO1xuICAgIGVsc2Ugcm9vdC5TaGFyZVVybCA9IGZhY3Rvcnkocm9vdCk7XG59KHRoaXMsIGZ1bmN0aW9uIGZhY3Rvcnkocm9vdCkge1xuICAgIHZhciBFTkRQT0lOVFMgPSB7XG4gICAgICAgIGZhY2Vib29rICAgIDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD8nLFxuICAgICAgICB0d2l0dGVyICAgICA6ICdodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlPycsXG4gICAgICAgIGdvb2dsZVBsdXMgIDogJ2h0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlPycsXG4gICAgICAgIHBpbnRlcmVzdCAgIDogJ2h0dHBzOi8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/JyxcbiAgICAgICAgcmVkZGl0ICAgICAgOiAnaHR0cDovL3d3dy5yZWRkaXQuY29tL3N1Ym1pdD8nLFxuICAgICAgICBkZWxpY2lvdXMgICA6ICdodHRwczovL2RlbGljaW91cy5jb20vc2F2ZT8nLFxuICAgICAgICBsaW5rZWRpbiAgICA6ICdodHRwczovL3d3dy5saW5rZWRpbi5jb20vc2hhcmVBcnRpY2xlPydcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZmFjZWJvb2sgICAgOiBmYWNlYm9vayxcbiAgICAgICAgdHdpdHRlciAgICAgOiB0d2l0dGVyLFxuICAgICAgICBnb29nbGVQbHVzICA6IGdvb2dsZVBsdXMsXG4gICAgICAgIHBpbnRlcmVzdCAgIDogcGludGVyZXN0LFxuICAgICAgICByZWRkaXQgICAgICA6IHJlZGRpdCxcbiAgICAgICAgZGVsaWNpb3VzICAgOiBkZWxpY2lvdXMsXG4gICAgICAgIGxpbmtlZGluICAgIDogbGlua2VkaW4sXG4gICAgICAgIGVtYWlsICAgICAgIDogZW1haWxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGEgfHwge30pLm1hcChmdW5jdGlvbihwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eU5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQoZGF0YVtwcm9wZXJ0eU5hbWVdKTtcbiAgICAgICAgfSkuam9pbignJicpO1xuICAgIH1cblxuICAgIC8qIENvbXBvc2UgdGhlIHNoYXJlIG9uIGZhY2Vib29rIHVybCBzdHJpbmcuXG4gICAgICogQGFyZ3VtZW50IGRhdGEgW09iamVjdF0gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnUgW1N0cmluZ10gPHJlcXVpcmVkPlxuICAgICAqIEByZXR1cm4gdXJsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmFjZWJvb2soZGF0YSkge1xuICAgICAgICByZXR1cm4gRU5EUE9JTlRTLmZhY2Vib29rICsgX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpO1xuICAgIH1cblxuICAgIC8qIENvbXBvc2UgdGhlIHNoYXJlIG9uIHR3aXR0ZXIgdXJsIHN0cmluZy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudGV4dCBbU3RyaW5nXSA8b3B0aW9uYWw+IFByZS1wb3B1bGF0ZWQgdGV4dCBoaWdobGlnaHRlZCBpbiB0aGUgVHdlZXQgY29tcG9zZXIuXG4gICAgICogQGFyZ3VtZW50IGRhdGEuaW5fcmVwbHlfdG8gW1N0cmluZ10gPG9wdGlvbmFsPiBTdGF0dXMgSUQgc3RyaW5nIG9mIGEgcGFyZW50IFR3ZWV0IHN1Y2ggYXMgYSBUd2VldCBmcm9tIHlvdXIgYWNjb3VudCAoaWYgYXBwbGljYWJsZSkuXG4gICAgICogQGFyZ3VtZW50IGRhdGEudXJsIFtTdHJpbmddIDxvcHRpb25hbD4gVVJMIGluY2x1ZGVkIHdpdGggdGhlIFR3ZWV0LlxuICAgICAqIEBhcmd1bWVudCBkYXRhLmhhc2h0YWdzIFtTdHJpbmddIDxvcHRpb25hbD4gQSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBoYXNodGFncyB0byBiZSBhcHBlbmRlZCB0byBkZWZhdWx0IFR3ZWV0IHRleHQuXG4gICAgICogQGFyZ3VtZW50IGRhdGEudmlhIFtTdHJpbmddIDxvcHRpb25hbD4gQXR0cmlidXRlIHRoZSBzb3VyY2Ugb2YgYSBUd2VldCB0byBhIFR3aXR0ZXIgdXNlcm5hbWUuXG4gICAgICogQGFyZ3VtZW50IGRhdGEucmVsYXRlZCBbU3RyaW5nXSA8b3B0aW9uYWw+IEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgYWNjb3VudHMgcmVsYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgc2hhcmVkIFVSSS5cbiAgICAgKiBAaW5mbyBodHRwczovL2Rldi50d2l0dGVyLmNvbS93ZWIvdHdlZXQtYnV0dG9uL3BhcmFtZXRlcnNcbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHR3aXR0ZXIoZGF0YSkge1xuICAgICAgICByZXR1cm4gRU5EUE9JTlRTLnR3aXR0ZXIgKyBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgfVxuXG4gICAgLyogQ29tcG9zZSB0aGUgc2hhcmUgb24gZ29vZ2xlKyB1cmwgc3RyaW5nLlxuICAgICAqIEBhcmd1bWVudCBkYXRhIFtPYmplY3RdIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS51cmwgW1N0cmluZ10gPHJlcXVpcmVkPiBUaGUgVVJMIG9mIHRoZSBwYWdlIHRvIHNoYXJlLlxuICAgICAqIEBpbmZvIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tLysvd2ViL3NoYXJlL1xuICAgICAqIEByZXR1cm4gdXJsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ29vZ2xlUGx1cyhkYXRhKSB7XG4gICAgICAgIHJldHVybiBFTkRQT0lOVFMuZ29vZ2xlUGx1cyArIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSBzaGFyZSBvbiBwaW50ZXJlc3QgdXJsIHN0cmluZy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudXJsIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS5tZWRpYSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEuZGVzY3JpcHRpb24gPHJlcXVpcmVkPlxuICAgICAqIEBpbmZvIGh0dHBzOi8vZGV2ZWxvcGVycy5waW50ZXJlc3QuY29tL3Bpbl9pdC9cbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBpbnRlcmVzdChkYXRhKSB7XG4gICAgICAgIHJldHVybiBFTkRQT0lOVFMucGludGVyZXN0ICsgX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpO1xuICAgIH1cblxuICAgIC8qIENvbXBvc2UgdGhlIHN1Ym1pdCB0byByZWRkaXQgdXJsIHN0cmluZy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudXJsIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS50aXRsZSA8b3B0aW9uYWw+XG4gICAgICogQGluZm8gaHR0cDovL3d3dy5yZWRkaXQuY29tL2J1dHRvbnMvXG4gICAgICogQHJldHVybiB1cmxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWRkaXQoZGF0YSkge1xuICAgICAgICByZXR1cm4gRU5EUE9JTlRTLnJlZGRpdCArIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSB1cmwgc3RyaW5nIHRvIHBvc3Qgb24gZGVsaWNpb3VzLlxuICAgICAqIEBhcmd1bWVudCBkYXRhIFtPYmplY3RdIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgdXJsIFtTdHJpbmddIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgdGl0bGUgW1N0cmluZ10gPG9wdGlvbmFsPlxuICAgICAqIEBpbmZvIGh0dHBzOi8vZGVsaWNpb3VzLmNvbS90b29sc1xuICAgICAqIEByZXR1cm4gdXJsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVsaWNpb3VzKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEVORFBPSU5UUy5kZWxpY2lvdXMgKyBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgfVxuXG4gICAgLyogQ29tcG9zZSB0aGUgc2hhcmUgYXJ0aWNsZSBvbiBsaW5rZWRpbiB1cmwgc3RyaW5nLlxuICAgICAqIEBhcmd1bWVudCBkYXRhIFtPYmplY3RdIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS51cmwgW1N0cmluZywgMTAyNF0gPHJlcXVpcmVkPiBUaGUgdXJsLWVuY29kZWQgVVJMIG9mIHRoZSBwYWdlIHRoYXQgeW91IHdpc2ggdG8gc2hhcmUuXG4gICAgICogQGFyZ3VtZW50IGRhdGEubWluaSBbQm9vbGVhbl0gPHJlcXVpcmVkPiBBIHJlcXVpcmVkIGFyZ3VtZW50IHdobydzIHZhbHVlIG11c3QgYWx3YXlzIGJlOiB0cnVlXG4gICAgICogQGFyZ3VtZW50IHRpdGxlIFtTdHJpbmcsIDIwMF0gPG9wdGlvbmFsPiBUaGUgdXJsLWVuY29kZWQgdGl0bGUgdmFsdWUgdGhhdCB5b3Ugd2lzaCB5b3UgdXNlLlxuICAgICAqIEBhcmd1bWVudCBzdW1tYXJ5IFtTdHJpbmcsIDI1Nl0gPG9wdGlvbmFsPiBUaGUgdXJsLWVuY29kZWQgZGVzY3JpcHRpb24gdGhhdCB5b3Ugd2lzaCB5b3UgdXNlLlxuICAgICAqIEBhcmd1bWVudCBzb3VyY2UgW1N0cmluZywgMjAwXSA8b3B0aW9uYWw+IFRoZSB1cmwtZW5jb2RlZCBzb3VyY2Ugb2YgdGhlIGNvbnRlbnQgKGUuZy4geW91ciB3ZWJzaXRlIG9yIGFwcGxpY2F0aW9uIG5hbWUpXG4gICAgICogQGluZm8gaHR0cHM6Ly9kZXZlbG9wZXIubGlua2VkaW4uY29tL2RvY3Mvc2hhcmUtb24tbGlua2VkaW5cbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxpbmtlZGluKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEVORFBPSU5UUy5saW5rZWRpbiArIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSBzZW5kIGVtYWlsIHVybCBzdHJpbmcuXG4gICAgICogQGFyZ3VtZW50IGRhdGEgW09iamVjdF0gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCB0byBbU3RyaW5nXSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IHN1YmplY3QgW1N0cmluZ10gPG9wdGlvbmFsPlxuICAgICAqIEBhcmd1bWVudCBjYyBbU3RyaW5nXSA8b3B0aW9uYWw+XG4gICAgICogQGFyZ3VtZW50IGJjYyBbU3RyaW5nXSA8b3B0aW9uYWw+XG4gICAgICogQGFyZ3VtZW50IGJvZHkgW1N0cmluZ10gPG9wdGlvbmFsPlxuICAgICAqIEBpbmZvIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0d1aWRlL0hUTUwvRW1haWxfbGlua3NcbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtYWlsKGRhdGEpIHtcbiAgICAgICAgdmFyIHRvID0gZGF0YS50bztcbiAgICAgICAgZGVsZXRlIGRhdGEudG87XG4gICAgICAgIHZhciBwYXJhbXMgPSBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgICAgIHJldHVybiAnbWFpbHRvOicgKyAocGFyYW1zLmxlbmd0aCA/ICh0byArICc/JyArIHBhcmFtcykgOiB0byk7XG4gICAgfVxufSkpO1xuIiwiLyoqXG4gKiBUd2Vlbi5qcyAtIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3R3ZWVuanMvdHdlZW4uanNcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3ZWVuanMvdHdlZW4uanMvZ3JhcGhzL2NvbnRyaWJ1dG9ycyBmb3IgdGhlIGZ1bGwgbGlzdCBvZiBjb250cmlidXRvcnMuXG4gKiBUaGFuayB5b3UgYWxsLCB5b3UncmUgYXdlc29tZSFcbiAqL1xuXG52YXIgVFdFRU4gPSBUV0VFTiB8fCAoZnVuY3Rpb24gKCkge1xuXG5cdHZhciBfdHdlZW5zID0gW107XG5cblx0cmV0dXJuIHtcblxuXHRcdGdldEFsbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRyZXR1cm4gX3R3ZWVucztcblxuXHRcdH0sXG5cblx0XHRyZW1vdmVBbGw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0X3R3ZWVucyA9IFtdO1xuXG5cdFx0fSxcblxuXHRcdGFkZDogZnVuY3Rpb24gKHR3ZWVuKSB7XG5cblx0XHRcdF90d2VlbnMucHVzaCh0d2Vlbik7XG5cblx0XHR9LFxuXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbiAodHdlZW4pIHtcblxuXHRcdFx0dmFyIGkgPSBfdHdlZW5zLmluZGV4T2YodHdlZW4pO1xuXG5cdFx0XHRpZiAoaSAhPT0gLTEpIHtcblx0XHRcdFx0X3R3ZWVucy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbiAodGltZSwgcHJlc2VydmUpIHtcblxuXHRcdFx0aWYgKF90d2VlbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHR0aW1lID0gdGltZSAhPT0gdW5kZWZpbmVkID8gdGltZSA6IFRXRUVOLm5vdygpO1xuXG5cdFx0XHR3aGlsZSAoaSA8IF90d2VlbnMubGVuZ3RoKSB7XG5cblx0XHRcdFx0aWYgKF90d2VlbnNbaV0udXBkYXRlKHRpbWUpIHx8IHByZXNlcnZlKSB7XG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF90d2VlbnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cdH07XG5cbn0pKCk7XG5cblxuLy8gSW5jbHVkZSBhIHBlcmZvcm1hbmNlLm5vdyBwb2x5ZmlsbC5cbi8vIEluIG5vZGUuanMsIHVzZSBwcm9jZXNzLmhydGltZS5cbmlmICh0eXBlb2YgKHdpbmRvdykgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAocHJvY2VzcykgIT09ICd1bmRlZmluZWQnKSB7XG5cdFRXRUVOLm5vdyA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdGltZSA9IHByb2Nlc3MuaHJ0aW1lKCk7XG5cblx0XHQvLyBDb252ZXJ0IFtzZWNvbmRzLCBuYW5vc2Vjb25kc10gdG8gbWlsbGlzZWNvbmRzLlxuXHRcdHJldHVybiB0aW1lWzBdICogMTAwMCArIHRpbWVbMV0gLyAxMDAwMDAwO1xuXHR9O1xufVxuLy8gSW4gYSBicm93c2VyLCB1c2Ugd2luZG93LnBlcmZvcm1hbmNlLm5vdyBpZiBpdCBpcyBhdmFpbGFibGUuXG5lbHNlIGlmICh0eXBlb2YgKHdpbmRvdykgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJlxuXHRcdCB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQpIHtcblx0Ly8gVGhpcyBtdXN0IGJlIGJvdW5kLCBiZWNhdXNlIGRpcmVjdGx5IGFzc2lnbmluZyB0aGlzIGZ1bmN0aW9uXG5cdC8vIGxlYWRzIHRvIGFuIGludm9jYXRpb24gZXhjZXB0aW9uIGluIENocm9tZS5cblx0VFdFRU4ubm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHdpbmRvdy5wZXJmb3JtYW5jZSk7XG59XG4vLyBVc2UgRGF0ZS5ub3cgaWYgaXQgaXMgYXZhaWxhYmxlLlxuZWxzZSBpZiAoRGF0ZS5ub3cgIT09IHVuZGVmaW5lZCkge1xuXHRUV0VFTi5ub3cgPSBEYXRlLm5vdztcbn1cbi8vIE90aGVyd2lzZSwgdXNlICduZXcgRGF0ZSgpLmdldFRpbWUoKScuXG5lbHNlIHtcblx0VFdFRU4ubm93ID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0fTtcbn1cblxuXG5UV0VFTi5Ud2VlbiA9IGZ1bmN0aW9uIChvYmplY3QpIHtcblxuXHR2YXIgX29iamVjdCA9IG9iamVjdDtcblx0dmFyIF92YWx1ZXNTdGFydCA9IHt9O1xuXHR2YXIgX3ZhbHVlc0VuZCA9IHt9O1xuXHR2YXIgX3ZhbHVlc1N0YXJ0UmVwZWF0ID0ge307XG5cdHZhciBfZHVyYXRpb24gPSAxMDAwO1xuXHR2YXIgX3JlcGVhdCA9IDA7XG5cdHZhciBfcmVwZWF0RGVsYXlUaW1lO1xuXHR2YXIgX3lveW8gPSBmYWxzZTtcblx0dmFyIF9pc1BsYXlpbmcgPSBmYWxzZTtcblx0dmFyIF9yZXZlcnNlZCA9IGZhbHNlO1xuXHR2YXIgX2RlbGF5VGltZSA9IDA7XG5cdHZhciBfc3RhcnRUaW1lID0gbnVsbDtcblx0dmFyIF9lYXNpbmdGdW5jdGlvbiA9IFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZTtcblx0dmFyIF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLkxpbmVhcjtcblx0dmFyIF9jaGFpbmVkVHdlZW5zID0gW107XG5cdHZhciBfb25TdGFydENhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXHR2YXIgX29uVXBkYXRlQ2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25TdG9wQ2FsbGJhY2sgPSBudWxsO1xuXG5cdHRoaXMudG8gPSBmdW5jdGlvbiAocHJvcGVydGllcywgZHVyYXRpb24pIHtcblxuXHRcdF92YWx1ZXNFbmQgPSBwcm9wZXJ0aWVzO1xuXG5cdFx0aWYgKGR1cmF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdF9kdXJhdGlvbiA9IGR1cmF0aW9uO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5zdGFydCA9IGZ1bmN0aW9uICh0aW1lKSB7XG5cblx0XHRUV0VFTi5hZGQodGhpcyk7XG5cblx0XHRfaXNQbGF5aW5nID0gdHJ1ZTtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXG5cdFx0X3N0YXJ0VGltZSA9IHRpbWUgIT09IHVuZGVmaW5lZCA/IHRpbWUgOiBUV0VFTi5ub3coKTtcblx0XHRfc3RhcnRUaW1lICs9IF9kZWxheVRpbWU7XG5cblx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBfdmFsdWVzRW5kKSB7XG5cblx0XHRcdC8vIENoZWNrIGlmIGFuIEFycmF5IHdhcyBwcm92aWRlZCBhcyBwcm9wZXJ0eSB2YWx1ZVxuXHRcdFx0aWYgKF92YWx1ZXNFbmRbcHJvcGVydHldIGluc3RhbmNlb2YgQXJyYXkpIHtcblxuXHRcdFx0XHRpZiAoX3ZhbHVlc0VuZFtwcm9wZXJ0eV0ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBBcnJheSB3aXRoIHRoZSBzdGFydCB2YWx1ZSBhdCB0aGUgZnJvbnRcblx0XHRcdFx0X3ZhbHVlc0VuZFtwcm9wZXJ0eV0gPSBbX29iamVjdFtwcm9wZXJ0eV1dLmNvbmNhdChfdmFsdWVzRW5kW3Byb3BlcnR5XSk7XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgYHRvKClgIHNwZWNpZmllcyBhIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdCBpbiB0aGUgc291cmNlIG9iamVjdCxcblx0XHRcdC8vIHdlIHNob3VsZCBub3Qgc2V0IHRoYXQgcHJvcGVydHkgaW4gdGhlIG9iamVjdFxuXHRcdFx0aWYgKF9vYmplY3RbcHJvcGVydHldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNhdmUgdGhlIHN0YXJ0aW5nIHZhbHVlLlxuXHRcdFx0X3ZhbHVlc1N0YXJ0W3Byb3BlcnR5XSA9IF9vYmplY3RbcHJvcGVydHldO1xuXG5cdFx0XHRpZiAoKF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gaW5zdGFuY2VvZiBBcnJheSkgPT09IGZhbHNlKSB7XG5cdFx0XHRcdF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gKj0gMS4wOyAvLyBFbnN1cmVzIHdlJ3JlIHVzaW5nIG51bWJlcnMsIG5vdCBzdHJpbmdzXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFtwcm9wZXJ0eV0gPSBfdmFsdWVzU3RhcnRbcHJvcGVydHldIHx8IDA7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuc3RvcCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICghX2lzUGxheWluZykge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0VFdFRU4ucmVtb3ZlKHRoaXMpO1xuXHRcdF9pc1BsYXlpbmcgPSBmYWxzZTtcblxuXHRcdGlmIChfb25TdG9wQ2FsbGJhY2sgIT09IG51bGwpIHtcblx0XHRcdF9vblN0b3BDYWxsYmFjay5jYWxsKF9vYmplY3QsIF9vYmplY3QpO1xuXHRcdH1cblxuXHRcdHRoaXMuc3RvcENoYWluZWRUd2VlbnMoKTtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuZW5kID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy51cGRhdGUoX3N0YXJ0VGltZSArIF9kdXJhdGlvbik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIG51bUNoYWluZWRUd2VlbnMgPSBfY2hhaW5lZFR3ZWVucy5sZW5ndGg7IGkgPCBudW1DaGFpbmVkVHdlZW5zOyBpKyspIHtcblx0XHRcdF9jaGFpbmVkVHdlZW5zW2ldLnN0b3AoKTtcblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLmRlbGF5ID0gZnVuY3Rpb24gKGFtb3VudCkge1xuXG5cdFx0X2RlbGF5VGltZSA9IGFtb3VudDtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMucmVwZWF0ID0gZnVuY3Rpb24gKHRpbWVzKSB7XG5cblx0XHRfcmVwZWF0ID0gdGltZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnJlcGVhdERlbGF5ID0gZnVuY3Rpb24gKGFtb3VudCkge1xuXG5cdFx0X3JlcGVhdERlbGF5VGltZSA9IGFtb3VudDtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMueW95byA9IGZ1bmN0aW9uICh5b3lvKSB7XG5cblx0XHRfeW95byA9IHlveW87XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXG5cdHRoaXMuZWFzaW5nID0gZnVuY3Rpb24gKGVhc2luZykge1xuXG5cdFx0X2Vhc2luZ0Z1bmN0aW9uID0gZWFzaW5nO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5pbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKGludGVycG9sYXRpb24pIHtcblxuXHRcdF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBpbnRlcnBvbGF0aW9uO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5jaGFpbiA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9jaGFpbmVkVHdlZW5zID0gYXJndW1lbnRzO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblN0YXJ0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cblx0XHRfb25TdGFydENhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uVXBkYXRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cblx0XHRfb25VcGRhdGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cblx0XHRfb25Db21wbGV0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uU3RvcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG5cdFx0X29uU3RvcENhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICh0aW1lKSB7XG5cblx0XHR2YXIgcHJvcGVydHk7XG5cdFx0dmFyIGVsYXBzZWQ7XG5cdFx0dmFyIHZhbHVlO1xuXG5cdFx0aWYgKHRpbWUgPCBfc3RhcnRUaW1lKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoX29uU3RhcnRDYWxsYmFja0ZpcmVkID09PSBmYWxzZSkge1xuXG5cdFx0XHRpZiAoX29uU3RhcnRDYWxsYmFjayAhPT0gbnVsbCkge1xuXHRcdFx0XHRfb25TdGFydENhbGxiYWNrLmNhbGwoX29iamVjdCwgX29iamVjdCk7XG5cdFx0XHR9XG5cblx0XHRcdF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0ZWxhcHNlZCA9ICh0aW1lIC0gX3N0YXJ0VGltZSkgLyBfZHVyYXRpb247XG5cdFx0ZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cblx0XHR2YWx1ZSA9IF9lYXNpbmdGdW5jdGlvbihlbGFwc2VkKTtcblxuXHRcdGZvciAocHJvcGVydHkgaW4gX3ZhbHVlc0VuZCkge1xuXG5cdFx0XHQvLyBEb24ndCB1cGRhdGUgcHJvcGVydGllcyB0aGF0IGRvIG5vdCBleGlzdCBpbiB0aGUgc291cmNlIG9iamVjdFxuXHRcdFx0aWYgKF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YXJ0ID0gX3ZhbHVlc1N0YXJ0W3Byb3BlcnR5XSB8fCAwO1xuXHRcdFx0dmFyIGVuZCA9IF92YWx1ZXNFbmRbcHJvcGVydHldO1xuXG5cdFx0XHRpZiAoZW5kIGluc3RhbmNlb2YgQXJyYXkpIHtcblxuXHRcdFx0XHRfb2JqZWN0W3Byb3BlcnR5XSA9IF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24oZW5kLCB2YWx1ZSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUGFyc2VzIHJlbGF0aXZlIGVuZCB2YWx1ZXMgd2l0aCBzdGFydCBhcyBiYXNlIChlLmcuOiArMTAsIC0zKVxuXHRcdFx0XHRpZiAodHlwZW9mIChlbmQpID09PSAnc3RyaW5nJykge1xuXG5cdFx0XHRcdFx0aWYgKGVuZC5jaGFyQXQoMCkgPT09ICcrJyB8fCBlbmQuY2hhckF0KDApID09PSAnLScpIHtcblx0XHRcdFx0XHRcdGVuZCA9IHN0YXJ0ICsgcGFyc2VGbG9hdChlbmQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbmQgPSBwYXJzZUZsb2F0KGVuZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUHJvdGVjdCBhZ2FpbnN0IG5vbiBudW1lcmljIHByb3BlcnRpZXMuXG5cdFx0XHRcdGlmICh0eXBlb2YgKGVuZCkgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0X29iamVjdFtwcm9wZXJ0eV0gPSBzdGFydCArIChlbmQgLSBzdGFydCkgKiB2YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoX29uVXBkYXRlQ2FsbGJhY2sgIT09IG51bGwpIHtcblx0XHRcdF9vblVwZGF0ZUNhbGxiYWNrLmNhbGwoX29iamVjdCwgdmFsdWUpO1xuXHRcdH1cblxuXHRcdGlmIChlbGFwc2VkID09PSAxKSB7XG5cblx0XHRcdGlmIChfcmVwZWF0ID4gMCkge1xuXG5cdFx0XHRcdGlmIChpc0Zpbml0ZShfcmVwZWF0KSkge1xuXHRcdFx0XHRcdF9yZXBlYXQtLTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFJlYXNzaWduIHN0YXJ0aW5nIHZhbHVlcywgcmVzdGFydCBieSBtYWtpbmcgc3RhcnRUaW1lID0gbm93XG5cdFx0XHRcdGZvciAocHJvcGVydHkgaW4gX3ZhbHVlc1N0YXJ0UmVwZWF0KSB7XG5cblx0XHRcdFx0XHRpZiAodHlwZW9mIChfdmFsdWVzRW5kW3Byb3BlcnR5XSkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRfdmFsdWVzU3RhcnRSZXBlYXRbcHJvcGVydHldID0gX3ZhbHVlc1N0YXJ0UmVwZWF0W3Byb3BlcnR5XSArIHBhcnNlRmxvYXQoX3ZhbHVlc0VuZFtwcm9wZXJ0eV0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChfeW95bykge1xuXHRcdFx0XHRcdFx0dmFyIHRtcCA9IF92YWx1ZXNTdGFydFJlcGVhdFtwcm9wZXJ0eV07XG5cblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFtwcm9wZXJ0eV0gPSBfdmFsdWVzRW5kW3Byb3BlcnR5XTtcblx0XHRcdFx0XHRcdF92YWx1ZXNFbmRbcHJvcGVydHldID0gdG1wO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gPSBfdmFsdWVzU3RhcnRSZXBlYXRbcHJvcGVydHldO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoX3lveW8pIHtcblx0XHRcdFx0XHRfcmV2ZXJzZWQgPSAhX3JldmVyc2VkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF9yZXBlYXREZWxheVRpbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdF9zdGFydFRpbWUgPSB0aW1lICsgX3JlcGVhdERlbGF5VGltZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfc3RhcnRUaW1lID0gdGltZSArIF9kZWxheVRpbWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoX29uQ29tcGxldGVDYWxsYmFjayAhPT0gbnVsbCkge1xuXG5cdFx0XHRcdFx0X29uQ29tcGxldGVDYWxsYmFjay5jYWxsKF9vYmplY3QsIF9vYmplY3QpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIG51bUNoYWluZWRUd2VlbnMgPSBfY2hhaW5lZFR3ZWVucy5sZW5ndGg7IGkgPCBudW1DaGFpbmVkVHdlZW5zOyBpKyspIHtcblx0XHRcdFx0XHQvLyBNYWtlIHRoZSBjaGFpbmVkIHR3ZWVucyBzdGFydCBleGFjdGx5IGF0IHRoZSB0aW1lIHRoZXkgc2hvdWxkLFxuXHRcdFx0XHRcdC8vIGV2ZW4gaWYgdGhlIGB1cGRhdGUoKWAgbWV0aG9kIHdhcyBjYWxsZWQgd2F5IHBhc3QgdGhlIGR1cmF0aW9uIG9mIHRoZSB0d2VlblxuXHRcdFx0XHRcdF9jaGFpbmVkVHdlZW5zW2ldLnN0YXJ0KF9zdGFydFRpbWUgKyBfZHVyYXRpb24pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9O1xuXG59O1xuXG5cblRXRUVOLkVhc2luZyA9IHtcblxuXHRMaW5lYXI6IHtcblxuXHRcdE5vbmU6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBrO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0UXVhZHJhdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgKiAoMiAtIGspO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiBrICogaztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIC0gMC41ICogKC0tayAqIChrIC0gMikgLSAxKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEN1YmljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiAtLWsgKiBrICogayArIDE7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmICgoayAqPSAyKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIDAuNSAqIGsgKiBrICogaztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDAuNSAqICgoayAtPSAyKSAqIGsgKiBrICsgMik7XG5cblx0XHR9XG5cblx0fSxcblxuXHRRdWFydGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gMSAtICgtLWsgKiBrICogayAqIGspO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiBrICogayAqIGsgKiBrO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gLSAwLjUgKiAoKGsgLT0gMikgKiBrICogayAqIGsgLSAyKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1aW50aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gLS1rICogayAqIGsgKiBrICogayArIDE7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmICgoayAqPSAyKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGsgKiBrO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gMC41ICogKChrIC09IDIpICogayAqIGsgKiBrICogayArIDIpO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0U2ludXNvaWRhbDoge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5jb3MoayAqIE1hdGguUEkgLyAyKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBNYXRoLnNpbihrICogTWF0aC5QSSAvIDIpO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0RXhwb25lbnRpYWw6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMCA/IDAgOiBNYXRoLnBvdygxMDI0LCBrIC0gMSk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMSA/IDEgOiAxIC0gTWF0aC5wb3coMiwgLSAxMCAqIGspO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoayA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGsgPT09IDEpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgoayAqPSAyKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIDAuNSAqIE1hdGgucG93KDEwMjQsIGsgLSAxKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDAuNSAqICgtIE1hdGgucG93KDIsIC0gMTAgKiAoayAtIDEpKSArIDIpO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0Q2lyY3VsYXI6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gMSAtIE1hdGguc3FydCgxIC0gayAqIGspO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc3FydCgxIC0gKC0tayAqIGspKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKChrICo9IDIpIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gLSAwLjUgKiAoTWF0aC5zcXJ0KDEgLSBrICogaykgLSAxKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtIChrIC09IDIpICogaykgKyAxKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEVsYXN0aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoayA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGsgPT09IDEpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAtTWF0aC5wb3coMiwgMTAgKiAoayAtIDEpKSAqIE1hdGguc2luKChrIC0gMS4xKSAqIDUgKiBNYXRoLlBJKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmIChrID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoayA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIE1hdGgucG93KDIsIC0xMCAqIGspICogTWF0aC5zaW4oKGsgLSAwLjEpICogNSAqIE1hdGguUEkpICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKGsgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChrID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXG5cdFx0XHRrICo9IDI7XG5cblx0XHRcdGlmIChrIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gLTAuNSAqIE1hdGgucG93KDIsIDEwICogKGsgLSAxKSkgKiBNYXRoLnNpbigoayAtIDEuMSkgKiA1ICogTWF0aC5QSSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAwLjUgKiBNYXRoLnBvdygyLCAtMTAgKiAoayAtIDEpKSAqIE1hdGguc2luKChrIC0gMS4xKSAqIDUgKiBNYXRoLlBJKSArIDE7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCYWNrOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0dmFyIHMgPSAxLjcwMTU4O1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiAoKHMgKyAxKSAqIGsgLSBzKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiAoKHMgKyAxKSAqIGsgKyBzKSArIDE7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1OCAqIDEuNTI1O1xuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiAoayAqIGsgKiAoKHMgKyAxKSAqIGsgLSBzKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAwLjUgKiAoKGsgLT0gMikgKiBrICogKChzICsgMSkgKiBrICsgcykgKyAyKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEJvdW5jZToge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiAxIC0gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoMSAtIGspO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKGsgPCAoMSAvIDIuNzUpKSB7XG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiBrICogaztcblx0XHRcdH0gZWxzZSBpZiAoayA8ICgyIC8gMi43NSkpIHtcblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqIChrIC09ICgxLjUgLyAyLjc1KSkgKiBrICsgMC43NTtcblx0XHRcdH0gZWxzZSBpZiAoayA8ICgyLjUgLyAyLjc1KSkge1xuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKGsgLT0gKDIuMjUgLyAyLjc1KSkgKiBrICsgMC45Mzc1O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqIChrIC09ICgyLjYyNSAvIDIuNzUpKSAqIGsgKyAwLjk4NDM3NTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKGsgPCAwLjUpIHtcblx0XHRcdFx0cmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuSW4oayAqIDIpICogMC41O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoayAqIDIgLSAxKSAqIDAuNSArIDAuNTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cblRXRUVOLkludGVycG9sYXRpb24gPSB7XG5cblx0TGluZWFyOiBmdW5jdGlvbiAodiwgaykge1xuXG5cdFx0dmFyIG0gPSB2Lmxlbmd0aCAtIDE7XG5cdFx0dmFyIGYgPSBtICogaztcblx0XHR2YXIgaSA9IE1hdGguZmxvb3IoZik7XG5cdFx0dmFyIGZuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5MaW5lYXI7XG5cblx0XHRpZiAoayA8IDApIHtcblx0XHRcdHJldHVybiBmbih2WzBdLCB2WzFdLCBmKTtcblx0XHR9XG5cblx0XHRpZiAoayA+IDEpIHtcblx0XHRcdHJldHVybiBmbih2W21dLCB2W20gLSAxXSwgbSAtIGYpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmbih2W2ldLCB2W2kgKyAxID4gbSA/IG0gOiBpICsgMV0sIGYgLSBpKTtcblxuXHR9LFxuXG5cdEJlemllcjogZnVuY3Rpb24gKHYsIGspIHtcblxuXHRcdHZhciBiID0gMDtcblx0XHR2YXIgbiA9IHYubGVuZ3RoIC0gMTtcblx0XHR2YXIgcHcgPSBNYXRoLnBvdztcblx0XHR2YXIgYm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkJlcm5zdGVpbjtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IG47IGkrKykge1xuXHRcdFx0YiArPSBwdygxIC0gaywgbiAtIGkpICogcHcoaywgaSkgKiB2W2ldICogYm4obiwgaSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGI7XG5cblx0fSxcblxuXHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAodiwgaykge1xuXG5cdFx0dmFyIG0gPSB2Lmxlbmd0aCAtIDE7XG5cdFx0dmFyIGYgPSBtICogaztcblx0XHR2YXIgaSA9IE1hdGguZmxvb3IoZik7XG5cdFx0dmFyIGZuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5DYXRtdWxsUm9tO1xuXG5cdFx0aWYgKHZbMF0gPT09IHZbbV0pIHtcblxuXHRcdFx0aWYgKGsgPCAwKSB7XG5cdFx0XHRcdGkgPSBNYXRoLmZsb29yKGYgPSBtICogKDEgKyBrKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmbih2WyhpIC0gMSArIG0pICUgbV0sIHZbaV0sIHZbKGkgKyAxKSAlIG1dLCB2WyhpICsgMikgJSBtXSwgZiAtIGkpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKGsgPCAwKSB7XG5cdFx0XHRcdHJldHVybiB2WzBdIC0gKGZuKHZbMF0sIHZbMF0sIHZbMV0sIHZbMV0sIC1mKSAtIHZbMF0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoayA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIHZbbV0gLSAoZm4odlttXSwgdlttXSwgdlttIC0gMV0sIHZbbSAtIDFdLCBmIC0gbSkgLSB2W21dKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZuKHZbaSA/IGkgLSAxIDogMF0sIHZbaV0sIHZbbSA8IGkgKyAxID8gbSA6IGkgKyAxXSwgdlttIDwgaSArIDIgPyBtIDogaSArIDJdLCBmIC0gaSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRVdGlsczoge1xuXG5cdFx0TGluZWFyOiBmdW5jdGlvbiAocDAsIHAxLCB0KSB7XG5cblx0XHRcdHJldHVybiAocDEgLSBwMCkgKiB0ICsgcDA7XG5cblx0XHR9LFxuXG5cdFx0QmVybnN0ZWluOiBmdW5jdGlvbiAobiwgaSkge1xuXG5cdFx0XHR2YXIgZmMgPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkZhY3RvcmlhbDtcblxuXHRcdFx0cmV0dXJuIGZjKG4pIC8gZmMoaSkgLyBmYyhuIC0gaSk7XG5cblx0XHR9LFxuXG5cdFx0RmFjdG9yaWFsOiAoZnVuY3Rpb24gKCkge1xuXG5cdFx0XHR2YXIgYSA9IFsxXTtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChuKSB7XG5cblx0XHRcdFx0dmFyIHMgPSAxO1xuXG5cdFx0XHRcdGlmIChhW25dKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFbbl07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKHZhciBpID0gbjsgaSA+IDE7IGktLSkge1xuXHRcdFx0XHRcdHMgKj0gaTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFbbl0gPSBzO1xuXHRcdFx0XHRyZXR1cm4gcztcblxuXHRcdFx0fTtcblxuXHRcdH0pKCksXG5cblx0XHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAocDAsIHAxLCBwMiwgcDMsIHQpIHtcblxuXHRcdFx0dmFyIHYwID0gKHAyIC0gcDApICogMC41O1xuXHRcdFx0dmFyIHYxID0gKHAzIC0gcDEpICogMC41O1xuXHRcdFx0dmFyIHQyID0gdCAqIHQ7XG5cdFx0XHR2YXIgdDMgPSB0ICogdDI7XG5cblx0XHRcdHJldHVybiAoMiAqIHAxIC0gMiAqIHAyICsgdjAgKyB2MSkgKiB0MyArICgtIDMgKiBwMSArIDMgKiBwMiAtIDIgKiB2MCAtIHYxKSAqIHQyICsgdjAgKiB0ICsgcDE7XG5cblx0XHR9XG5cblx0fVxuXG59O1xuXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbilcbihmdW5jdGlvbiAocm9vdCkge1xuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblxuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIFRXRUVOO1xuXHRcdH0pO1xuXG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cblx0XHQvLyBOb2RlLmpzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBUV0VFTjtcblxuXHR9IGVsc2UgaWYgKHJvb3QgIT09IHVuZGVmaW5lZCkge1xuXG5cdFx0Ly8gR2xvYmFsIHZhcmlhYmxlXG5cdFx0cm9vdC5UV0VFTiA9IFRXRUVOO1xuXG5cdH1cblxufSkodGhpcyk7XG4iLCJpbXBvcnQgUGlzY2VzIGZyb20gJy4uLy4uLy4uLy4uLyc7XG5cbmltcG9ydCBHZW1pbmkgZnJvbSAnZ2VtaW5pLXNjcm9sbGJhcic7XG5pbXBvcnQgVGV4dEdyYWRpZW50IGZyb20gJ3RleHQtZ3JhZGllbnQnO1xuaW1wb3J0IFNoYXJlVXJsIGZyb20gJ3NoYXJlLXVybCc7XG5pbXBvcnQgVHdlZW4gZnJvbSAndHdlZW4uanMnO1xuXG5jb25zdCB2ZXJzaW9uID0gUGlzY2VzLlZFUlNJT047XG5cbi8vIHByaW50IHBpc2NlcyB2ZXJzaW9uXG5sZXQgdmVyc2lvbkVsZW1lbnQgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy52ZXJzaW9uJykpO1xudmVyc2lvbkVsZW1lbnQubWFwKGVsID0+IHtcbiAgZWwuaW5uZXJIVE1MID0gYHYke3ZlcnNpb259YDtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xufSk7XG52ZXJzaW9uRWxlbWVudCA9IG51bGw7XG5cbi8vIHNldCBncmFkaWVudCB0ZXh0LWdyYWRpZW50XG5bXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4tZ3JhZCcpKS5mb3JFYWNoKGkgPT4ge1xuICBuZXcgVGV4dEdyYWRpZW50KGksIHtcbiAgICBmcm9tOiAnIzZCNkVEOCcsIHRvOiAncmdiKDc0LCAxOTcsIDE5NSknXG4gIH0pO1xufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbi8vIGluaXQgYW5kIGNhY2hlXG5jb25zdCBzY3JvbGxpbmdCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGVtby1zY3JvbGxpbmctYm94Jyk7XG5jb25zdCBnZW1pbmkgPSBuZXcgR2VtaW5pKHtcbiAgZWxlbWVudDogc2Nyb2xsaW5nQm94LFxuICBjcmVhdGVFbGVtZW50czogZmFsc2UsXG4gIGF1dG9zaG93OiAxXG59KS5jcmVhdGUoKTtcbmNvbnN0IHBpc2NlcyA9IG5ldyBQaXNjZXMoZ2VtaW5pLmdldFZpZXdFbGVtZW50KCkpO1xuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RlbW8tZm9ybScpO1xuY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dCcpO1xuY29uc3Qgc2Nyb2xsVG9PcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Nyb2xsLXRvLW9wdGlvbicpO1xuXG5jb25zdCBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZW1vLXNjcm9sbGluZy1ib3ggbGknKTtcbmNvbnN0IGl0ZW1zT3B0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JvbGwtdG8tZWxlbWVudCcpO1xuY29uc3QgZWxlbWVudHNPcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VsZW1lbnRzLXNlbGVjdC13cmFwcGVyJyk7XG5jb25zdCBjb29yZE9wdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29vcmRzLWlucHV0LXdyYXBwZXInKTtcbmNvbnN0IGNvb3JkWCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb29yZC14Jyk7XG5jb25zdCBjb29yZFkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29vcmQteScpO1xuY29uc3QgZWFzZXNPcHRncm91cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ29wdGdyb3VwW2xhYmVsPVwiZWFzZXNcIl0nKTtcbmNvbnN0IGVhc2luZ09wdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlYXNpbmctb3B0aW9uJyk7XG5jb25zdCByZURvdCA9IG5ldyBSZWdFeHAoL1xcLi8pO1xuY29uc3QgZHVyYXRpb25PcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHVyYXRpb24tb3B0aW9uJyk7XG5cbi8vIGNyZWF0ZSBUd2Vlbi5qcyBlYXNpbmcgb3B0aW9uc1xuY29uc3QgVHdlZW5FYXNpbmdzID0gVHdlZW4uRWFzaW5nO1xuY29uc3QgdHdlZW5qc09wdGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0Z3JvdXAnKTtcbnR3ZWVuanNPcHRncm91cC5sYWJlbCA9ICd0d2Vlbi5qcyc7XG5PYmplY3Qua2V5cyhUd2VlbkVhc2luZ3MpLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICBPYmplY3Qua2V5cyhUd2VlbkVhc2luZ3NbZV0pLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgIG9wdGlvbi52YWx1ZSA9IGBUd2Vlbi5FYXNpbmcuJHtlfS4ke299YDtcbiAgICBvcHRpb24udGV4dCA9IGAke2V9LiR7b31gO1xuICAgIHR3ZWVuanNPcHRncm91cC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICB9KTtcbn0pO1xuZWFzaW5nT3B0aW9uLmFwcGVuZENoaWxkKHR3ZWVuanNPcHRncm91cCk7XG5cbi8vIGNyZWF0ZSBzaGFyYWJsZSB1cmxzXG5jb25zdCB0ID0ge1xuICByZWxhdGVkOiAncGl4ZWxpYV9tZScsXG4gIHRleHQ6IGBwaXNjZXMgJHt2ZXJzaW9ufSDigJQgU2Nyb2xsIHRvIGxvY2F0aW9ucyBvZiBhbnkgc2Nyb2xsaW5nIGJveCBpbiBhIHNtb290aCBmYXNoaW9uIGAsXG4gIHVybDogJ2h0dHA6Ly9ub2VsZGVsZ2Fkby5naXRodWIuaW8vcGlzY2VzLycsXG4gIHZpYTogJ3BpeGVsaWFfbWUnXG59O1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNoYXJlLXR3aXR0ZXInKS5ocmVmID0gU2hhcmVVcmwudHdpdHRlcih0KTtcblxuY29uc3QgZiA9IHtcbiAgdTogJ2h0dHA6Ly9ub2VsZGVsZ2Fkby5naXRodWIuaW8vcGlzY2VzLydcbn07XG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2hhcmUtZmFjZWJvb2snKS5ocmVmID0gU2hhcmVVcmwuZmFjZWJvb2soZik7XG5cblxuZnVuY3Rpb24gZm9ybVN1Ym1pdEhhbmRsZXIoZXYpIHtcbiAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgaWYgKGR1cmF0aW9uT3B0aW9uLnZhbHVlKSB7XG4gICAgb3B0aW9ucy5kdXJhdGlvbiA9IGR1cmF0aW9uT3B0aW9uLnZhbHVlO1xuICB9XG5cbiAgaWYgKGVhc2luZ09wdGlvbi52YWx1ZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgbGV0IGVhc2U7XG4gICAgZWFzaW5nT3B0aW9uLnZhbHVlLnNwbGl0KHJlRG90KS5mb3JFYWNoKGkgPT4ge1xuICAgICAgZWFzZSA9ICh0eXBlb2Ygd2luZG93W2ldID09PSAndW5kZWZpbmVkJykgPyBlYXNlW2ldIDogd2luZG93W2ldO1xuICAgIH0pO1xuICAgIG9wdGlvbnMuZWFzaW5nID0gZWFzZTtcbiAgfVxuXG4gIHN3aXRjaChzY3JvbGxUb09wdGlvbi52YWx1ZSkge1xuICAgIGNhc2UgJ2VsZW1lbnQnOlxuICAgICAgY29uc3QgZWwgPSBpdGVtc1soaXRlbXNPcHRpb25zLnZhbHVlIHx8IDE1KSAtIDFdO1xuICAgICAgcGlzY2VzLnNjcm9sbFRvRWxlbWVudChlbCwgb3B0aW9ucyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwb3NpdGlvbic6XG4gICAgICBjb25zdCBjb29yZHMgPSB7eDogY29vcmRYLnZhbHVlLCB5OiBjb29yZFkudmFsdWV9O1xuICAgICAgcGlzY2VzLnNjcm9sbFRvUG9zaXRpb24oY29vcmRzLCBvcHRpb25zKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBwaXNjZXNbc2Nyb2xsVG9PcHRpb24udmFsdWVdKG9wdGlvbnMpO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUhhbmRsZXIoZXYpIHtcbiAgZWxlbWVudHNPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgaXRlbXNPcHRpb25zLmRpc2FibGVkID0gdHJ1ZTtcbiAgY29vcmRPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICBzd2l0Y2goZXYudGFyZ2V0LnZhbHVlKSB7XG4gICAgY2FzZSAnZWxlbWVudCc6XG4gICAgICBlbGVtZW50c09wdGlvbnMuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBpdGVtc09wdGlvbnMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Bvc2l0aW9uJzpcbiAgICAgIGNvb3JkT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZm9ybVN1Ym1pdEhhbmRsZXIpO1xuc2Nyb2xsVG9PcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlSGFuZGxlcik7XG4iXSwibmFtZXMiOlsiY29uc3QiLCJsZXQiLCJ2ZXJzaW9uIiwidGhpcyIsInJlcXVpcmUkJDAiLCJyZXF1aXJlJCQxIiwiZGVmaW5lIiwiVGV4dEdyYWRpZW50IiwiR2VtaW5pIiwiU2hhcmVVcmwiXSwibWFwcGluZ3MiOiJBQUFBLDBCQUFl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QztJQUNUOztHQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7R0FFdEU7O0VBRUQsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFOztHQUVqQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDWixPQUFPLENBQUMsQ0FBQztJQUNUOztHQUVELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUNaLE9BQU8sQ0FBQyxDQUFDO0lBQ1Q7O0dBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7R0FFcEU7O0VBRUQsS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFOztHQUVuQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDWixPQUFPLENBQUMsQ0FBQztJQUNUOztHQUVELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUNaLE9BQU8sQ0FBQyxDQUFDO0lBQ1Q7O0dBRUQsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7R0FFUCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDVixPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVFOztHQUVELE9BQU8sR0FBRyxHQUFHLElBQUks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QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0dBQzVCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNuRDs7RUFFRCxPQUFPLENBQUMsQ0FBQzs7RUFFVDs7Q0FFRCxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztFQUUzQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztFQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN0QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7O0VBRTlDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7R0FFbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQzs7R0FFRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7R0FFM0UsTUFBTTs7R0FFTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDVixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEQ7O0dBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ1YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRTs7R0FFRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7R0FFN0Y7O0VBRUQ7O0NBRUQsS0FBSyxFQUFFOztFQUVOLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFOztHQUU1QixPQUFP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