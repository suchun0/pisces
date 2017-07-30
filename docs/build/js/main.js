var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 

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

var version = "0.0.18";

var Pisces = function Pisces(scrollingBox, options) {
  if ( scrollingBox === void 0 ) { scrollingBox = getScrollingElement(); }
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



Pisces.VERSION = version;

return Pisces;

})));
});

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

var index$3 = createCommonjsModule(function (module, exports) {
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

var version = index$1.VERSION;

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
var pisces = new index$1(gemini.getViewElement());

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvbGliL2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy9nZW1pbmktc2Nyb2xsYmFyL2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy90ZXh0LWdyYWRpZW50L3RleHQtZ3JhZGllbnQtZGVmYXVsdC5qcyIsIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvZG9jcy9ub2RlX21vZHVsZXMvdGV4dC1ncmFkaWVudC90ZXh0LWdyYWRpZW50LXN2Zy5qcyIsIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvZG9jcy9ub2RlX21vZHVsZXMvdGV4dC1ncmFkaWVudC9pbmRleC5qcyIsIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9waXNjZXMvZG9jcy9ub2RlX21vZHVsZXMvc2hhcmUtdXJsL2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL3Bpc2Nlcy9kb2NzL25vZGVfbW9kdWxlcy90d2Vlbi5qcy9zcmMvVHdlZW4uanMiLCIvVXNlcnMvbm9lbC9Qcm9qZWN0cy9wZXJzb25hbC9naXRodWIvcGlzY2VzL2RvY3Mvc3JjL2pzL19lbnRyaWVzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLlBpc2NlcyA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIGdldFNjcm9sbGluZ0VsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICgnc2Nyb2xsaW5nRWxlbWVudCcgaW4gZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudDtcbiAgfVxuXG4gIHZhciBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICB2YXIgc3RhcnQgPSBodG1sLnNjcm9sbFRvcDtcbiAgdmFyIGVuZDtcblxuICBodG1sLnNjcm9sbFRvcCA9IHN0YXJ0ICsgMTtcblxuICBlbmQgPSBodG1sLnNjcm9sbFRvcDtcblxuICBodG1sLnNjcm9sbFRvcCA9IHN0YXJ0O1xuXG4gIGlmIChlbmQgPiBzdGFydCkge1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG59O1xuXG52YXIgQk9EWSA9IGRvY3VtZW50LmJvZHk7XG52YXIgcmVsYXRpdmVWYWx1ZVJlZyA9IG5ldyBSZWdFeHAoL14oXFwtfFxcKylcXGQvKTtcbnZhciBudW1iZXJSZWcgPSBuZXcgUmVnRXhwKC9eXFxkKlxcLj9cXGQqJC8pO1xuXG5mdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XG4gIHZhciBzb3VyY2VzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuICB3aGlsZSAoIGxlbi0tID4gMCApIHNvdXJjZXNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gKyAxIF07XG5cbiAgW10uY29uY2F0KCBzb3VyY2VzICkubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc291cmNlKS5tYXAoZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgdGFyZ2V0W3Byb3BlcnR5TmFtZV0gPSBzb3VyY2VbcHJvcGVydHlOYW1lXTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudChlbCkge1xuICByZXR1cm4gKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpO1xufVxuXG5mdW5jdGlvbiBpc051bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xuICByZXR1cm4gKCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB8fCBudW1iZXJSZWcudGVzdCh2YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNCb2R5KGVsKSB7XG4gIHJldHVybiAoZWwgPT09IEJPRFkpO1xufVxuXG5mdW5jdGlvbiBpc1JlbGF0aXZlVmFsdWUodmFsdWUpIHtcbiAgaWYgKCFpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcmVsYXRpdmVWYWx1ZVJlZy50ZXN0KHZhbHVlKTtcbn1cblxudmFyIHZlcnNpb24gPSBcIjAuMC4xOFwiO1xuXG52YXIgUGlzY2VzID0gZnVuY3Rpb24gUGlzY2VzKHNjcm9sbGluZ0JveCwgb3B0aW9ucykge1xuICBpZiAoIHNjcm9sbGluZ0JveCA9PT0gdm9pZCAwICkgc2Nyb2xsaW5nQm94ID0gZ2V0U2Nyb2xsaW5nRWxlbWVudCgpO1xuICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICB0aGlzLnNjcm9sbGluZ0JveCA9IHNjcm9sbGluZ0JveDtcbiAgdGhpcy5vcHRpb25zID0gYXNzaWduKHt9LCBQaXNjZXMuZGVmYXVsdHMoKSwgb3B0aW9ucyk7XG59O1xuXG52YXIgcHJvdG90eXBlQWNjZXNzb3JzID0geyBzdGFydDoge30sbWF4OiB7fSB9O1xuXG5QaXNjZXMuZGVmYXVsdHMgPSBmdW5jdGlvbiBkZWZhdWx0cyAoKSB7XG4gIHZhciBkdXJhdGlvbiA9IDYwMDtcbiAgdmFyIGVhc2luZyA9IGZ1bmN0aW9uICh0KSB7IHJldHVybiBNYXRoLnNxcnQoMSAtICgtLXQgKiB0KSk7IH07XG4gIHZhciBvbkNvbXBsZXRlID0gbnVsbDtcbiAgcmV0dXJuIHsgZHVyYXRpb246IGR1cmF0aW9uLCBlYXNpbmc6IGVhc2luZywgb25Db21wbGV0ZTogb25Db21wbGV0ZSB9O1xufTtcblxucHJvdG90eXBlQWNjZXNzb3JzLnN0YXJ0LmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlZiA9IHRoaXMuc2Nyb2xsaW5nQm94O1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gcmVmLnNjcm9sbExlZnQ7XG4gICAgdmFyIHNjcm9sbFRvcCA9IHJlZi5zY3JvbGxUb3A7XG4gIHJldHVybiB7IHg6IHNjcm9sbExlZnQsIHk6IHNjcm9sbFRvcCB9O1xufTtcblxucHJvdG90eXBlQWNjZXNzb3JzLm1heC5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbCA9IHRoaXMuc2Nyb2xsaW5nQm94O1xuICB2YXIgeDtcbiAgdmFyIHk7XG4gIGlmIChpc0JvZHkoZWwpKSB7XG4gICAgeCA9IChlbC5zY3JvbGxXaWR0aCAtIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICB5ID0gKGVsLnNjcm9sbEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgeCA9IChlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoKTtcbiAgICB5ID0gKGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodCk7XG4gIH1cblxuICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59O1xuXG5QaXNjZXMucHJvdG90eXBlLl9hbmltYXRlID0gZnVuY3Rpb24gX2FuaW1hdGUgKGNvb3Jkcywgb3B0aW9ucykge1xuICAgIGlmICggb3B0aW9ucyA9PT0gdm9pZCAwICkgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciBfb3B0aW9ucyA9IGFzc2lnbih7fSwgX3RoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgdmFyIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHZhciBzdGVwID0gZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgIHZhciBlbGFwc2VkID0gTWF0aC5hYnModGltZXN0YW1wIC0gc3RhcnQpO1xuICAgIHZhciBwcm9ncmVzcyA9IF9vcHRpb25zLmVhc2luZyhlbGFwc2VkIC8gX29wdGlvbnMuZHVyYXRpb24pO1xuICAgIF90aGlzLnNjcm9sbGluZ0JveC5zY3JvbGxUb3AgPSAoY29vcmRzLnN0YXJ0LnkgKyBjb29yZHMuZW5kLnkgKiBwcm9ncmVzcyk7XG4gICAgX3RoaXMuc2Nyb2xsaW5nQm94LnNjcm9sbExlZnQgPSAoY29vcmRzLnN0YXJ0LnggKyBjb29yZHMuZW5kLnggKiBwcm9ncmVzcyk7XG4gICAgaWYgKGVsYXBzZWQgPiBfb3B0aW9ucy5kdXJhdGlvbikgeyBfdGhpcy5fY29tcGxldGVkKGNvb3JkcywgX29wdGlvbnMpOyB9XG4gICAgZWxzZSB7IF90aGlzLl9SQUYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7IH1cbiAgfTtcblxuICBfdGhpcy5jYW5jZWwoKTtcbiAgX3RoaXMuX1JBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5QaXNjZXMucHJvdG90eXBlLl9jb21wbGV0ZWQgPSBmdW5jdGlvbiBfY29tcGxldGVkIChjb29yZHMsIG9wdGlvbnMpIHtcbiAgdGhpcy5jYW5jZWwoKTtcbiAgdGhpcy5zY3JvbGxpbmdCb3guc2Nyb2xsVG9wID0gKGNvb3Jkcy5zdGFydC55ICsgY29vcmRzLmVuZC55KTtcbiAgdGhpcy5zY3JvbGxpbmdCb3guc2Nyb2xsTGVmdCA9IChjb29yZHMuc3RhcnQueCArIGNvb3Jkcy5lbmQueCk7XG4gIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMub25Db21wbGV0ZSkpIHsgb3B0aW9ucy5vbkNvbXBsZXRlKCk7IH1cbn07XG5cblBpc2Nlcy5wcm90b3R5cGUuX2dldEVuZENvb3JkaW5hdGVWYWx1ZSA9IGZ1bmN0aW9uIF9nZXRFbmRDb29yZGluYXRlVmFsdWUgKGNvb3JkLCBzdGFydCwgbWF4KSB7XG4gIGlmIChpc051bWJlcihjb29yZCkpIHtcbiAgICBpZiAoY29vcmQgPiBtYXgpIHsgY29vcmQgPSBtYXg7IH1cbiAgICByZXR1cm4gKGNvb3JkIC0gc3RhcnQpO1xuICB9XG5cbiAgaWYgKGlzUmVsYXRpdmVWYWx1ZShjb29yZCkpIHtcbiAgICB2YXIgdmFsdWUgPSAoc3RhcnQgLSAoc3RhcnQgLSB+fmNvb3JkKSk7XG4gICAgaWYgKChzdGFydCArIHZhbHVlKSA+IG1heCkgeyByZXR1cm4gKG1heCAtIHN0YXJ0KTsgfVxuICAgIGVsc2UgaWYgKChzdGFydCArIHZhbHVlKSA8IDApIHsgcmV0dXJuIC1zdGFydDsgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiAwO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uIHNjcm9sbFRvICh0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIHRhcmdldCA9PT0gdm9pZCAwICkgdGFyZ2V0ID0gbnVsbDtcblxuICB2YXIgRVJST1JfTUVTU0FHRSA9ICd0YXJnZXQgcGFyYW0gc2hvdWxkIGJlIGEgSFRNTEVsZW1lbnQgb3IgYW5kICcgK1xuICAgICdvYmplY3QgZm9ybWF0dGVkIGFzOiB7eDogTnVtYmVyLCB5OiBOdW1iZXJ9JztcblxuICBpZiAoaXNOdWxsKHRhcmdldCkgfHwgaXNVbmRlZmluZWQodGFyZ2V0KSkge1xuICAgIHJldHVybiBjb25zb2xlLmVycm9yKCd0YXJnZXQgcGFyYW0gaXMgcmVxdWlyZWQnKTtcbiAgfSBlbHNlIGlmICghaXNPYmplY3QodGFyZ2V0KSAmJiAhaXNTdHJpbmcodGFyZ2V0KSkge1xuICAgIHJldHVybiBjb25zb2xlLmVycm9yKEVSUk9SX01FU1NBR0UpO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKHRhcmdldCkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuc2Nyb2xsaW5nQm94LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbiAgICBpZiAoaXNFbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoRVJST1JfTUVTU0FHRSk7XG4gIH1cblxuICBpZiAoaXNFbGVtZW50KHRhcmdldCkpIHtcbiAgICByZXR1cm4gdGhpcy5zY3JvbGxUb0VsZW1lbnQodGFyZ2V0LCBvcHRpb25zKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNjcm9sbFRvUG9zaXRpb24odGFyZ2V0LCBvcHRpb25zKTtcbn07XG5cblBpc2Nlcy5wcm90b3R5cGUuc2Nyb2xsVG9FbGVtZW50ID0gZnVuY3Rpb24gc2Nyb2xsVG9FbGVtZW50IChlbCwgb3B0aW9ucykge1xuICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICB2YXIgZW5kID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0KGVsKTtcbiAgaWYgKCFlbmQpIHsgcmV0dXJuOyB9XG4gIHJldHVybiB0aGlzLl9hbmltYXRlKHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IGVuZCB9LCBvcHRpb25zKTtcbn07XG5cblBpc2Nlcy5wcm90b3R5cGUuc2Nyb2xsVG9Qb3NpdGlvbiA9IGZ1bmN0aW9uIHNjcm9sbFRvUG9zaXRpb24gKGNvb3Jkcywgb3B0aW9ucykge1xuICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICB2YXIgbWF4ID0gdGhpcy5tYXg7XG4gIHZhciB4ID0gKGNvb3Jkcy5oYXNPd25Qcm9wZXJ0eSgneCcpKSA/IGNvb3Jkcy54IDogc3RhcnQueDtcbiAgdmFyIHkgPSAoY29vcmRzLmhhc093blByb3BlcnR5KCd5JykpID8gY29vcmRzLnkgOiBzdGFydC55O1xuICB4ID0gdGhpcy5fZ2V0RW5kQ29vcmRpbmF0ZVZhbHVlKHgsIHN0YXJ0LngsIG1heC54KTtcbiAgeSA9IHRoaXMuX2dldEVuZENvb3JkaW5hdGVWYWx1ZSh5LCBzdGFydC55LCBtYXgueSk7XG4gIHZhciBlbmQgPSB7IHg6IHgsIHk6IHkgfTtcbiAgcmV0dXJuIHRoaXMuX2FuaW1hdGUoeyBzdGFydDogc3RhcnQsIGVuZDogZW5kIH0sIG9wdGlvbnMpO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5zY3JvbGxUb1RvcCA9IGZ1bmN0aW9uIHNjcm9sbFRvVG9wIChvcHRpb25zKSB7XG4gIHZhciBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gIHZhciBlbmQgPSB7IHg6IDAsIHk6IC0oc3RhcnQueSkgfTtcbiAgcmV0dXJuIHRoaXMuX2FuaW1hdGUoeyBzdGFydDogc3RhcnQsIGVuZDogZW5kIH0sIG9wdGlvbnMpO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5zY3JvbGxUb0JvdHRvbSA9IGZ1bmN0aW9uIHNjcm9sbFRvQm90dG9tIChvcHRpb25zKSB7XG4gIHZhciBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gIHZhciBtYXggPSB0aGlzLm1heDtcbiAgdmFyIGVuZCA9eyB4OiAwLCB5OiAobWF4LnkgLSBzdGFydC55KSB9O1xuICByZXR1cm4gdGhpcy5fYW5pbWF0ZSh7IHN0YXJ0OiBzdGFydCwgZW5kOiBlbmQgfSwgb3B0aW9ucyk7XG59O1xuXG5QaXNjZXMucHJvdG90eXBlLnNjcm9sbFRvTGVmdCA9IGZ1bmN0aW9uIHNjcm9sbFRvTGVmdCAob3B0aW9ucykge1xuICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICB2YXIgZW5kID17IHg6IC0oc3RhcnQueCksIHk6IDAgfTtcbiAgcmV0dXJuIHRoaXMuX2FuaW1hdGUoeyBzdGFydDogc3RhcnQsIGVuZDogZW5kIH0sIG9wdGlvbnMpO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5zY3JvbGxUb1JpZ2h0ID0gZnVuY3Rpb24gc2Nyb2xsVG9SaWdodCAob3B0aW9ucykge1xuICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICB2YXIgbWF4ID0gdGhpcy5tYXg7XG4gIHZhciBlbmQgPXsgeDogKG1heC54IC0gc3RhcnQueCksIHk6IDAgfTtcbiAgcmV0dXJuIHRoaXMuX2FuaW1hdGUoeyBzdGFydDogc3RhcnQsIGVuZDogZW5kIH0sIG9wdGlvbnMpO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKGtleSwgdmFsdWUpIHtcbiAgdGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5QaXNjZXMucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIGNhbmNlbCAoKSB7XG4gIHRoaXMuX1JBRiA9IGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX1JBRik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUGlzY2VzLnByb3RvdHlwZS5nZXRFbGVtZW50T2Zmc2V0ID0gZnVuY3Rpb24gZ2V0RWxlbWVudE9mZnNldCAoZWwpIHtcbiAgaWYgKCFpc0JvZHkoZWwpICYmICF0aGlzLnNjcm9sbGluZ0JveC5jb250YWlucyhlbCkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdzY3JvbGxpbmdCb3ggZG9lcyBub3QgY29udGFpbnMgZWxlbWVudCcpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gIHZhciBtYXggPSB0aGlzLm1heDtcbiAgdmFyIGUgPSBlbDtcbiAgdmFyIF90b3AgPSAwO1xuICB2YXIgX2xlZnQgPSAwO1xuICB2YXIgeCA9IDA7XG4gIHZhciB5ID0gMDtcblxuICBkbyB7XG4gICAgX2xlZnQgKz0gZS5vZmZzZXRMZWZ0O1xuICAgIF90b3AgKz0gZS5vZmZzZXRUb3A7XG4gICAgZSA9IGUucGFyZW50RWxlbWVudDtcbiAgfSB3aGlsZSAoZSAhPT0gdGhpcy5zY3JvbGxpbmdCb3gpO1xuXG4gIHggPSAoX2xlZnQgLSBzdGFydC54KTtcbiAgeSA9IChfdG9wIC0gc3RhcnQueSk7XG5cbiAgaWYgKHggPiBtYXgueCkgeyB4ID0gbWF4Lng7IH1cbiAgaWYgKHkgPiBtYXgueSkgeyB5ID0gbWF4Lnk7IH1cblxuICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggUGlzY2VzLnByb3RvdHlwZSwgcHJvdG90eXBlQWNjZXNzb3JzICk7XG5cblxuXG5QaXNjZXMuVkVSU0lPTiA9IHZlcnNpb247XG5cbnJldHVybiBQaXNjZXM7XG5cbn0pKSk7XG4iLCIvKipcbiAqIGdlbWluaS1zY3JvbGxiYXJcbiAqIEB2ZXJzaW9uIDEuNS4xXG4gKiBAbGluayBodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL2dlbWluaS1zY3JvbGxiYXIvXG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgU0NST0xMQkFSX1dJRFRILCBET05UX0NSRUFURV9HRU1JTkksIENMQVNTTkFNRVM7XG5cbiAgQ0xBU1NOQU1FUyA9IHtcbiAgICBlbGVtZW50OiAnZ20tc2Nyb2xsYmFyLWNvbnRhaW5lcicsXG4gICAgdmVydGljYWxTY3JvbGxiYXI6ICdnbS1zY3JvbGxiYXIgLXZlcnRpY2FsJyxcbiAgICBob3Jpem9udGFsU2Nyb2xsYmFyOiAnZ20tc2Nyb2xsYmFyIC1ob3Jpem9udGFsJyxcbiAgICB0aHVtYjogJ3RodW1iJyxcbiAgICB2aWV3OiAnZ20tc2Nyb2xsLXZpZXcnLFxuICAgIGF1dG9zaG93OiAnZ20tYXV0b3Nob3cnLFxuICAgIGRpc2FibGU6ICdnbS1zY3JvbGxiYXItZGlzYWJsZS1zZWxlY3Rpb24nLFxuICAgIHByZXZlbnRlZDogJ2dtLXByZXZlbnRlZCcsXG4gICAgcmVzaXplVHJpZ2dlcjogJ2dtLXJlc2l6ZS10cmlnZ2VyJyxcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRTY3JvbGxiYXJXaWR0aCgpIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCBzdztcbiAgICBlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBlLnN0eWxlLnRvcCA9ICctOTk5OXB4JztcbiAgICBlLnN0eWxlLndpZHRoID0gJzEwMHB4JztcbiAgICBlLnN0eWxlLmhlaWdodCA9ICcxMDBweCc7XG4gICAgZS5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnO1xuICAgIGUuc3R5bGUubXNPdmVyZmxvd1N0eWxlID0gJ3Njcm9sbGJhcic7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlKTtcbiAgICBzdyA9IChlLm9mZnNldFdpZHRoIC0gZS5jbGllbnRXaWR0aCk7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlKTtcbiAgICByZXR1cm4gc3c7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lcykge1xuICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICAgIHJldHVybiBjbGFzc05hbWVzLmZvckVhY2goZnVuY3Rpb24oY2wpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChjbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZXMuam9pbignICcpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZXMpIHtcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgICByZXR1cm4gY2xhc3NOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGNsKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2wpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWVzLmpvaW4oJ3wnKSArICcoXFxcXGJ8JCknLCAnZ2knKSwgJyAnKTtcbiAgfVxuXG4gIC8qIENvcHlyaWdodCAoYykgMjAxNSBMdWNhcyBXaWVuZXJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3duci9lbGVtZW50LXJlc2l6ZS1kZXRlY3RvclxuICAgKi9cbiAgZnVuY3Rpb24gaXNJRSgpIHtcbiAgICB2YXIgYWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGFnZW50LmluZGV4T2YoXCJtc2llXCIpICE9PSAtMSB8fCBhZ2VudC5pbmRleE9mKFwidHJpZGVudFwiKSAhPT0gLTEgfHwgYWdlbnQuaW5kZXhPZihcIiBlZGdlL1wiKSAhPT0gLTE7XG4gIH1cblxuICBmdW5jdGlvbiBHZW1pbmlTY3JvbGxiYXIoY29uZmlnKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLmF1dG9zaG93ID0gZmFsc2U7XG4gICAgdGhpcy5jcmVhdGVFbGVtZW50cyA9IHRydWU7XG4gICAgdGhpcy5mb3JjZUdlbWluaSA9IGZhbHNlO1xuICAgIHRoaXMub25SZXNpemUgPSBudWxsO1xuICAgIHRoaXMubWluVGh1bWJTaXplID0gMjA7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcgfHwge30pLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgdGhpc1twcm9wZXJ0eU5hbWVdID0gY29uZmlnW3Byb3BlcnR5TmFtZV07XG4gICAgfSwgdGhpcyk7XG5cbiAgICBTQ1JPTExCQVJfV0lEVEggPSBnZXRTY3JvbGxiYXJXaWR0aCgpO1xuICAgIERPTlRfQ1JFQVRFX0dFTUlOSSA9ICgoU0NST0xMQkFSX1dJRFRIID09PSAwKSAmJiAodGhpcy5mb3JjZUdlbWluaSA9PT0gZmFsc2UpKTtcblxuICAgIHRoaXMuX2NhY2hlID0ge2V2ZW50czoge319O1xuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldlBhZ2VYID0gMDtcbiAgICB0aGlzLl9wcmV2UGFnZVkgPSAwO1xuXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3ZpZXdFbGVtZW50ID0gdGhpcy5lbGVtZW50O1xuICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCA9IG51bGw7XG4gIH1cblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBpZiAoRE9OVF9DUkVBVEVfR0VNSU5JKSB7XG4gICAgICBhZGRDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLnByZXZlbnRlZF0pO1xuXG4gICAgICBpZiAodGhpcy5vblJlc2l6ZSkge1xuICAgICAgICAvLyBzdGlsbCBuZWVkIGEgcmVzaXplIHRyaWdnZXIgaWYgd2UgaGF2ZSBhbiBvblJlc2l6ZSBjYWxsYmFjaywgd2hpY2hcbiAgICAgICAgLy8gYWxzbyBtZWFucyB3ZSBuZWVkIGEgc2VwYXJhdGUgX3ZpZXdFbGVtZW50IHRvIGRvIHRoZSBzY3JvbGxpbmcuXG4gICAgICAgIGlmICh0aGlzLmNyZWF0ZUVsZW1lbnRzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl92aWV3RWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnZpZXcpO1xuICAgICAgICB9XG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWxlbWVudCwgW0NMQVNTTkFNRVMuZWxlbWVudF0pO1xuICAgICAgICBhZGRDbGFzcyh0aGlzLl92aWV3RWxlbWVudCwgW0NMQVNTTkFNRVMudmlld10pO1xuICAgICAgICB0aGlzLl9jcmVhdGVSZXNpemVUcmlnZ2VyKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jcmVhdGVkID09PSB0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2NhbGxpbmcgb24gYSBhbHJlYWR5LWNyZWF0ZWQgb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hdXRvc2hvdykge1xuICAgICAgYWRkQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5hdXRvc2hvd10pO1xuICAgIH1cblxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG5cbiAgICBpZiAodGhpcy5jcmVhdGVFbGVtZW50cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50KTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQpO1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCk7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQpO1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3ZpZXdFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnZpZXcpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NOQU1FUy52ZXJ0aWNhbFNjcm9sbGJhci5zcGxpdCgnICcpLmpvaW4oJy4nKSk7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudCA9IHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTTkFNRVMudGh1bWIpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLmhvcml6b250YWxTY3JvbGxiYXIuc3BsaXQoJyAnKS5qb2luKCcuJykpO1xuICAgICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudCA9IHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NOQU1FUy50aHVtYik7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5lbGVtZW50XSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdmlld0VsZW1lbnQsIFtDTEFTU05BTUVTLnZpZXddKTtcbiAgICBhZGRDbGFzcyh0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQsIENMQVNTTkFNRVMudmVydGljYWxTY3JvbGxiYXIuc3BsaXQoL1xccy8pKTtcbiAgICBhZGRDbGFzcyh0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCwgQ0xBU1NOQU1FUy5ob3Jpem9udGFsU2Nyb2xsYmFyLnNwbGl0KC9cXHMvKSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQsIFtDTEFTU05BTUVTLnRodW1iXSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudCwgW0NMQVNTTkFNRVMudGh1bWJdKTtcblxuICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuXG4gICAgdGhpcy5fY3JlYXRlUmVzaXplVHJpZ2dlcigpO1xuXG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcy5fYmluZEV2ZW50cygpLnVwZGF0ZSgpO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NyZWF0ZVJlc2l6ZVRyaWdnZXIgPSBmdW5jdGlvbiBjcmVhdGVSZXNpemVUcmlnZ2VyKCkge1xuICAgIC8vIFdlIG5lZWQgdG8gYXJyYW5nZSBmb3Igc2VsZi5zY3JvbGxiYXIudXBkYXRlIHRvIGJlIGNhbGxlZCB3aGVuZXZlclxuICAgIC8vIHRoZSBET00gaXMgY2hhbmdlZCByZXN1bHRpbmcgaW4gYSBzaXplLWNoYW5nZSBmb3Igb3VyIGRpdi4gVG8gbWFrZVxuICAgIC8vIHRoaXMgaGFwcGVuLCB3ZSB1c2UgYSB0ZWNobmlxdWUgZGVzY3JpYmVkIGhlcmU6XG4gICAgLy8gaHR0cDovL3d3dy5iYWNrYWxsZXljb2Rlci5jb20vMjAxMy8wMy8xOC9jcm9zcy1icm93c2VyLWV2ZW50LWJhc2VkLWVsZW1lbnQtcmVzaXplLWRldGVjdGlvbi8uXG4gICAgLy9cbiAgICAvLyBUaGUgaWRlYSBpcyB0aGF0IHdlIGNyZWF0ZSBhbiA8b2JqZWN0PiBlbGVtZW50IGluIG91ciBkaXYsIHdoaWNoIHdlXG4gICAgLy8gYXJyYW5nZSB0byBoYXZlIHRoZSBzYW1lIHNpemUgYXMgdGhhdCBkaXYuIFRoZSA8b2JqZWN0PiBlbGVtZW50XG4gICAgLy8gY29udGFpbnMgYSBXaW5kb3cgb2JqZWN0LCB0byB3aGljaCB3ZSBjYW4gYXR0YWNoIGFuIG9ucmVzaXplXG4gICAgLy8gaGFuZGxlci5cbiAgICAvL1xuICAgIC8vIChSZWFjdCBhcHBlYXJzIHRvIGdldCB2ZXJ5IGNvbmZ1c2VkIGJ5IHRoZSBvYmplY3QgKHdlIGVuZCB1cCB3aXRoXG4gICAgLy8gQ2hyb21lIHdpbmRvd3Mgd2hpY2ggb25seSBzaG93IGhhbGYgb2YgdGhlIHRleHQgdGhleSBhcmUgc3VwcG9zZWRcbiAgICAvLyB0byksIHNvIHdlIGFsd2F5cyBkbyB0aGlzIG1hbnVhbGx5LilcblxuICAgIHZhciBvYmogPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBhZGRDbGFzcyhvYmosIFtDTEFTU05BTUVTLnJlc2l6ZVRyaWdnZXJdKTtcbiAgICBvYmoudHlwZSA9ICd0ZXh0L2h0bWwnO1xuICAgIHZhciByZXNpemVIYW5kbGVyID0gdGhpcy5fcmVzaXplSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIG9iai5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgd2luID0gb2JqLmNvbnRlbnREb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVIYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgLy9JRTogRG9lcyBub3QgbGlrZSB0aGF0IHRoaXMgaGFwcGVucyBiZWZvcmUsIGV2ZW4gaWYgaXQgaXMgYWxzbyBhZGRlZCBhZnRlci5cbiAgICBpZiAoIWlzSUUoKSkge1xuICAgICAgb2JqLmRhdGEgPSAnYWJvdXQ6YmxhbmsnO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChvYmopO1xuXG4gICAgLy9JRTogVGhpcyBtdXN0IG9jY3VyIGFmdGVyIGFkZGluZyB0aGUgb2JqZWN0IHRvIHRoZSBET00uXG4gICAgaWYgKGlzSUUoKSkge1xuICAgICAgb2JqLmRhdGEgPSAnYWJvdXQ6YmxhbmsnO1xuICAgIH1cblxuICAgIHRoaXMuX3Jlc2l6ZVRyaWdnZXJFbGVtZW50ID0gb2JqO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIGlmIChET05UX0NSRUFURV9HRU1JTkkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jcmVhdGVkID09PSBmYWxzZSkge1xuICAgICAgY29uc29sZS53YXJuKCdjYWxsaW5nIG9uIGEgbm90LXlldC1jcmVhdGVkIG9iamVjdCcpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fdmlld0VsZW1lbnQuc3R5bGUud2lkdGggPSAoKHRoaXMuZWxlbWVudC5vZmZzZXRXaWR0aCArIFNDUk9MTEJBUl9XSURUSCkudG9TdHJpbmcoKSArICdweCcpO1xuICAgIHRoaXMuX3ZpZXdFbGVtZW50LnN0eWxlLmhlaWdodCA9ICgodGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodCArIFNDUk9MTEJBUl9XSURUSCkudG9TdHJpbmcoKSArICdweCcpO1xuXG4gICAgdGhpcy5fbmF0dXJhbFRodW1iU2l6ZVggPSB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aCAvIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFdpZHRoICogdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgdGhpcy5fbmF0dXJhbFRodW1iU2l6ZVkgPSB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsSGVpZ2h0ICogdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgIHRoaXMuX3Njcm9sbFRvcE1heCA9IHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMuX3ZpZXdFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB0aGlzLl9zY3JvbGxMZWZ0TWF4ID0gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsV2lkdGggLSB0aGlzLl92aWV3RWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgIGlmICh0aGlzLl9uYXR1cmFsVGh1bWJTaXplWSA8IHRoaXMubWluVGh1bWJTaXplKSB7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLm1pblRodW1iU2l6ZSArICdweCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9zY3JvbGxUb3BNYXgpIHtcbiAgICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuX25hdHVyYWxUaHVtYlNpemVZICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25hdHVyYWxUaHVtYlNpemVYIDwgdGhpcy5taW5UaHVtYlNpemUpIHtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLm1pblRodW1iU2l6ZSArICdweCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9zY3JvbGxMZWZ0TWF4KSB7XG4gICAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5fbmF0dXJhbFRodW1iU2l6ZVggKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LnN0eWxlLndpZHRoID0gJzBweCc7XG4gICAgfVxuXG4gICAgdGhpcy5fdGh1bWJTaXplWSA9IHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB0aGlzLl90aHVtYlNpemVYID0gdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgIHRoaXMuX3RyYWNrVG9wTWF4ID0gdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmNsaWVudEhlaWdodCAtIHRoaXMuX3RodW1iU2l6ZVk7XG4gICAgdGhpcy5fdHJhY2tMZWZ0TWF4ID0gdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuY2xpZW50V2lkdGggLSB0aGlzLl90aHVtYlNpemVYO1xuXG4gICAgdGhpcy5fc2Nyb2xsSGFuZGxlcigpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fcmVzaXplVHJpZ2dlckVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLl9yZXNpemVUcmlnZ2VyRWxlbWVudCk7XG4gICAgICB0aGlzLl9yZXNpemVUcmlnZ2VyRWxlbWVudCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKERPTlRfQ1JFQVRFX0dFTUlOSSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZWQgPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2NhbGxpbmcgb24gYSBub3QteWV0LWNyZWF0ZWQgb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl91bmJpbkV2ZW50cygpO1xuXG4gICAgcmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5lbGVtZW50LCBDTEFTU05BTUVTLmF1dG9zaG93XSk7XG5cbiAgICBpZiAodGhpcy5jcmVhdGVFbGVtZW50cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCk7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQpO1xuICAgICAgd2hpbGUodGhpcy5fdmlld0VsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl92aWV3RWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLl92aWV3RWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB0aGlzLl92aWV3RWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBudWxsO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5nZXRWaWV3RWxlbWVudCA9IGZ1bmN0aW9uIGdldFZpZXdFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3RWxlbWVudDtcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl9iaW5kRXZlbnRzID0gZnVuY3Rpb24gX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLnNjcm9sbEhhbmRsZXIgPSB0aGlzLl9zY3JvbGxIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUcmFja0hhbmRsZXIgPSB0aGlzLl9jbGlja1ZlcnRpY2FsVHJhY2tIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlciA9IHRoaXMuX2NsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyID0gdGhpcy5fY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja0hvcml6b250YWxUaHVtYkhhbmRsZXIgPSB0aGlzLl9jbGlja0hvcml6b250YWxUaHVtYkhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMubW91c2VVcERvY3VtZW50SGFuZGxlciA9IHRoaXMuX21vdXNlVXBEb2N1bWVudEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMubW91c2VNb3ZlRG9jdW1lbnRIYW5kbGVyID0gdGhpcy5fbW91c2VNb3ZlRG9jdW1lbnRIYW5kbGVyLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl92aWV3RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9jYWNoZS5ldmVudHMuc2Nyb2xsSGFuZGxlcik7XG4gICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlcik7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVGh1bWJIYW5kbGVyKTtcbiAgICB0aGlzLl9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlVXBEb2N1bWVudEhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fdW5iaW5FdmVudHMgPSBmdW5jdGlvbiBfdW5iaW5FdmVudHMoKSB7XG4gICAgdGhpcy5fdmlld0VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5fY2FjaGUuZXZlbnRzLnNjcm9sbEhhbmRsZXIpO1xuICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRyYWNrSGFuZGxlcik7XG4gICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlcik7XG4gICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIpO1xuICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlcik7XG4gICAgdGhpcy5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZVVwRG9jdW1lbnRIYW5kbGVyKTtcbiAgICB0aGlzLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9jYWNoZS5ldmVudHMubW91c2VNb3ZlRG9jdW1lbnRIYW5kbGVyKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX3Njcm9sbEhhbmRsZXIgPSBmdW5jdGlvbiBfc2Nyb2xsSGFuZGxlcigpIHtcbiAgICB2YXIgeCA9ICh0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxMZWZ0ICogdGhpcy5fdHJhY2tMZWZ0TWF4IC8gdGhpcy5fc2Nyb2xsTGVmdE1heCkgfHwgMDtcbiAgICB2YXIgeSA9ICh0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxUb3AgKiB0aGlzLl90cmFja1RvcE1heCAvIHRoaXMuX3Njcm9sbFRvcE1heCkgfHwgMDtcblxuICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUubXNUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgeCArICdweCknO1xuICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJ3B4LCAwLCAwKSc7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAncHgsIDAsIDApJztcblxuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLm1zVHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoJyArIHkgKyAncHgpJztcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwgJyArIHkgKyAncHgsIDApJztcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwgJyArIHkgKyAncHgsIDApJztcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl9yZXNpemVIYW5kbGVyID0gZnVuY3Rpb24gX3Jlc2l6ZUhhbmRsZXIoKSB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgICBpZiAodGhpcy5vblJlc2l6ZSkge1xuICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgIH1cbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl9jbGlja1ZlcnRpY2FsVHJhY2tIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrVmVydGljYWxUcmFja0hhbmRsZXIoZSkge1xuICAgIHZhciBvZmZzZXQgPSBlLm9mZnNldFkgLSB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWSAqIC41XG4gICAgICAsIHRodW1iUG9zaXRpb25QZXJjZW50YWdlID0gb2Zmc2V0ICogMTAwIC8gdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFRvcCA9IHRodW1iUG9zaXRpb25QZXJjZW50YWdlICogdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsSGVpZ2h0IC8gMTAwO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlciA9IGZ1bmN0aW9uIF9jbGlja0hvcml6b250YWxUcmFja0hhbmRsZXIoZSkge1xuICAgIHZhciBvZmZzZXQgPSBlLm9mZnNldFggLSB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWCAqIC41XG4gICAgICAsIHRodW1iUG9zaXRpb25QZXJjZW50YWdlID0gb2Zmc2V0ICogMTAwIC8gdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgICB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxMZWZ0ID0gdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgKiB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxXaWR0aCAvIDEwMDtcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl9jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIoZSkge1xuICAgIHRoaXMuX3N0YXJ0RHJhZyhlKTtcbiAgICB0aGlzLl9wcmV2UGFnZVkgPSB0aGlzLl90aHVtYlNpemVZIC0gZS5vZmZzZXRZO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlciA9IGZ1bmN0aW9uIF9jbGlja0hvcml6b250YWxUaHVtYkhhbmRsZXIoZSkge1xuICAgIHRoaXMuX3N0YXJ0RHJhZyhlKTtcbiAgICB0aGlzLl9wcmV2UGFnZVggPSB0aGlzLl90aHVtYlNpemVYIC0gZS5vZmZzZXRYO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX3N0YXJ0RHJhZyA9IGZ1bmN0aW9uIF9zdGFydERyYWcoZSkge1xuICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5fY3Vyc29yRG93biA9IHRydWU7XG4gICAgYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgW0NMQVNTTkFNRVMuZGlzYWJsZV0pO1xuICAgIHRoaXMuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50Lm9uc2VsZWN0c3RhcnQgPSBmdW5jdGlvbigpIHtyZXR1cm4gZmFsc2U7fTtcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl9tb3VzZVVwRG9jdW1lbnRIYW5kbGVyID0gZnVuY3Rpb24gX21vdXNlVXBEb2N1bWVudEhhbmRsZXIoKSB7XG4gICAgdGhpcy5fY3Vyc29yRG93biA9IGZhbHNlO1xuICAgIHRoaXMuX3ByZXZQYWdlWCA9IHRoaXMuX3ByZXZQYWdlWSA9IDA7XG4gICAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgW0NMQVNTTkFNRVMuZGlzYWJsZV0pO1xuICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50Lm9uc2VsZWN0c3RhcnQgPSBudWxsO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX21vdXNlTW92ZURvY3VtZW50SGFuZGxlciA9IGZ1bmN0aW9uIF9tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIoZSkge1xuICAgIGlmICh0aGlzLl9jdXJzb3JEb3duID09PSBmYWxzZSkge3JldHVybjt9XG5cbiAgICB2YXIgb2Zmc2V0LCB0aHVtYkNsaWNrUG9zaXRpb247XG5cbiAgICBpZiAodGhpcy5fcHJldlBhZ2VZKSB7XG4gICAgICBvZmZzZXQgPSBlLmNsaWVudFkgLSB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuICAgICAgdGh1bWJDbGlja1Bvc2l0aW9uID0gdGhpcy5fdGh1bWJTaXplWSAtIHRoaXMuX3ByZXZQYWdlWTtcblxuICAgICAgdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5fc2Nyb2xsVG9wTWF4ICogKG9mZnNldCAtIHRodW1iQ2xpY2tQb3NpdGlvbikgLyB0aGlzLl90cmFja1RvcE1heDtcblxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHJldlBhZ2VYKSB7XG4gICAgICBvZmZzZXQgPSBlLmNsaWVudFggLSB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgICAgdGh1bWJDbGlja1Bvc2l0aW9uID0gdGhpcy5fdGh1bWJTaXplWCAtIHRoaXMuX3ByZXZQYWdlWDtcblxuICAgICAgdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsTGVmdCA9IHRoaXMuX3Njcm9sbExlZnRNYXggKiAob2Zmc2V0IC0gdGh1bWJDbGlja1Bvc2l0aW9uKSAvIHRoaXMuX3RyYWNrTGVmdE1heDtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR2VtaW5pU2Nyb2xsYmFyO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5HZW1pbmlTY3JvbGxiYXIgPSBHZW1pbmlTY3JvbGxiYXI7XG4gIH1cbn0pKCk7XG4iLCIvKlxuICogQG1vZHVsZSBUZXh0R3JhZGllbnREZWZhdWx0XG4gKiB0ZXh0LWdyYWRpZW50IHYwLjIuMFxuICovXG4oZnVuY3Rpb24oZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5UZXh0R3JhZGllbnREZWZhdWx0ID0gZmFjdG9yeSgpO1xuICAgIH1cbn0oZnVuY3Rpb24gZmFjdG9yeSgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgX193cmFwcGVyRWxlbWVudCA6IG51bGwsXG5cbiAgICAgICAgLyogSW5pdGlhbGl6ZS5cbiAgICAgICAgICogQG1ldGhvZCBfaW5pdCA8cHJpdmF0ZSwgYWJzdHJhY3Q+XG4gICAgICAgICAqL1xuICAgICAgICBfaW5pdCA6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgICAgICAgdGhpcy5fX3dyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbmNsdWRlKHRoaXMuX193cmFwcGVyRWxlbWVudC5zdHlsZSwge1xuICAgICAgICAgICAgICAgIGRpc3BsYXkgOiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICBjb2xvciA6IHRoaXMub3B0aW9ucy5mYWxsYmFja0NvbG9yIHx8IHRoaXMub3B0aW9ucy50byxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kIDogJy13ZWJraXQtbGluZWFyLWdyYWRpZW50KCcgKyB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uICsgJywgJyArIHRoaXMub3B0aW9ucy50byArICcsJyArIHRoaXMub3B0aW9ucy5mcm9tICsgJyknLFxuICAgICAgICAgICAgICAgIHdlYmtpdEJhY2tncm91bmRDbGlwIDogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHdlYmtpdFRleHRGaWxsQ29sb3IgOiAndHJhbnNwYXJlbnQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0KHRoaXMub3B0aW9ucy50ZXh0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fd3JhcHBlckVsZW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIEltcGxlbWVudGF0aW9uIHRvIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50cyBvZiB0aGlzLmVsZW1lbnQga2VlcGluZyB0aGUgZ3JhZGllbnQgaW50YWN0LlxuICAgICAgICAgKiBAbWV0aG9kIHVwZGF0ZVRleHQgPHB1YmxpYywgYWJzdHJhY3Q+IFtGdW5jdGlvbl1cbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVRleHQgOiBmdW5jdGlvbiB1cGRhdGVUZXh0KHRleHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdUZXh0R3JhZGllbnQ6IGNhbGxpbmcgb24gZGVzdHJveWVkIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9fd3JhcHBlckVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLm9wdGlvbnMudGV4dCA9IHRleHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogSW1wbGVtZW50YXRpb24gdG8gcmVtb3ZlIHRoZSBncmFkaWVudCBhbmQgY3JlYXRlZCBlbGVtZW50cy5cbiAgICAgICAgICogQG1ldGhvZCBkZXN0cm95IDxwdWJsaWMsIGFic3RyYWN0PiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95IDogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdUZXh0R3JhZGllbnQ6IGNhbGxpbmcgb24gZGVzdHJveWVkIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy50ZXh0O1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufSkpO1xuIiwiLypcbiAqIEBtb2R1bGUgVGV4dEdyYWRpZW50U1ZHXG4gKiB0ZXh0LWdyYWRpZW50IHYwLjIuMFxuICovXG4oZnVuY3Rpb24oZmFjdG9yeSkgeyAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuVGV4dEdyYWRpZW50U1ZHID0gZmFjdG9yeSgpO1xuICAgIH1cbn0oZnVuY3Rpb24gZmFjdG9yeSgpIHsgJ3VzZSBzdHJpY3QnO1xuICAgICByZXR1cm4ge1xuICAgICAgICBfX3dyYXBwZXJFbGVtZW50IDogbnVsbCxcbiAgICAgICAgX190ZXh0RWxlbWVudCA6IG51bGwsXG4gICAgICAgIF9fbWFza2VkQ2xvbmUgOiBudWxsLFxuXG4gICAgICAgIC8qIEluaXRpYWxpemUuXG4gICAgICAgICAqIEBtZXRob2QgX2luaXQgPHByaXZhdGUsIGFic3RyYWN0PlxuICAgICAgICAgKi9cbiAgICAgICAgX2luaXQgOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHRoaXMuX190ZXh0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICAgICAgICAgICAgdGhpcy5faW5jbHVkZSh0aGlzLl9fd3JhcHBlckVsZW1lbnQuc3R5bGUsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA6ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgZGlzcGxheSA6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgIGNvbG9yIDogdGhpcy5vcHRpb25zLmZhbGxiYWNrQ29sb3IgfHwgdGhpcy5vcHRpb25zLnRvLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX19jcmVhdGVHcmFkaWVudCgpO1xuICAgICAgICAgICAgdGhpcy5fX2NyZWF0ZU1hc2tlZENsb25lKCk7XG4gICAgICAgICAgICB0aGlzLl9fd3JhcHBlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3RleHRFbGVtZW50KTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0KHRoaXMub3B0aW9ucy50ZXh0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fd3JhcHBlckVsZW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIENyZWF0ZXMgdGhlIFNWRyBNYXNrIGFuZCBHcmFkaWVudCB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgZWxlbWVudC5cbiAgICAgICAgICogQG1ldGhvZCBfX2NyZWF0ZUdyYWRpZW50IDxwcml2YXRlPiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICBfX2NyZWF0ZUdyYWRpZW50IDogZnVuY3Rpb24gX19jcmVhdGVHcmFkaWVudCgpIHtcbiAgICAgICAgICAgIHZhciBzdmdNYXNrU3RyaW5nID0gXCJcIiArXG4gICAgICAgICAgICAgICAgXCI8bWFzayBpZD0ndGctbWFzay1cIiArIHRoaXMuX2lkICtcIicgIG1hc2tDb250ZW50VW5pdHM9J29iamVjdEJvdW5kaW5nQm94Jz5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGxpbmVhckdyYWRpZW50IGlkPSd0Zy1saW5lYXItXCIrIHRoaXMuX2lkICtcIicge2Nvb3Jkc30+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8c3RvcCBzdG9wLWNvbG9yPSd3aGl0ZScgb2Zmc2V0PScwJy8+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8c3RvcCBzdG9wLWNvbG9yPSd3aGl0ZScgc3RvcC1vcGFjaXR5PScwJyBvZmZzZXQ9JzEnLz5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPC9saW5lYXJHcmFkaWVudD5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzEnIGhlaWdodD0nMScgZmlsbD0ndXJsKCN0Zy1saW5lYXItXCIrIHRoaXMuX2lkICtcIiknLz5cIiArXG4gICAgICAgICAgICAgICAgXCI8L21hc2s+XCI7XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzogc3ZnTWFza1N0cmluZyA9IHN2Z01hc2tTdHJpbmcucmVwbGFjZSgve2Nvb3Jkc30vLCBcIngxPScwJyB4Mj0nMCcgeTE9JzEnIHkyPScwJ1wiKTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzogc3ZnTWFza1N0cmluZyA9IHN2Z01hc2tTdHJpbmcucmVwbGFjZSgve2Nvb3Jkc30vLCBcIngxPScwJyB4Mj0nMCcgeTE9JzAnIHkyPScxJ1wiKTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6IHN2Z01hc2tTdHJpbmcgPSBzdmdNYXNrU3RyaW5nLnJlcGxhY2UoL3tjb29yZHN9LywgXCJ4MT0nMScgeDI9JzAnIHkxPScwJyB5Mj0nMCdcIik7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHN2Z01hc2tTdHJpbmcgPSBzdmdNYXNrU3RyaW5nLnJlcGxhY2UoL3tjb29yZHN9LywgXCJ4MT0nMCcgeDI9JzEnIHkxPScwJyB5Mj0nMCdcIik7IGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdmdEZWZzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIHN2Z01hc2tTdHJpbmcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIENyZWF0ZXMgYSBuZXcgZWxlbWVudCB0byBhcHBseSB0aGUgbWFza2luZy5cbiAgICAgICAgICogQG1ldGhvZCBfX2NyZWF0ZU1hc2tlZENsb25lIDxwcml2YXRlPiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICBfX2NyZWF0ZU1hc2tlZENsb25lIDogZnVuY3Rpb24gX19jcmVhdGVNYXNrZWRDbG9uZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX19tYXNrZWRDbG9uZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICAgICAgICAgICAgdGhpcy5faW5jbHVkZSh0aGlzLl9fbWFza2VkQ2xvbmUuc3R5bGUsIHtcbiAgICAgICAgICAgICAgICBtYXNrIDogJ3VybCgjdGctbWFzay0nICsgdGhpcy5faWQgKycpJyxcbiAgICAgICAgICAgICAgICBjb2xvciA6IHRoaXMub3B0aW9ucy5mcm9tLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICBsZWZ0IDogMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9fd3JhcHBlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX21hc2tlZENsb25lKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiBJbXBsZW1lbnRhdGlvbiB0byB1cGRhdGUgdGhlIHRleHQgY29udGVudHMgb2YgdGhpcy5lbGVtZW50IGtlZXBpbmcgdGhlIGdyYWRpZW50IGludGFjdC5cbiAgICAgICAgICogQG1ldGhvZCB1cGRhdGVUZXh0IDxwdWJsaWMsIGFic3RyYWN0PiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVUZXh0IDogZnVuY3Rpb24gdXBkYXRlVGV4dCh0ZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignVGV4dEdyYWRpZW50OiBjYWxsaW5nIG9uIGRlc3Ryb3llZCBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRleHQgPSB0ZXh0O1xuICAgICAgICAgICAgdGhpcy5fX3RleHRFbGVtZW50LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIHRoaXMuX19tYXNrZWRDbG9uZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICB9LFxuXG4gICAgICAgIC8qIEltcGxlbWVudGF0aW9uIHRvIHJlbW92ZSB0aGUgZ3JhZGllbnQgYW5kIGNyZWF0ZWQgZWxlbWVudHMuXG4gICAgICAgICAqIEBtZXRob2QgZGVzdHJveSA8cHVibGljLCBhYnN0cmFjdD4gW0Z1bmN0aW9uXVxuICAgICAgICAgKi9cbiAgICAgICAgZGVzdHJveSA6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignVGV4dEdyYWRpZW50OiBjYWxsaW5nIG9uIGRlc3Ryb3llZCBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN2Z01hc2tFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RnLW1hc2stJyArIHRoaXMuX2lkKTtcbiAgICAgICAgICAgIHRoaXMuX3N2Z0RlZnNDb250YWluZXIucmVtb3ZlQ2hpbGQoc3ZnTWFza0VsZW1lbnQpO1xuXG4gICAgICAgICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMub3B0aW9ucy50ZXh0O1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX193cmFwcGVyRWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9fdGV4dEVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fX21hc2tlZENsb25lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3N2Z0RlZnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICB9O1xufSkpO1xuIiwiLyoqXG4gKiB0ZXh0LWdyYWRpZW50IHYwLjIuMFxuICogaHR0cHM6Ly9naXRodWIuY29tL25vZWxkZWxnYWRvL3RleHQtZ3JhZGllbnRcbiAqIExpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICAgICAgcmVxdWlyZSgnLi90ZXh0LWdyYWRpZW50LWRlZmF1bHQnKSxcbiAgICAgICAgICAgIHJlcXVpcmUoJy4vdGV4dC1ncmFkaWVudC1zdmcnKVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5UZXh0R3JhZGllbnQgPSBmYWN0b3J5KFxuICAgICAgICAgICAgd2luZG93LlRleHRHcmFkaWVudERlZmF1bHQsXG4gICAgICAgICAgICB3aW5kb3cuVGV4dEdyYWRpZW50U1ZHXG4gICAgICAgICk7XG4gICAgfVxufShmdW5jdGlvbiBmYWN0b3J5KFRleHRHcmFkaWVudERlZmF1bHQsIFRleHRHcmFkaWVudFNWRykge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBUZXh0R3JhZGllbnQudmVyc2lvbiA9ICcwLjIuMCc7XG5cbiAgICAvKiBJbnN0YW5jZXMgaWQgY291bnRlciwgaW5jcmVhc2VkIGJ5IHRoZSBjb25zdHJ1Y3RvciBDbGFzcy5cbiAgICAgKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgZm9yIHRoZSBTVkcgaW1wbGVtZW50YXRpb24uXG4gICAgICogQHByb3BlcnR5IF9pZCA8cHJvdGVjdGVkLCBzdGF0aWM+IFtOdW1iZXJdXG4gICAgICovXG4gICAgVGV4dEdyYWRpZW50Ll9pZCA9IDA7XG5cbiAgICAvKiBIb2xkcyB0aGUgaW1wbGVtZW50YXRpb24gT2JqZWN0IHRvIGJlIGluY2x1ZGVkIHRvIHRoZSBtYWluIENsYXNzLlxuICAgICAqIEBwcm9wZXJ0eSBfaW1wbGVtZW50YXRpb24gPHByb3RlY3RlZCwgc3RhdGljPiBbT2JqZWN0XSBUZXh0R3JhZGllbnREZWZhdWx0XG4gICAgICovXG4gICAgVGV4dEdyYWRpZW50Ll9pbXBsZW1lbnRhdGlvbiA9IFRleHRHcmFkaWVudERlZmF1bHQ7XG5cbiAgICAvKiBDaGVja3MgaWYgdGhlIGltcGxlbWVudGF0aW9uIG5lZWRzIHRvIGJlIGNoYW5nZWQuXG4gICAgICogQG1ldGhvZCBfdXBkYXRlSW1wbGVtZW50YXRpb24gPHByb3RlY3RlZCwgc3RhdGljPiBbRnVuY3Rpb25dXG4gICAgICovXG4gICAgVGV4dEdyYWRpZW50Ll91cGRhdGVJbXBsZW1lbnRhdGlvbiA9IGZ1bmN0aW9uIF91cGRhdGVJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgaWYgKCgnV2Via2l0VGV4dEZpbGxDb2xvcicgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2ltcGxlbWVudGF0aW9uID0gVGV4dEdyYWRpZW50U1ZHO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBcIjxzdmcgaWQ9J3RnLXN2Zy1jb250YWluZXInIGhlaWdodD0nMCcgd2lkdGg9JzAnIHN0eWxlPSdwb3NpdGlvbjphYnNvbHV0ZSc+PGRlZnM+PC9kZWZzPjwvc3ZnPlwiKTtcbiAgICAgICAgICAgIHRoaXMuX3N2Z0RlZnNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGctc3ZnLWNvbnRhaW5lcicpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkZWZzJylbMF07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgVGV4dEdyYWRpZW50Ll9zdmdEZWZzQ29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qIE1lcmdlIHRoZSBjb250ZW50cyBvZiB0d28gb3IgbW9yZSBvYmplY3RzIHRvZ2V0aGVyIGludG8gdGhlIGZpcnN0IG9iamVjdC5cbiAgICAgKiBAaGVscGVyIF9pbmNsdWRlIDxwcml2YXRlPiBbRnVuY3Rpb25dXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2luY2x1ZGUoYSwgYikge1xuICAgICAgICB2YXIgcHJvcGVydHk7XG4gICAgICAgIGZvciAocHJvcGVydHkgaW4gYikge1xuICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgYVtwcm9wZXJ0eV0gPSBiW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICAvKiBNYWluIENsYXNzLiBIb2xkcyB0aGUgYmVoYXZpb3VyIHRoYXQgY2FuIHJ1biBvbiBhbGwgaW1wbGVtZW50YXRpb25zLlxuICAgICAqIFRoaXMgY2xhc3MgYWxsb3dzIHRvIGV4dGVuZCB0aGUgYmVoYXZpb3IgdGhyb3VnaCBhIHN0cmF0ZWd5IG9mIG1vZHVsZSBpbmNsdXNpb24uXG4gICAgICogVGhhdCBpcyB0aGF0IG9uY2UgZmVhdHVyZSBzdXBwb3J0IGlzIGRldGVybWluZWQsIHRoZSBtb2R1bGUgdGhhdCBob2xkcyB0aGUgc3BlY2lmaWMgYmVoYXZpb3VyIGlzIGluY2x1ZGVkIGludG8gdGhlIGNsYXNzLlxuICAgICAqIEBhcmd1bWVudCBlbGVtZW50IDxyZXF1aXJlZD4gW05vZGVFbGVtZW50XSAodW5kZWZpbmVkKSBFbGVtZW50IHRvIGFwcGx5IHRoZSB0ZXh0IGdyYWRpZW50IGVmZmVjdC5cbiAgICAgKiBAYXJndW1lbnQgb3B0aW9ucyA8b3B0aW9uYWw+IFtPYmplY3RdIChzZWUgZGVmYXVsdHMpIEdyYWRpZW50IGNvbG9yLXN0b3BzLCBncmFkaWVudC1kaXJlY3Rpb24sIHRleHQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gVGV4dEdyYWRpZW50KGVsZW1lbnQsIGNvbmZpZykge1xuICAgICAgICBpZiAoKGVsZW1lbnQubm9kZVR5cGUgPiAwKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGV4dEdyYWRpZW50IFtjb25zdHJ1Y3Rvcl06IFwiZWxlbWVudFwiIHBhcmFtIHNob3VsZCBiZSBhIE5vZGVFbGVtZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2lkID0gVGV4dEdyYWRpZW50Ll9pZCsrO1xuICAgICAgICB0aGlzLl9zdmdEZWZzQ29udGFpbmVyID0gVGV4dEdyYWRpZW50Ll9zdmdEZWZzQ29udGFpbmVyO1xuICAgICAgICB0aGlzLl9pbmNsdWRlID0gX2luY2x1ZGU7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gX2luY2x1ZGUoe1xuICAgICAgICAgICAgdGV4dCA6IHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCxcbiAgICAgICAgICAgIGZyb20gOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgdG8gOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgZGlyZWN0aW9uIDogJ3JpZ2h0JyxcbiAgICAgICAgICAgIGZhbGxiYWNrQ29sb3IgOiAnJ1xuICAgICAgICB9LCBjb25maWcpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgVGV4dEdyYWRpZW50LnByb3RvdHlwZSA9IHtcbiAgICAgICAgX2Rlc3Ryb3llZCA6IGZhbHNlLFxuXG4gICAgICAgIC8qIEluaXRpYWxpemUuXG4gICAgICAgICAqIEFsbCBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGluY2x1ZGUgdGhpcyBtZXRob2QuXG4gICAgICAgICAqIEBtZXRob2QgX2luaXQgPHByaXZhdGUsIGFic3RyYWN0PlxuICAgICAgICAgKi9cbiAgICAgICAgX2luaXQgOiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGV4dEdyYWRpZW50LnByb3RvdHlwZS5faW5pdCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiBJbXBsZW1lbnRhdGlvbiB0byB1cGRhdGUgdGhlIHRleHQgY29udGVudHMgb2YgdGhpcy5lbGVtZW50IGtlZXBpbmcgdGhlIGdyYWRpZW50IGludGFjdC5cbiAgICAgICAgICogQWxsIGltcGxlbWVudGF0aW9ucyBzaG91bGQgaW5jbHVkZSB0aGlzIG1ldGhvZC5cbiAgICAgICAgICogQG1ldGhvZCB1cGRhdGVUZXh0IDxwdWJsaWMsIGFic3RyYWN0PiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVUZXh0IDogZnVuY3Rpb24gdXBkYXRlVGV4dCgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGV4dEdyYWRpZW50LnByb3RvdHlwZS51cGRhdGUgbm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogSW1wbGVtZW50YXRpb24gdG8gcmVtb3ZlIHRoZSBncmFkaWVudCBhbmQgY3JlYXRlZCBlbGVtZW50cy5cbiAgICAgICAgICogQWxsIGltcGxlbWVudGF0aW9ucyBzaG91bGQgaW5jbHVkZSB0aGlzIG1ldGhvZC5cbiAgICAgICAgICogQG1ldGhvZCBkZXN0cm95IDxwdWJsaWMsIGFic3RyYWN0PiBbRnVuY3Rpb25dXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95IDogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGV4dEdyYWRpZW50LnByb3BlcnRpZXMuZGVzdHJveSBub3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBTZXRzIHRoZSBpbXBsZW1lbnRhdGlvbiBhbmQgaW5jbHVkZXMgaXRzIG1ldGhvZHMvcHJvcGVydGllcyAqL1xuICAgIFRleHRHcmFkaWVudC5fdXBkYXRlSW1wbGVtZW50YXRpb24oKTtcbiAgICBfaW5jbHVkZShUZXh0R3JhZGllbnQucHJvdG90eXBlLCBUZXh0R3JhZGllbnQuX2ltcGxlbWVudGF0aW9uKTtcblxuICAgIHJldHVybiBUZXh0R3JhZGllbnQ7XG59KSk7XG4iLCIvKipcbiAqIHNoYXJlLXVybCB2MS4wLjBcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2VsZGVsZ2Fkby9zaGFyZS11cmxcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290KTtcbiAgICBlbHNlIHJvb3QuU2hhcmVVcmwgPSBmYWN0b3J5KHJvb3QpO1xufSh0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KHJvb3QpIHtcbiAgICB2YXIgRU5EUE9JTlRTID0ge1xuICAgICAgICBmYWNlYm9vayAgICA6ICdodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/JyxcbiAgICAgICAgdHdpdHRlciAgICAgOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZT8nLFxuICAgICAgICBnb29nbGVQbHVzICA6ICdodHRwczovL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT8nLFxuICAgICAgICBwaW50ZXJlc3QgICA6ICdodHRwczovL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vPycsXG4gICAgICAgIHJlZGRpdCAgICAgIDogJ2h0dHA6Ly93d3cucmVkZGl0LmNvbS9zdWJtaXQ/JyxcbiAgICAgICAgZGVsaWNpb3VzICAgOiAnaHR0cHM6Ly9kZWxpY2lvdXMuY29tL3NhdmU/JyxcbiAgICAgICAgbGlua2VkaW4gICAgOiAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3NoYXJlQXJ0aWNsZT8nXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGZhY2Vib29rICAgIDogZmFjZWJvb2ssXG4gICAgICAgIHR3aXR0ZXIgICAgIDogdHdpdHRlcixcbiAgICAgICAgZ29vZ2xlUGx1cyAgOiBnb29nbGVQbHVzLFxuICAgICAgICBwaW50ZXJlc3QgICA6IHBpbnRlcmVzdCxcbiAgICAgICAgcmVkZGl0ICAgICAgOiByZWRkaXQsXG4gICAgICAgIGRlbGljaW91cyAgIDogZGVsaWNpb3VzLFxuICAgICAgICBsaW5rZWRpbiAgICA6IGxpbmtlZGluLFxuICAgICAgICBlbWFpbCAgICAgICA6IGVtYWlsXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkYXRhIHx8IHt9KS5tYXAoZnVuY3Rpb24ocHJvcGVydHlOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlOYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIH0pLmpvaW4oJyYnKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSBzaGFyZSBvbiBmYWNlYm9vayB1cmwgc3RyaW5nLlxuICAgICAqIEBhcmd1bWVudCBkYXRhIFtPYmplY3RdIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS51IFtTdHJpbmddIDxyZXF1aXJlZD5cbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZhY2Vib29rKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEVORFBPSU5UUy5mYWNlYm9vayArIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSBzaGFyZSBvbiB0d2l0dGVyIHVybCBzdHJpbmcuXG4gICAgICogQGFyZ3VtZW50IGRhdGEgW09iamVjdF0gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnRleHQgW1N0cmluZ10gPG9wdGlvbmFsPiBQcmUtcG9wdWxhdGVkIHRleHQgaGlnaGxpZ2h0ZWQgaW4gdGhlIFR3ZWV0IGNvbXBvc2VyLlxuICAgICAqIEBhcmd1bWVudCBkYXRhLmluX3JlcGx5X3RvIFtTdHJpbmddIDxvcHRpb25hbD4gU3RhdHVzIElEIHN0cmluZyBvZiBhIHBhcmVudCBUd2VldCBzdWNoIGFzIGEgVHdlZXQgZnJvbSB5b3VyIGFjY291bnQgKGlmIGFwcGxpY2FibGUpLlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnVybCBbU3RyaW5nXSA8b3B0aW9uYWw+IFVSTCBpbmNsdWRlZCB3aXRoIHRoZSBUd2VldC5cbiAgICAgKiBAYXJndW1lbnQgZGF0YS5oYXNodGFncyBbU3RyaW5nXSA8b3B0aW9uYWw+IEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgaGFzaHRhZ3MgdG8gYmUgYXBwZW5kZWQgdG8gZGVmYXVsdCBUd2VldCB0ZXh0LlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnZpYSBbU3RyaW5nXSA8b3B0aW9uYWw+IEF0dHJpYnV0ZSB0aGUgc291cmNlIG9mIGEgVHdlZXQgdG8gYSBUd2l0dGVyIHVzZXJuYW1lLlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnJlbGF0ZWQgW1N0cmluZ10gPG9wdGlvbmFsPiBBIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGFjY291bnRzIHJlbGF0ZWQgdG8gdGhlIGNvbnRlbnQgb2YgdGhlIHNoYXJlZCBVUkkuXG4gICAgICogQGluZm8gaHR0cHM6Ly9kZXYudHdpdHRlci5jb20vd2ViL3R3ZWV0LWJ1dHRvbi9wYXJhbWV0ZXJzXG4gICAgICogQHJldHVybiB1cmxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0d2l0dGVyKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEVORFBPSU5UUy50d2l0dGVyICsgX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpO1xuICAgIH1cblxuICAgIC8qIENvbXBvc2UgdGhlIHNoYXJlIG9uIGdvb2dsZSsgdXJsIHN0cmluZy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudXJsIFtTdHJpbmddIDxyZXF1aXJlZD4gVGhlIFVSTCBvZiB0aGUgcGFnZSB0byBzaGFyZS5cbiAgICAgKiBAaW5mbyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS8rL3dlYi9zaGFyZS9cbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdvb2dsZVBsdXMoZGF0YSkge1xuICAgICAgICByZXR1cm4gRU5EUE9JTlRTLmdvb2dsZVBsdXMgKyBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgfVxuXG4gICAgLyogQ29tcG9zZSB0aGUgc2hhcmUgb24gcGludGVyZXN0IHVybCBzdHJpbmcuXG4gICAgICogQGFyZ3VtZW50IGRhdGEgW09iamVjdF0gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnVybCA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEubWVkaWEgPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBkYXRhLmRlc2NyaXB0aW9uIDxyZXF1aXJlZD5cbiAgICAgKiBAaW5mbyBodHRwczovL2RldmVsb3BlcnMucGludGVyZXN0LmNvbS9waW5faXQvXG4gICAgICogQHJldHVybiB1cmxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwaW50ZXJlc3QoZGF0YSkge1xuICAgICAgICByZXR1cm4gRU5EUE9JTlRTLnBpbnRlcmVzdCArIF9nZW5lcmF0ZVVybFBhcmFtcyhkYXRhKTtcbiAgICB9XG5cbiAgICAvKiBDb21wb3NlIHRoZSBzdWJtaXQgdG8gcmVkZGl0IHVybCBzdHJpbmcuXG4gICAgICogQGFyZ3VtZW50IGRhdGEgW09iamVjdF0gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBkYXRhLnVybCA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudGl0bGUgPG9wdGlvbmFsPlxuICAgICAqIEBpbmZvIGh0dHA6Ly93d3cucmVkZGl0LmNvbS9idXR0b25zL1xuICAgICAqIEByZXR1cm4gdXJsXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVkZGl0KGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEVORFBPSU5UUy5yZWRkaXQgKyBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgfVxuXG4gICAgLyogQ29tcG9zZSB0aGUgdXJsIHN0cmluZyB0byBwb3N0IG9uIGRlbGljaW91cy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IHVybCBbU3RyaW5nXSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IHRpdGxlIFtTdHJpbmddIDxvcHRpb25hbD5cbiAgICAgKiBAaW5mbyBodHRwczovL2RlbGljaW91cy5jb20vdG9vbHNcbiAgICAgKiBAcmV0dXJuIHVybFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlbGljaW91cyhkYXRhKSB7XG4gICAgICAgIHJldHVybiBFTkRQT0lOVFMuZGVsaWNpb3VzICsgX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpO1xuICAgIH1cblxuICAgIC8qIENvbXBvc2UgdGhlIHNoYXJlIGFydGljbGUgb24gbGlua2VkaW4gdXJsIHN0cmluZy5cbiAgICAgKiBAYXJndW1lbnQgZGF0YSBbT2JqZWN0XSA8cmVxdWlyZWQ+XG4gICAgICogQGFyZ3VtZW50IGRhdGEudXJsIFtTdHJpbmcsIDEwMjRdIDxyZXF1aXJlZD4gVGhlIHVybC1lbmNvZGVkIFVSTCBvZiB0aGUgcGFnZSB0aGF0IHlvdSB3aXNoIHRvIHNoYXJlLlxuICAgICAqIEBhcmd1bWVudCBkYXRhLm1pbmkgW0Jvb2xlYW5dIDxyZXF1aXJlZD4gQSByZXF1aXJlZCBhcmd1bWVudCB3aG8ncyB2YWx1ZSBtdXN0IGFsd2F5cyBiZTogdHJ1ZVxuICAgICAqIEBhcmd1bWVudCB0aXRsZSBbU3RyaW5nLCAyMDBdIDxvcHRpb25hbD4gVGhlIHVybC1lbmNvZGVkIHRpdGxlIHZhbHVlIHRoYXQgeW91IHdpc2ggeW91IHVzZS5cbiAgICAgKiBAYXJndW1lbnQgc3VtbWFyeSBbU3RyaW5nLCAyNTZdIDxvcHRpb25hbD4gVGhlIHVybC1lbmNvZGVkIGRlc2NyaXB0aW9uIHRoYXQgeW91IHdpc2ggeW91IHVzZS5cbiAgICAgKiBAYXJndW1lbnQgc291cmNlIFtTdHJpbmcsIDIwMF0gPG9wdGlvbmFsPiBUaGUgdXJsLWVuY29kZWQgc291cmNlIG9mIHRoZSBjb250ZW50IChlLmcuIHlvdXIgd2Vic2l0ZSBvciBhcHBsaWNhdGlvbiBuYW1lKVxuICAgICAqIEBpbmZvIGh0dHBzOi8vZGV2ZWxvcGVyLmxpbmtlZGluLmNvbS9kb2NzL3NoYXJlLW9uLWxpbmtlZGluXG4gICAgICogQHJldHVybiB1cmxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaW5rZWRpbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBFTkRQT0lOVFMubGlua2VkaW4gKyBfZ2VuZXJhdGVVcmxQYXJhbXMoZGF0YSk7XG4gICAgfVxuXG4gICAgLyogQ29tcG9zZSB0aGUgc2VuZCBlbWFpbCB1cmwgc3RyaW5nLlxuICAgICAqIEBhcmd1bWVudCBkYXRhIFtPYmplY3RdIDxyZXF1aXJlZD5cbiAgICAgKiBAYXJndW1lbnQgdG8gW1N0cmluZ10gPHJlcXVpcmVkPlxuICAgICAqIEBhcmd1bWVudCBzdWJqZWN0IFtTdHJpbmddIDxvcHRpb25hbD5cbiAgICAgKiBAYXJndW1lbnQgY2MgW1N0cmluZ10gPG9wdGlvbmFsPlxuICAgICAqIEBhcmd1bWVudCBiY2MgW1N0cmluZ10gPG9wdGlvbmFsPlxuICAgICAqIEBhcmd1bWVudCBib2R5IFtTdHJpbmddIDxvcHRpb25hbD5cbiAgICAgKiBAaW5mbyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9IVE1ML0VtYWlsX2xpbmtzXG4gICAgICogQHJldHVybiB1cmxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbWFpbChkYXRhKSB7XG4gICAgICAgIHZhciB0byA9IGRhdGEudG87XG4gICAgICAgIGRlbGV0ZSBkYXRhLnRvO1xuICAgICAgICB2YXIgcGFyYW1zID0gX2dlbmVyYXRlVXJsUGFyYW1zKGRhdGEpO1xuICAgICAgICByZXR1cm4gJ21haWx0bzonICsgKHBhcmFtcy5sZW5ndGggPyAodG8gKyAnPycgKyBwYXJhbXMpIDogdG8pO1xuICAgIH1cbn0pKTtcbiIsIi8qKlxuICogVHdlZW4uanMgLSBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS90d2VlbmpzL3R3ZWVuLmpzXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2VlbmpzL3R3ZWVuLmpzL2dyYXBocy9jb250cmlidXRvcnMgZm9yIHRoZSBmdWxsIGxpc3Qgb2YgY29udHJpYnV0b3JzLlxuICogVGhhbmsgeW91IGFsbCwgeW91J3JlIGF3ZXNvbWUhXG4gKi9cblxudmFyIFRXRUVOID0gVFdFRU4gfHwgKGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgX3R3ZWVucyA9IFtdO1xuXG5cdHJldHVybiB7XG5cblx0XHRnZXRBbGw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0cmV0dXJuIF90d2VlbnM7XG5cblx0XHR9LFxuXG5cdFx0cmVtb3ZlQWxsOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdF90d2VlbnMgPSBbXTtcblxuXHRcdH0sXG5cblx0XHRhZGQ6IGZ1bmN0aW9uICh0d2Vlbikge1xuXG5cdFx0XHRfdHdlZW5zLnB1c2godHdlZW4pO1xuXG5cdFx0fSxcblxuXHRcdHJlbW92ZTogZnVuY3Rpb24gKHR3ZWVuKSB7XG5cblx0XHRcdHZhciBpID0gX3R3ZWVucy5pbmRleE9mKHR3ZWVuKTtcblxuXHRcdFx0aWYgKGkgIT09IC0xKSB7XG5cdFx0XHRcdF90d2VlbnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKHRpbWUsIHByZXNlcnZlKSB7XG5cblx0XHRcdGlmIChfdHdlZW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0dGltZSA9IHRpbWUgIT09IHVuZGVmaW5lZCA/IHRpbWUgOiBUV0VFTi5ub3coKTtcblxuXHRcdFx0d2hpbGUgKGkgPCBfdHdlZW5zLmxlbmd0aCkge1xuXG5cdFx0XHRcdGlmIChfdHdlZW5zW2ldLnVwZGF0ZSh0aW1lKSB8fCBwcmVzZXJ2ZSkge1xuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfdHdlZW5zLnNwbGljZShpLCAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXHR9O1xuXG59KSgpO1xuXG5cbi8vIEluY2x1ZGUgYSBwZXJmb3JtYW5jZS5ub3cgcG9seWZpbGwuXG4vLyBJbiBub2RlLmpzLCB1c2UgcHJvY2Vzcy5ocnRpbWUuXG5pZiAodHlwZW9mICh3aW5kb3cpID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgKHByb2Nlc3MpICE9PSAndW5kZWZpbmVkJykge1xuXHRUV0VFTi5ub3cgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHRpbWUgPSBwcm9jZXNzLmhydGltZSgpO1xuXG5cdFx0Ly8gQ29udmVydCBbc2Vjb25kcywgbmFub3NlY29uZHNdIHRvIG1pbGxpc2Vjb25kcy5cblx0XHRyZXR1cm4gdGltZVswXSAqIDEwMDAgKyB0aW1lWzFdIC8gMTAwMDAwMDtcblx0fTtcbn1cbi8vIEluIGEgYnJvd3NlciwgdXNlIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgaWYgaXQgaXMgYXZhaWxhYmxlLlxuZWxzZSBpZiAodHlwZW9mICh3aW5kb3cpICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgd2luZG93LnBlcmZvcm1hbmNlICE9PSB1bmRlZmluZWQgJiZcblx0XHQgd2luZG93LnBlcmZvcm1hbmNlLm5vdyAhPT0gdW5kZWZpbmVkKSB7XG5cdC8vIFRoaXMgbXVzdCBiZSBib3VuZCwgYmVjYXVzZSBkaXJlY3RseSBhc3NpZ25pbmcgdGhpcyBmdW5jdGlvblxuXHQvLyBsZWFkcyB0byBhbiBpbnZvY2F0aW9uIGV4Y2VwdGlvbiBpbiBDaHJvbWUuXG5cdFRXRUVOLm5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3aW5kb3cucGVyZm9ybWFuY2UpO1xufVxuLy8gVXNlIERhdGUubm93IGlmIGl0IGlzIGF2YWlsYWJsZS5cbmVsc2UgaWYgKERhdGUubm93ICE9PSB1bmRlZmluZWQpIHtcblx0VFdFRU4ubm93ID0gRGF0ZS5ub3c7XG59XG4vLyBPdGhlcndpc2UsIHVzZSAnbmV3IERhdGUoKS5nZXRUaW1lKCknLlxuZWxzZSB7XG5cdFRXRUVOLm5vdyA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdH07XG59XG5cblxuVFdFRU4uVHdlZW4gPSBmdW5jdGlvbiAob2JqZWN0KSB7XG5cblx0dmFyIF9vYmplY3QgPSBvYmplY3Q7XG5cdHZhciBfdmFsdWVzU3RhcnQgPSB7fTtcblx0dmFyIF92YWx1ZXNFbmQgPSB7fTtcblx0dmFyIF92YWx1ZXNTdGFydFJlcGVhdCA9IHt9O1xuXHR2YXIgX2R1cmF0aW9uID0gMTAwMDtcblx0dmFyIF9yZXBlYXQgPSAwO1xuXHR2YXIgX3JlcGVhdERlbGF5VGltZTtcblx0dmFyIF95b3lvID0gZmFsc2U7XG5cdHZhciBfaXNQbGF5aW5nID0gZmFsc2U7XG5cdHZhciBfcmV2ZXJzZWQgPSBmYWxzZTtcblx0dmFyIF9kZWxheVRpbWUgPSAwO1xuXHR2YXIgX3N0YXJ0VGltZSA9IG51bGw7XG5cdHZhciBfZWFzaW5nRnVuY3Rpb24gPSBUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmU7XG5cdHZhciBfaW50ZXJwb2xhdGlvbkZ1bmN0aW9uID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5MaW5lYXI7XG5cdHZhciBfY2hhaW5lZFR3ZWVucyA9IFtdO1xuXHR2YXIgX29uU3RhcnRDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcblx0dmFyIF9vblVwZGF0ZUNhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uU3RvcENhbGxiYWNrID0gbnVsbDtcblxuXHR0aGlzLnRvID0gZnVuY3Rpb24gKHByb3BlcnRpZXMsIGR1cmF0aW9uKSB7XG5cblx0XHRfdmFsdWVzRW5kID0gcHJvcGVydGllcztcblxuXHRcdGlmIChkdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRfZHVyYXRpb24gPSBkdXJhdGlvbjtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuc3RhcnQgPSBmdW5jdGlvbiAodGltZSkge1xuXG5cdFx0VFdFRU4uYWRkKHRoaXMpO1xuXG5cdFx0X2lzUGxheWluZyA9IHRydWU7XG5cblx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcblxuXHRcdF9zdGFydFRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogVFdFRU4ubm93KCk7XG5cdFx0X3N0YXJ0VGltZSArPSBfZGVsYXlUaW1lO1xuXG5cdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gX3ZhbHVlc0VuZCkge1xuXG5cdFx0XHQvLyBDaGVjayBpZiBhbiBBcnJheSB3YXMgcHJvdmlkZWQgYXMgcHJvcGVydHkgdmFsdWVcblx0XHRcdGlmIChfdmFsdWVzRW5kW3Byb3BlcnR5XSBpbnN0YW5jZW9mIEFycmF5KSB7XG5cblx0XHRcdFx0aWYgKF92YWx1ZXNFbmRbcHJvcGVydHldLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbG9jYWwgY29weSBvZiB0aGUgQXJyYXkgd2l0aCB0aGUgc3RhcnQgdmFsdWUgYXQgdGhlIGZyb250XG5cdFx0XHRcdF92YWx1ZXNFbmRbcHJvcGVydHldID0gW19vYmplY3RbcHJvcGVydHldXS5jb25jYXQoX3ZhbHVlc0VuZFtwcm9wZXJ0eV0pO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGB0bygpYCBzcGVjaWZpZXMgYSBwcm9wZXJ0eSB0aGF0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHNvdXJjZSBvYmplY3QsXG5cdFx0XHQvLyB3ZSBzaG91bGQgbm90IHNldCB0aGF0IHByb3BlcnR5IGluIHRoZSBvYmplY3Rcblx0XHRcdGlmIChfb2JqZWN0W3Byb3BlcnR5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTYXZlIHRoZSBzdGFydGluZyB2YWx1ZS5cblx0XHRcdF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gPSBfb2JqZWN0W3Byb3BlcnR5XTtcblxuXHRcdFx0aWYgKChfdmFsdWVzU3RhcnRbcHJvcGVydHldIGluc3RhbmNlb2YgQXJyYXkpID09PSBmYWxzZSkge1xuXHRcdFx0XHRfdmFsdWVzU3RhcnRbcHJvcGVydHldICo9IDEuMDsgLy8gRW5zdXJlcyB3ZSdyZSB1c2luZyBudW1iZXJzLCBub3Qgc3RyaW5nc1xuXHRcdFx0fVxuXG5cdFx0XHRfdmFsdWVzU3RhcnRSZXBlYXRbcHJvcGVydHldID0gX3ZhbHVlc1N0YXJ0W3Byb3BlcnR5XSB8fCAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIV9pc1BsYXlpbmcpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdFRXRUVOLnJlbW92ZSh0aGlzKTtcblx0XHRfaXNQbGF5aW5nID0gZmFsc2U7XG5cblx0XHRpZiAoX29uU3RvcENhbGxiYWNrICE9PSBudWxsKSB7XG5cdFx0XHRfb25TdG9wQ2FsbGJhY2suY2FsbChfb2JqZWN0LCBfb2JqZWN0KTtcblx0XHR9XG5cblx0XHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLmVuZCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHRoaXMudXBkYXRlKF9zdGFydFRpbWUgKyBfZHVyYXRpb24pO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5zdG9wQ2hhaW5lZFR3ZWVucyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGZvciAodmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrKSB7XG5cdFx0XHRfY2hhaW5lZFR3ZWVuc1tpXS5zdG9wKCk7XG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5kZWxheSA9IGZ1bmN0aW9uIChhbW91bnQpIHtcblxuXHRcdF9kZWxheVRpbWUgPSBhbW91bnQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnJlcGVhdCA9IGZ1bmN0aW9uICh0aW1lcykge1xuXG5cdFx0X3JlcGVhdCA9IHRpbWVzO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5yZXBlYXREZWxheSA9IGZ1bmN0aW9uIChhbW91bnQpIHtcblxuXHRcdF9yZXBlYXREZWxheVRpbWUgPSBhbW91bnQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnlveW8gPSBmdW5jdGlvbiAoeW95bykge1xuXG5cdFx0X3lveW8gPSB5b3lvO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblxuXHR0aGlzLmVhc2luZyA9IGZ1bmN0aW9uIChlYXNpbmcpIHtcblxuXHRcdF9lYXNpbmdGdW5jdGlvbiA9IGVhc2luZztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuaW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uIChpbnRlcnBvbGF0aW9uKSB7XG5cblx0XHRfaW50ZXJwb2xhdGlvbkZ1bmN0aW9uID0gaW50ZXJwb2xhdGlvbjtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuY2hhaW4gPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRfY2hhaW5lZFR3ZWVucyA9IGFyZ3VtZW50cztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25TdGFydCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG5cdFx0X29uU3RhcnRDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblVwZGF0ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG5cdFx0X29uVXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25Db21wbGV0ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG5cdFx0X29uQ29tcGxldGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblN0b3AgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuXHRcdF9vblN0b3BDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAodGltZSkge1xuXG5cdFx0dmFyIHByb3BlcnR5O1xuXHRcdHZhciBlbGFwc2VkO1xuXHRcdHZhciB2YWx1ZTtcblxuXHRcdGlmICh0aW1lIDwgX3N0YXJ0VGltZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9PT0gZmFsc2UpIHtcblxuXHRcdFx0aWYgKF9vblN0YXJ0Q2FsbGJhY2sgIT09IG51bGwpIHtcblx0XHRcdFx0X29uU3RhcnRDYWxsYmFjay5jYWxsKF9vYmplY3QsIF9vYmplY3QpO1xuXHRcdFx0fVxuXG5cdFx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGVsYXBzZWQgPSAodGltZSAtIF9zdGFydFRpbWUpIC8gX2R1cmF0aW9uO1xuXHRcdGVsYXBzZWQgPSBlbGFwc2VkID4gMSA/IDEgOiBlbGFwc2VkO1xuXG5cdFx0dmFsdWUgPSBfZWFzaW5nRnVuY3Rpb24oZWxhcHNlZCk7XG5cblx0XHRmb3IgKHByb3BlcnR5IGluIF92YWx1ZXNFbmQpIHtcblxuXHRcdFx0Ly8gRG9uJ3QgdXBkYXRlIHByb3BlcnRpZXMgdGhhdCBkbyBub3QgZXhpc3QgaW4gdGhlIHNvdXJjZSBvYmplY3Rcblx0XHRcdGlmIChfdmFsdWVzU3RhcnRbcHJvcGVydHldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdGFydCA9IF92YWx1ZXNTdGFydFtwcm9wZXJ0eV0gfHwgMDtcblx0XHRcdHZhciBlbmQgPSBfdmFsdWVzRW5kW3Byb3BlcnR5XTtcblxuXHRcdFx0aWYgKGVuZCBpbnN0YW5jZW9mIEFycmF5KSB7XG5cblx0XHRcdFx0X29iamVjdFtwcm9wZXJ0eV0gPSBfaW50ZXJwb2xhdGlvbkZ1bmN0aW9uKGVuZCwgdmFsdWUpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFBhcnNlcyByZWxhdGl2ZSBlbmQgdmFsdWVzIHdpdGggc3RhcnQgYXMgYmFzZSAoZS5nLjogKzEwLCAtMylcblx0XHRcdFx0aWYgKHR5cGVvZiAoZW5kKSA9PT0gJ3N0cmluZycpIHtcblxuXHRcdFx0XHRcdGlmIChlbmQuY2hhckF0KDApID09PSAnKycgfHwgZW5kLmNoYXJBdCgwKSA9PT0gJy0nKSB7XG5cdFx0XHRcdFx0XHRlbmQgPSBzdGFydCArIHBhcnNlRmxvYXQoZW5kKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZW5kID0gcGFyc2VGbG9hdChlbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFByb3RlY3QgYWdhaW5zdCBub24gbnVtZXJpYyBwcm9wZXJ0aWVzLlxuXHRcdFx0XHRpZiAodHlwZW9mIChlbmQpID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdF9vYmplY3RbcHJvcGVydHldID0gc3RhcnQgKyAoZW5kIC0gc3RhcnQpICogdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKF9vblVwZGF0ZUNhbGxiYWNrICE9PSBudWxsKSB7XG5cdFx0XHRfb25VcGRhdGVDYWxsYmFjay5jYWxsKF9vYmplY3QsIHZhbHVlKTtcblx0XHR9XG5cblx0XHRpZiAoZWxhcHNlZCA9PT0gMSkge1xuXG5cdFx0XHRpZiAoX3JlcGVhdCA+IDApIHtcblxuXHRcdFx0XHRpZiAoaXNGaW5pdGUoX3JlcGVhdCkpIHtcblx0XHRcdFx0XHRfcmVwZWF0LS07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBSZWFzc2lnbiBzdGFydGluZyB2YWx1ZXMsIHJlc3RhcnQgYnkgbWFraW5nIHN0YXJ0VGltZSA9IG5vd1xuXHRcdFx0XHRmb3IgKHByb3BlcnR5IGluIF92YWx1ZXNTdGFydFJlcGVhdCkge1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiAoX3ZhbHVlc0VuZFtwcm9wZXJ0eV0pID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0X3ZhbHVlc1N0YXJ0UmVwZWF0W3Byb3BlcnR5XSA9IF92YWx1ZXNTdGFydFJlcGVhdFtwcm9wZXJ0eV0gKyBwYXJzZUZsb2F0KF92YWx1ZXNFbmRbcHJvcGVydHldKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoX3lveW8pIHtcblx0XHRcdFx0XHRcdHZhciB0bXAgPSBfdmFsdWVzU3RhcnRSZXBlYXRbcHJvcGVydHldO1xuXG5cdFx0XHRcdFx0XHRfdmFsdWVzU3RhcnRSZXBlYXRbcHJvcGVydHldID0gX3ZhbHVlc0VuZFtwcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHRfdmFsdWVzRW5kW3Byb3BlcnR5XSA9IHRtcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRfdmFsdWVzU3RhcnRbcHJvcGVydHldID0gX3ZhbHVlc1N0YXJ0UmVwZWF0W3Byb3BlcnR5XTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF95b3lvKSB7XG5cdFx0XHRcdFx0X3JldmVyc2VkID0gIV9yZXZlcnNlZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChfcmVwZWF0RGVsYXlUaW1lICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRfc3RhcnRUaW1lID0gdGltZSArIF9yZXBlYXREZWxheVRpbWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X3N0YXJ0VGltZSA9IHRpbWUgKyBfZGVsYXlUaW1lO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYgKF9vbkNvbXBsZXRlQ2FsbGJhY2sgIT09IG51bGwpIHtcblxuXHRcdFx0XHRcdF9vbkNvbXBsZXRlQ2FsbGJhY2suY2FsbChfb2JqZWN0LCBfb2JqZWN0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrKSB7XG5cdFx0XHRcdFx0Ly8gTWFrZSB0aGUgY2hhaW5lZCB0d2VlbnMgc3RhcnQgZXhhY3RseSBhdCB0aGUgdGltZSB0aGV5IHNob3VsZCxcblx0XHRcdFx0XHQvLyBldmVuIGlmIHRoZSBgdXBkYXRlKClgIG1ldGhvZCB3YXMgY2FsbGVkIHdheSBwYXN0IHRoZSBkdXJhdGlvbiBvZiB0aGUgdHdlZW5cblx0XHRcdFx0XHRfY2hhaW5lZFR3ZWVuc1tpXS5zdGFydChfc3RhcnRUaW1lICsgX2R1cmF0aW9uKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fTtcblxufTtcblxuXG5UV0VFTi5FYXNpbmcgPSB7XG5cblx0TGluZWFyOiB7XG5cblx0XHROb25lOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gaztcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YWRyYXRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBrICogKDIgLSBrKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKChrICo9IDIpIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gMC41ICogayAqIGs7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAtIDAuNSAqICgtLWsgKiAoayAtIDIpIC0gMSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRDdWJpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gLS1rICogayAqIGsgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiBrICogayAqIGs7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAwLjUgKiAoKGsgLT0gMikgKiBrICogayArIDIpO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0UXVhcnRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIDEgLSAoLS1rICogayAqIGsgKiBrKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKChrICo9IDIpIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gMC41ICogayAqIGsgKiBrICogaztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIC0gMC41ICogKChrIC09IDIpICogayAqIGsgKiBrIC0gMik7XG5cblx0XHR9XG5cblx0fSxcblxuXHRRdWludGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiBrICogayAqIGsgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiBrICogayAqIGsgKiBrICogaztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIDAuNSAqICgoayAtPSAyKSAqIGsgKiBrICogayAqIGsgKyAyKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFNpbnVzb2lkYWw6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gMSAtIE1hdGguY29zKGsgKiBNYXRoLlBJIC8gMik7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gTWF0aC5zaW4oayAqIE1hdGguUEkgLyAyKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIGspKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEV4cG9uZW50aWFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgPT09IDAgPyAwIDogTWF0aC5wb3coMTAyNCwgayAtIDEpO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIGsgPT09IDEgPyAxIDogMSAtIE1hdGgucG93KDIsIC0gMTAgKiBrKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKGsgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChrID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoKGsgKj0gMikgPCAxKSB7XG5cdFx0XHRcdHJldHVybiAwLjUgKiBNYXRoLnBvdygxMDI0LCBrIC0gMSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAwLjUgKiAoLSBNYXRoLnBvdygyLCAtIDEwICogKGsgLSAxKSkgKyAyKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdENpcmN1bGFyOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0cmV0dXJuIDEgLSBNYXRoLnNxcnQoMSAtIGsgKiBrKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHJldHVybiBNYXRoLnNxcnQoMSAtICgtLWsgKiBrKSk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmICgoayAqPSAyKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIC0gMC41ICogKE1hdGguc3FydCgxIC0gayAqIGspIC0gMSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAoayAtPSAyKSAqIGspICsgMSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRFbGFzdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKGspIHtcblxuXHRcdFx0aWYgKGsgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChrID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gLU1hdGgucG93KDIsIDEwICogKGsgLSAxKSkgKiBNYXRoLnNpbigoayAtIDEuMSkgKiA1ICogTWF0aC5QSSk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRpZiAoayA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGsgPT09IDEpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBNYXRoLnBvdygyLCAtMTAgKiBrKSAqIE1hdGguc2luKChrIC0gMC4xKSAqIDUgKiBNYXRoLlBJKSArIDE7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmIChrID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoayA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblxuXHRcdFx0ayAqPSAyO1xuXG5cdFx0XHRpZiAoayA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIC0wLjUgKiBNYXRoLnBvdygyLCAxMCAqIChrIC0gMSkpICogTWF0aC5zaW4oKGsgLSAxLjEpICogNSAqIE1hdGguUEkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gMC41ICogTWF0aC5wb3coMiwgLTEwICogKGsgLSAxKSkgKiBNYXRoLnNpbigoayAtIDEuMSkgKiA1ICogTWF0aC5QSSkgKyAxO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0QmFjazoge1xuXG5cdFx0SW46IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogKChzICsgMSkgKiBrIC0gcyk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTg7XG5cblx0XHRcdHJldHVybiAtLWsgKiBrICogKChzICsgMSkgKiBrICsgcykgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcblxuXHRcdFx0aWYgKChrICo9IDIpIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gMC41ICogKGsgKiBrICogKChzICsgMSkgKiBrIC0gcykpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gMC41ICogKChrIC09IDIpICogayAqICgocyArIDEpICogayArIHMpICsgMik7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCb3VuY2U6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoaykge1xuXG5cdFx0XHRyZXR1cm4gMSAtIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KDEgLSBrKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmIChrIDwgKDEgLyAyLjc1KSkge1xuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogayAqIGs7XG5cdFx0XHR9IGVsc2UgaWYgKGsgPCAoMiAvIDIuNzUpKSB7XG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoayAtPSAoMS41IC8gMi43NSkpICogayArIDAuNzU7XG5cdFx0XHR9IGVsc2UgaWYgKGsgPCAoMi41IC8gMi43NSkpIHtcblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqIChrIC09ICgyLjI1IC8gMi43NSkpICogayArIDAuOTM3NTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoayAtPSAoMi42MjUgLyAyLjc1KSkgKiBrICsgMC45ODQzNzU7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uIChrKSB7XG5cblx0XHRcdGlmIChrIDwgMC41KSB7XG5cdFx0XHRcdHJldHVybiBUV0VFTi5FYXNpbmcuQm91bmNlLkluKGsgKiAyKSAqIDAuNTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KGsgKiAyIC0gMSkgKiAwLjUgKyAwLjU7XG5cblx0XHR9XG5cblx0fVxuXG59O1xuXG5UV0VFTi5JbnRlcnBvbGF0aW9uID0ge1xuXG5cdExpbmVhcjogZnVuY3Rpb24gKHYsIGspIHtcblxuXHRcdHZhciBtID0gdi5sZW5ndGggLSAxO1xuXHRcdHZhciBmID0gbSAqIGs7XG5cdFx0dmFyIGkgPSBNYXRoLmZsb29yKGYpO1xuXHRcdHZhciBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuTGluZWFyO1xuXG5cdFx0aWYgKGsgPCAwKSB7XG5cdFx0XHRyZXR1cm4gZm4odlswXSwgdlsxXSwgZik7XG5cdFx0fVxuXG5cdFx0aWYgKGsgPiAxKSB7XG5cdFx0XHRyZXR1cm4gZm4odlttXSwgdlttIC0gMV0sIG0gLSBmKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZm4odltpXSwgdltpICsgMSA+IG0gPyBtIDogaSArIDFdLCBmIC0gaSk7XG5cblx0fSxcblxuXHRCZXppZXI6IGZ1bmN0aW9uICh2LCBrKSB7XG5cblx0XHR2YXIgYiA9IDA7XG5cdFx0dmFyIG4gPSB2Lmxlbmd0aCAtIDE7XG5cdFx0dmFyIHB3ID0gTWF0aC5wb3c7XG5cdFx0dmFyIGJuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5CZXJuc3RlaW47XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8PSBuOyBpKyspIHtcblx0XHRcdGIgKz0gcHcoMSAtIGssIG4gLSBpKSAqIHB3KGssIGkpICogdltpXSAqIGJuKG4sIGkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBiO1xuXG5cdH0sXG5cblx0Q2F0bXVsbFJvbTogZnVuY3Rpb24gKHYsIGspIHtcblxuXHRcdHZhciBtID0gdi5sZW5ndGggLSAxO1xuXHRcdHZhciBmID0gbSAqIGs7XG5cdFx0dmFyIGkgPSBNYXRoLmZsb29yKGYpO1xuXHRcdHZhciBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuQ2F0bXVsbFJvbTtcblxuXHRcdGlmICh2WzBdID09PSB2W21dKSB7XG5cblx0XHRcdGlmIChrIDwgMCkge1xuXHRcdFx0XHRpID0gTWF0aC5mbG9vcihmID0gbSAqICgxICsgaykpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm4odlsoaSAtIDEgKyBtKSAlIG1dLCB2W2ldLCB2WyhpICsgMSkgJSBtXSwgdlsoaSArIDIpICUgbV0sIGYgLSBpKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmIChrIDwgMCkge1xuXHRcdFx0XHRyZXR1cm4gdlswXSAtIChmbih2WzBdLCB2WzBdLCB2WzFdLCB2WzFdLCAtZikgLSB2WzBdKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGsgPiAxKSB7XG5cdFx0XHRcdHJldHVybiB2W21dIC0gKGZuKHZbbV0sIHZbbV0sIHZbbSAtIDFdLCB2W20gLSAxXSwgZiAtIG0pIC0gdlttXSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmbih2W2kgPyBpIC0gMSA6IDBdLCB2W2ldLCB2W20gPCBpICsgMSA/IG0gOiBpICsgMV0sIHZbbSA8IGkgKyAyID8gbSA6IGkgKyAyXSwgZiAtIGkpO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0VXRpbHM6IHtcblxuXHRcdExpbmVhcjogZnVuY3Rpb24gKHAwLCBwMSwgdCkge1xuXG5cdFx0XHRyZXR1cm4gKHAxIC0gcDApICogdCArIHAwO1xuXG5cdFx0fSxcblxuXHRcdEJlcm5zdGVpbjogZnVuY3Rpb24gKG4sIGkpIHtcblxuXHRcdFx0dmFyIGZjID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5GYWN0b3JpYWw7XG5cblx0XHRcdHJldHVybiBmYyhuKSAvIGZjKGkpIC8gZmMobiAtIGkpO1xuXG5cdFx0fSxcblxuXHRcdEZhY3RvcmlhbDogKGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0dmFyIGEgPSBbMV07XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbiAobikge1xuXG5cdFx0XHRcdHZhciBzID0gMTtcblxuXHRcdFx0XHRpZiAoYVtuXSkge1xuXHRcdFx0XHRcdHJldHVybiBhW25dO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IG47IGkgPiAxOyBpLS0pIHtcblx0XHRcdFx0XHRzICo9IGk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhW25dID0gcztcblx0XHRcdFx0cmV0dXJuIHM7XG5cblx0XHRcdH07XG5cblx0XHR9KSgpLFxuXG5cdFx0Q2F0bXVsbFJvbTogZnVuY3Rpb24gKHAwLCBwMSwgcDIsIHAzLCB0KSB7XG5cblx0XHRcdHZhciB2MCA9IChwMiAtIHAwKSAqIDAuNTtcblx0XHRcdHZhciB2MSA9IChwMyAtIHAxKSAqIDAuNTtcblx0XHRcdHZhciB0MiA9IHQgKiB0O1xuXHRcdFx0dmFyIHQzID0gdCAqIHQyO1xuXG5cdFx0XHRyZXR1cm4gKDIgKiBwMSAtIDIgKiBwMiArIHYwICsgdjEpICogdDMgKyAoLSAzICogcDEgKyAzICogcDIgLSAyICogdjAgLSB2MSkgKiB0MiArIHYwICogdCArIHAxO1xuXG5cdFx0fVxuXG5cdH1cblxufTtcblxuLy8gVU1EIChVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24pXG4oZnVuY3Rpb24gKHJvb3QpIHtcblxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBUV0VFTjtcblx0XHR9KTtcblxuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXG5cdFx0Ly8gTm9kZS5qc1xuXHRcdG1vZHVsZS5leHBvcnRzID0gVFdFRU47XG5cblx0fSBlbHNlIGlmIChyb290ICE9PSB1bmRlZmluZWQpIHtcblxuXHRcdC8vIEdsb2JhbCB2YXJpYWJsZVxuXHRcdHJvb3QuVFdFRU4gPSBUV0VFTjtcblxuXHR9XG5cbn0pKHRoaXMpO1xuIiwiaW1wb3J0IFBpc2NlcyBmcm9tICcuLi8uLi8uLi8uLi9saWInO1xuXG5pbXBvcnQgR2VtaW5pIGZyb20gJ2dlbWluaS1zY3JvbGxiYXInO1xuaW1wb3J0IFRleHRHcmFkaWVudCBmcm9tICd0ZXh0LWdyYWRpZW50JztcbmltcG9ydCBTaGFyZVVybCBmcm9tICdzaGFyZS11cmwnO1xuaW1wb3J0IFR3ZWVuIGZyb20gJ3R3ZWVuLmpzJztcblxuY29uc3QgdmVyc2lvbiA9IFBpc2Nlcy5WRVJTSU9OO1xuXG4vLyBwcmludCBwaXNjZXMgdmVyc2lvblxubGV0IHZlcnNpb25FbGVtZW50ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudmVyc2lvbicpKTtcbnZlcnNpb25FbGVtZW50Lm1hcChlbCA9PiB7XG4gIGVsLmlubmVySFRNTCA9IGB2JHt2ZXJzaW9ufWA7XG4gIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbn0pO1xudmVyc2lvbkVsZW1lbnQgPSBudWxsO1xuXG4vLyBzZXQgZ3JhZGllbnQgdGV4dC1ncmFkaWVudFxuW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuLWdyYWQnKSkuZm9yRWFjaChpID0+IHtcbiAgbmV3IFRleHRHcmFkaWVudChpLCB7XG4gICAgZnJvbTogJyM2QjZFRDgnLCB0bzogJ3JnYig3NCwgMTk3LCAxOTUpJ1xuICB9KTtcbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4vLyBpbml0IGFuZCBjYWNoZVxuY29uc3Qgc2Nyb2xsaW5nQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRlbW8tc2Nyb2xsaW5nLWJveCcpO1xuY29uc3QgZ2VtaW5pID0gbmV3IEdlbWluaSh7XG4gIGVsZW1lbnQ6IHNjcm9sbGluZ0JveCxcbiAgY3JlYXRlRWxlbWVudHM6IGZhbHNlLFxuICBhdXRvc2hvdzogMVxufSkuY3JlYXRlKCk7XG5jb25zdCBwaXNjZXMgPSBuZXcgUGlzY2VzKGdlbWluaS5nZXRWaWV3RWxlbWVudCgpKTtcblxuY29uc3QgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZW1vLWZvcm0nKTtcbmNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbmNvbnN0IHNjcm9sbFRvT3B0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njcm9sbC10by1vcHRpb24nKTtcblxuY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVtby1zY3JvbGxpbmctYm94IGxpJyk7XG5jb25zdCBpdGVtc09wdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Nyb2xsLXRvLWVsZW1lbnQnKTtcbmNvbnN0IGVsZW1lbnRzT3B0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbGVtZW50cy1zZWxlY3Qtd3JhcHBlcicpO1xuY29uc3QgY29vcmRPcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvb3Jkcy1pbnB1dC13cmFwcGVyJyk7XG5jb25zdCBjb29yZFggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29vcmQteCcpO1xuY29uc3QgY29vcmRZID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvb3JkLXknKTtcbmNvbnN0IGVhc2VzT3B0Z3JvdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdvcHRncm91cFtsYWJlbD1cImVhc2VzXCJdJyk7XG5jb25zdCBlYXNpbmdPcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWFzaW5nLW9wdGlvbicpO1xuY29uc3QgcmVEb3QgPSBuZXcgUmVnRXhwKC9cXC4vKTtcbmNvbnN0IGR1cmF0aW9uT3B0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uLW9wdGlvbicpO1xuXG4vLyBjcmVhdGUgVHdlZW4uanMgZWFzaW5nIG9wdGlvbnNcbmNvbnN0IFR3ZWVuRWFzaW5ncyA9IFR3ZWVuLkVhc2luZztcbmNvbnN0IHR3ZWVuanNPcHRncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGdyb3VwJyk7XG50d2VlbmpzT3B0Z3JvdXAubGFiZWwgPSAndHdlZW4uanMnO1xuT2JqZWN0LmtleXMoVHdlZW5FYXNpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgT2JqZWN0LmtleXMoVHdlZW5FYXNpbmdzW2VdKS5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udmFsdWUgPSBgVHdlZW4uRWFzaW5nLiR7ZX0uJHtvfWA7XG4gICAgb3B0aW9uLnRleHQgPSBgJHtlfS4ke299YDtcbiAgICB0d2VlbmpzT3B0Z3JvdXAuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfSk7XG59KTtcbmVhc2luZ09wdGlvbi5hcHBlbmRDaGlsZCh0d2VlbmpzT3B0Z3JvdXApO1xuXG4vLyBjcmVhdGUgc2hhcmFibGUgdXJsc1xuY29uc3QgdCA9IHtcbiAgcmVsYXRlZDogJ3BpeGVsaWFfbWUnLFxuICB0ZXh0OiBgcGlzY2VzICR7dmVyc2lvbn0g4oCUIFNjcm9sbCB0byBsb2NhdGlvbnMgb2YgYW55IHNjcm9sbGluZyBib3ggaW4gYSBzbW9vdGggZmFzaGlvbiBgLFxuICB1cmw6ICdodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL3Bpc2Nlcy8nLFxuICB2aWE6ICdwaXhlbGlhX21lJ1xufTtcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaGFyZS10d2l0dGVyJykuaHJlZiA9IFNoYXJlVXJsLnR3aXR0ZXIodCk7XG5cbmNvbnN0IGYgPSB7XG4gIHU6ICdodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL3Bpc2Nlcy8nXG59O1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNoYXJlLWZhY2Vib29rJykuaHJlZiA9IFNoYXJlVXJsLmZhY2Vib29rKGYpO1xuXG5cbmZ1bmN0aW9uIGZvcm1TdWJtaXRIYW5kbGVyKGV2KSB7XG4gIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gIGlmIChkdXJhdGlvbk9wdGlvbi52YWx1ZSkge1xuICAgIG9wdGlvbnMuZHVyYXRpb24gPSBkdXJhdGlvbk9wdGlvbi52YWx1ZTtcbiAgfVxuXG4gIGlmIChlYXNpbmdPcHRpb24udmFsdWUgIT09ICdkZWZhdWx0Jykge1xuICAgIGxldCBlYXNlO1xuICAgIGVhc2luZ09wdGlvbi52YWx1ZS5zcGxpdChyZURvdCkuZm9yRWFjaChpID0+IHtcbiAgICAgIGVhc2UgPSAodHlwZW9mIHdpbmRvd1tpXSA9PT0gJ3VuZGVmaW5lZCcpID8gZWFzZVtpXSA6IHdpbmRvd1tpXTtcbiAgICB9KTtcbiAgICBvcHRpb25zLmVhc2luZyA9IGVhc2U7XG4gIH1cblxuICBzd2l0Y2goc2Nyb2xsVG9PcHRpb24udmFsdWUpIHtcbiAgICBjYXNlICdlbGVtZW50JzpcbiAgICAgIGNvbnN0IGVsID0gaXRlbXNbKGl0ZW1zT3B0aW9ucy52YWx1ZSB8fCAxNSkgLSAxXTtcbiAgICAgIHBpc2Nlcy5zY3JvbGxUb0VsZW1lbnQoZWwsIG9wdGlvbnMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncG9zaXRpb24nOlxuICAgICAgY29uc3QgY29vcmRzID0ge3g6IGNvb3JkWC52YWx1ZSwgeTogY29vcmRZLnZhbHVlfTtcbiAgICAgIHBpc2Nlcy5zY3JvbGxUb1Bvc2l0aW9uKGNvb3Jkcywgb3B0aW9ucyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcGlzY2VzW3Njcm9sbFRvT3B0aW9uLnZhbHVlXShvcHRpb25zKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VIYW5kbGVyKGV2KSB7XG4gIGVsZW1lbnRzT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIGl0ZW1zT3B0aW9ucy5kaXNhYmxlZCA9IHRydWU7XG4gIGNvb3JkT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgc3dpdGNoKGV2LnRhcmdldC52YWx1ZSkge1xuICAgIGNhc2UgJ2VsZW1lbnQnOlxuICAgICAgZWxlbWVudHNPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgaXRlbXNPcHRpb25zLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwb3NpdGlvbic6XG4gICAgICBjb29yZE9wdGlvbnMuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZvcm1TdWJtaXRIYW5kbGVyKTtcbnNjcm9sbFRvT3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZUhhbmRsZXIpO1xuIl0sIm5hbWVzIjpbInRoaXMiLCJhcmd1bWVudHMiLCJyZXF1aXJlJCQwIiwicmVxdWlyZSQkMSIsImRlZmluZSIsImNvbnN0IiwiUGlzY2VzIiwibGV0IiwiVGV4dEdyYWRpZW50IiwiR2VtaW5pIiwiU2hhcmVVcmwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsQ0FBQyxVQUFVLE1BQU0sRUFBRSxPQUFPLEVBQUU7Q0FDM0IsQUFBK0QsY0FBYyxHQUFHLE9BQU8sRUFBRSxBQUU5RCxDQUFDO0NBQzVCLENBQUNBLGNBQUksR0FBRyxZQUFZLEVBQUUsWUFBWSxDQUFDOztBQUVwQyxJQUFJLG1CQUFtQixHQUFHLFlBQVk7RUFDcEMsSUFBSSxrQkFBa0IsSUFBSSxRQUFRLEVBQUU7SUFDbEMsT0FBTyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7R0FDbEM7O0VBRUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztFQUNwQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0VBQzNCLElBQUksR0FBRyxDQUFDOztFQUVSLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQzs7RUFFM0IsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7O0VBRXJCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDOztFQUV2QixJQUFJLEdBQUcsR0FBRyxLQUFLLEVBQUU7SUFDZixPQUFPLElBQUksQ0FBQztHQUNiOztFQUVELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQztDQUN0QixDQUFDOztBQUVGLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDekIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoRCxJQUFJLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFMUMsU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFOzs7RUFDdEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxFQUFF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QUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7O0dBRXBFOztFQUVELEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRTs7R0FFbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQ1osT0FBTyxDQUFDLENBQUM7SUFDVDs7R0FFRCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDWixPQUFPLENBQUMsQ0FBQztJQUNUOztHQUVELENBQUMsSUFBSSxDQUFDLENBQUM7O0dBRVAsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ1YsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RTs7R0FFRCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7R0FFaEY7O0VBRUQ7O0NBRUQsSUFBSSxFQUFFOztFQUVMLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTs7R0FFaEIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDOztHQUVoQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7R0FFakM7O0VBRUQsR0FBRyxFQUFFLFVBQVUs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ckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDOztFQUU5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0dBRWxCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNWLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEM7O0dBRUQsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0dBRTNFLE1BQU07O0dBRU4sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ1YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3REOztHQUVELElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNWLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakU7O0dBRUQsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0dBRTdGOztFQUVEOztDQUVELEtBQUssRUFBRTs7RUFFTixNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTs7R0FFNUIsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7R0FFMUI7O0VBRUQsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTs7R0FFMUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDOztHQUU3QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7R0FFakM7O0VBRUQsU0FBUyxFQUFFLENBQUMsWUFBWTs7R0FFdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7R0FFWixPQUFPLFVBQVUsQ0FBQyxFQUFFOztJQUVuQixJ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