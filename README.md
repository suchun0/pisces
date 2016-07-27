# pisces [![npm-image](https://img.shields.io/npm/v/pisces.svg)](https://www.npmjs.com/package/pisces) ![license-image](https://img.shields.io/npm/l/pisces.svg)

Scroll to specific locations of any scrolling box in a smooth fashion.

## Table of Contents
* [Install](#install)
* [Basic Usage](#usage)
* [Polyfills](#polyfills)
* [API](#api)
	* [params](#api-params)
	* [scrollTo](#piscesscrolltotarget-options)
	* [scrollToElement](#piscesscrolltoelementdomelement-options)
	* [scrollToPosition](#piscesscrolltopositioncoordinates-options)
	* [scrollToTop](#piscesscrolltotopoptions)
	* [scrollToRight](#piscesscrolltorightoptions)
	* [scrollToBottom](#piscesscrolltobottomoptions)
	* [scrollToLeft](#piscesscrolltoleftoptions)
	* [set](#piscessetkey-value)
	* [cancel](#piscescancel)
	* [getElementOffset](#piscesgetelementoffsetdomelement)
* [Examples](#examples)
	* [Provide a different easing function](#provide-a-different-easing-function)
	* [Override options per method call](#override-options-per-method-call)
	* [Using it with gemini-scrollbar](#using-it-with-gemini-scrollbar)
* [License](#license)

## Install
```sh
$ npm i pisces -S
```

<h2 id="usage">Basic Usage</h2>
```js
import Pisces from 'pisces';
const pisces = new Pisces();

pisces.scrollToElement(document.querySelector('.some-element'));
pisces.scrollToPosition({y: 100});
pisces.scrollToPosition({x: '-10', y: '+300'});
pisces.scrollToBottom();
```

## Polyfills
If you need to support **IE9-** make sure to add the following polyfills:

* requestAnimationFrame
* cancelAnimationFrame
* performance.now

## API
<h3 id="api-params">Pisces([scrollingBox], [options])</h3>

Creates a new instance. You should create a new instance per any scrolling element you want to interact with.

#### scrollingBox
Because of browser inconsistencies, if you want to scroll the default page (`window`, `document`, `body`), leave this option empty or pass `null`, the library will try pick the right one for the browser.

If you want to register any other scrolling element, you should pass a valid `DOMElement`.

| type | default |
|:-----|:-----|:--------|:------------|
| `DOMElement` | `scrollingElement` or `documentElement` or `body` |

#### options

| name | type | default | description |
|:-----|:-----|:--------|:------------|
| duration | `Number` | 800 *(milliseconds)* |  How many milliseconds the animation should run for. |
| easing | `Function` | `x => Math.sqrt(1-(--x*x))` | An easing function takes an `x` value, representing progress along a timeline (between 0 and 1), and returns a `y` value. |
| callback | `Function` | `null` | The function to run the animation is completed.

### pisces.scrollTo(target, options)

Proxy for `scrollToElement` or `scrollToPosition`.

This method allows you to pass a querySelector string to scroll to a specific element (eg. ".my-element"). Or to pass a hash with `x` and/or `y` keys to scroll to absolute or relatives points of the scrolling box.

*If you know what you want you are doing please use the adequate method instead, see the other methods below.*

### pisces.scrollToElement(domElement, [options])

Scrolls to an existing element inside your scrollingBox.

```js
const someElementReference = document.querySelector('.footer');
...
pisces.scrollToElement(someElementReference);
```

The `domElement` param is required and should be valid `DOMElement`.

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.scrollToPosition(coordinates, [options])

Scrolls to a specific `x`, `y` position of the scrollingBox. It can be a fixed value relative to the top/left coordinates or to relative values from the current position.

```js
// absolute
pisces.scrollToPosition({x: 100, y: 100});

// relative
pisces.scrollToPosition({x: '+100', y: '-100'});

// mixed
pisces.scrollToPosition({x: 100, y: '-100'});
```

The `coordinates` params is required.

It should be a hash with an `x` and/or `y` key(s).

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.scrollToTop([options])

Scrolls to the top position of the scrollingBox.

```js
pisces.scrollToTop();
```

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.scrollToRight([options])

Scrolls to the far right position of the scrollingBox.

```js
pisces.scrollToRight();
```

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.scrollToBottom([options])

Scrolls to the bottom position of the scrollingBox.

```js
pisces.scrollToBottom();
```

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.scrollToLeft([options])

Scrolls to the far left position of the scrollingBox.

```js
pisces.scrollToLeft();
```

If you pass an options hash, it will use that options just for this iteration without overriding the defaults.

### pisces.set(key, value)

Overrides the `options` set during instantiation.

```js
pisces.set('duration', 200);
pisces.set('easing', someCustomEasingFunction);
pisces.set('callback', someCallbackToRunOnComplete);
```

### pisces.cancel()

Stops the animation loop.

### pisces.getElementOffset(DOMElement)

Returns a hash with the position of the passed `DOMElement` relative to the instance’s `scrollingBox` scroll position or `false` in case the `scrollingBox` does not contains the passed `DOMElement`.

This can be useful in cases where you have a fixed header (or some other fixed element) and you do not want to scroll underneath it.

In case the passed `DOMElement` is inside the instance’s `scrollingBox` it will return a hash with an `x` and `y` keys, e.g. `{ x: <number>, y: <number> }`, then you can use those values to call the `scrollToPosition` method subtracting your fixed element height/width.

## Examples

### Provide a different easing function

If you are not happy with the default easing function provided (`Circular.Out`) you can tell which one to use during instantiation.

```js
import Pisces from 'Pisces';
import tween from 'tween.js';
import eases from 'eases';

const scrollingBoxA = document.querySelector('.scrollable-a');
const piscesA = new Pisces(scrollingBoxA, {
  easing: tween.Easing.Back.InOut,
  duration: 1000
});

const scrollingBoxB = document.querySelector('.scrollable-b');
const piscesB = new Pisces(scrollingBoxB, {
  easing: eases.elasticInOut
});
```

### Override options per method call

If you need it you can change the options every time you call a method. This will not override the default options, but the use them just for this call. This can be useful for debugging, changing the `duration` and `easing` to see which combination feels better for you.

```js
import Pisces from 'Pisces';
import tween from 'tween.js';

const pisces = new Pisces(document.querySelector('.scrollable'));
...
pisces.scrollTo('.target', {
  easing: tween.Easing.Quintic.In,
  duration: 400
});

```

### Using it with [gemini-scrollbar]

```js
import Pisces from 'pisces';
import Gemini from 'gemini-scrollbar';

const gemini = new Gemini({
  element: document.querySelector('.scrolling-box'),
}).create();

/* the key part to make it compatible with gemini-scrollbar */
const pisces = new Pisces(gemini.getViewElement());

/* simple example, check the available methods on the API section */
const coords = { x: 0, y: 200 };
pisces.scrollToPosition(coords);
```


## License
MIT © [Noel Delgado](http://pixelia.me/)

[gemini-scrollbar]: https://github.com/noeldelgado/gemini-scrollbar
