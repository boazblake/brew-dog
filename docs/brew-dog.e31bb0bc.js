// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/mithril/render/vnode.js":[function(require,module,exports) {
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode

},{}],"node_modules/mithril/render/hyperscriptVnode.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render/hyperscript.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript

},{"../render/vnode":"node_modules/mithril/render/vnode.js","./hyperscriptVnode":"node_modules/mithril/render/hyperscriptVnode.js"}],"node_modules/mithril/render/trust.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render/fragment.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js","./hyperscriptVnode":"node_modules/mithril/render/hyperscriptVnode.js"}],"node_modules/mithril/hyperscript.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript

},{"./render/hyperscript":"node_modules/mithril/render/hyperscript.js","./render/trust":"node_modules/mithril/render/trust.js","./render/fragment":"node_modules/mithril/render/fragment.js"}],"node_modules/mithril/promise/polyfill.js":[function(require,module,exports) {
"use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill

},{}],"node_modules/mithril/promise/promise.js":[function(require,module,exports) {
var global = arguments[3];
"use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}

},{"./polyfill":"node_modules/mithril/promise/polyfill.js"}],"node_modules/mithril/render/render.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					insertNode(parent, toFragment(oe), topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) insertNode(parent, toFragment(o), nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else insertNode(parent, toFragment(v), nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else vnode.dom = old.dom, vnode.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function toFragment(vnode) {
		var count = vnode.domSize
		if (count != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count > 0) {
				var dom = vnode.dom
				while (--count) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}

	//remove
	function removeNodes(vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(vnode)
		}
	}
	function removeNode(vnode) {
		var expected = 1, called = 0
		var original = vnode.state
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				checkState(vnode, original)
				onremove(vnode)
				if (vnode.dom) {
					var parent = vnode.dom.parentNode
					var count = vnode.domSize || 1
					while (--count) parent.removeChild(vnode.dom.nextSibling)
					parent.removeChild(vnode.dom)
				}
			}
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render.js":[function(require,module,exports) {
"use strict"

module.exports = require("./render/render")(window)

},{"./render/render":"node_modules/mithril/render/render.js"}],"node_modules/mithril/api/mount-redraw.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/mount-redraw.js":[function(require,module,exports) {
"use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)

},{"./render":"node_modules/mithril/render.js","./api/mount-redraw":"node_modules/mithril/api/mount-redraw.js"}],"node_modules/mithril/querystring/build.js":[function(require,module,exports) {
"use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}

},{}],"node_modules/mithril/pathname/assign.js":[function(require,module,exports) {
"use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}

},{}],"node_modules/mithril/pathname/build.js":[function(require,module,exports) {
"use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}

},{"../querystring/build":"node_modules/mithril/querystring/build.js","./assign":"node_modules/mithril/pathname/assign.js"}],"node_modules/mithril/request/request.js":[function(require,module,exports) {
"use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}

},{"../pathname/build":"node_modules/mithril/pathname/build.js"}],"node_modules/mithril/request.js":[function(require,module,exports) {
"use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)

},{"./promise/promise":"node_modules/mithril/promise/promise.js","./mount-redraw":"node_modules/mithril/mount-redraw.js","./request/request":"node_modules/mithril/request/request.js"}],"node_modules/mithril/querystring/parse.js":[function(require,module,exports) {
"use strict"

// The extra `data` parameter is for if you want to append to an existing
// parameters object.
module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j === levels.length - 1
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			if (isValue) cursor[level] = value
			else if (cursor[level] == null) cursor[level] = isNumber ? [] : {}
			cursor = cursor[level]
		}
	}
	return data
}

},{}],"node_modules/mithril/pathname/parse.js":[function(require,module,exports) {
"use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}

},{"../querystring/parse":"node_modules/mithril/querystring/parse.js"}],"node_modules/mithril/pathname/compileTemplate.js":[function(require,module,exports) {
"use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}

},{"./parse":"node_modules/mithril/pathname/parse.js"}],"node_modules/mithril/api/router.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js","../render/hyperscript":"node_modules/mithril/render/hyperscript.js","../promise/promise":"node_modules/mithril/promise/promise.js","../pathname/build":"node_modules/mithril/pathname/build.js","../pathname/parse":"node_modules/mithril/pathname/parse.js","../pathname/compileTemplate":"node_modules/mithril/pathname/compileTemplate.js","../pathname/assign":"node_modules/mithril/pathname/assign.js"}],"node_modules/mithril/route.js":[function(require,module,exports) {
"use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)

},{"./mount-redraw":"node_modules/mithril/mount-redraw.js","./api/router":"node_modules/mithril/api/router.js"}],"node_modules/mithril/index.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m

},{"./hyperscript":"node_modules/mithril/hyperscript.js","./request":"node_modules/mithril/request.js","./mount-redraw":"node_modules/mithril/mount-redraw.js","./route":"node_modules/mithril/route.js","./render":"node_modules/mithril/render.js","./querystring/parse":"node_modules/mithril/querystring/parse.js","./querystring/build":"node_modules/mithril/querystring/build.js","./pathname/parse":"node_modules/mithril/pathname/parse.js","./pathname/build":"node_modules/mithril/pathname/build.js","./render/vnode":"node_modules/mithril/render/vnode.js","./promise/polyfill":"node_modules/mithril/promise/polyfill.js"}],"node_modules/mithril-stream/stream.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/* eslint-enable */
Stream.SKIP = {};
Stream.lift = lift;
Stream.scan = scan;
Stream.merge = merge;
Stream.combine = combine;
Stream.scanMerge = scanMerge;
Stream["fantasy-land/of"] = Stream;
var warnedHalt = false;
Object.defineProperty(Stream, "HALT", {
  get: function () {
    warnedHalt || console.log("HALT is deprecated and has been renamed to SKIP");
    warnedHalt = true;
    return Stream.SKIP;
  }
});

function Stream(value) {
  var dependentStreams = [];
  var dependentFns = [];

  function stream(v) {
    if (arguments.length && v !== Stream.SKIP) {
      value = v;

      if (open(stream)) {
        stream.changing();
        stream.state = "active";
        dependentStreams.forEach(function (s, i) {
          s(dependentFns[i](value));
        });
      }
    }

    return value;
  }

  stream.constructor = Stream;
  stream.state = arguments.length && value !== Stream.SKIP ? "active" : "pending";
  stream.parents = [];

  stream.changing = function () {
    open(stream) && (stream.state = "changing");
    dependentStreams.forEach(function (s) {
      s.changing();
    });
  };

  stream.map = function (fn, ignoreInitial) {
    var target = stream.state === "active" && ignoreInitial !== Stream.SKIP ? Stream(fn(value)) : Stream();
    target.parents.push(stream);
    dependentStreams.push(target);
    dependentFns.push(fn);
    return target;
  };

  var end;

  function createEnd() {
    end = Stream();
    end.map(function (value) {
      if (value === true) {
        stream.parents.forEach(function (p) {
          p.unregisterChild(stream);
        });
        stream.state = "ended";
        stream.parents.length = dependentStreams.length = dependentFns.length = 0;
      }

      return value;
    });
    return end;
  }

  stream.toJSON = function () {
    return value != null && typeof value.toJSON === "function" ? value.toJSON() : value;
  };

  stream["fantasy-land/map"] = stream.map;

  stream["fantasy-land/ap"] = function (x) {
    return combine(function (s1, s2) {
      return s1()(s2());
    }, [x, stream]);
  };

  stream.unregisterChild = function (child) {
    var childIndex = dependentStreams.indexOf(child);

    if (childIndex !== -1) {
      dependentStreams.splice(childIndex, 1);
      dependentFns.splice(childIndex, 1);
    }
  };

  Object.defineProperty(stream, "end", {
    get: function () {
      return end || createEnd();
    }
  });
  return stream;
}

function combine(fn, streams) {
  var ready = streams.every(function (s) {
    if (s.constructor !== Stream) throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream");
    return s.state === "active";
  });
  var stream = ready ? Stream(fn.apply(null, streams.concat([streams]))) : Stream();
  var changed = [];
  var mappers = streams.map(function (s) {
    return s.map(function (value) {
      changed.push(s);

      if (ready || streams.every(function (s) {
        return s.state !== "pending";
      })) {
        ready = true;
        stream(fn.apply(null, streams.concat([changed])));
        changed = [];
      }

      return value;
    }, Stream.SKIP);
  });
  var endStream = stream.end.map(function (value) {
    if (value === true) {
      mappers.forEach(function (mapper) {
        mapper.end(true);
      });
      endStream.end(true);
    }

    return undefined;
  });
  return stream;
}

function merge(streams) {
  return combine(function () {
    return streams.map(function (s) {
      return s();
    });
  }, streams);
}

function scan(fn, acc, origin) {
  var stream = origin.map(function (v) {
    var next = fn(acc, v);
    if (next !== Stream.SKIP) acc = next;
    return next;
  });
  stream(acc);
  return stream;
}

function scanMerge(tuples, seed) {
  var streams = tuples.map(function (tuple) {
    return tuple[0];
  });
  var stream = combine(function () {
    var changed = arguments[arguments.length - 1];
    streams.forEach(function (stream, i) {
      if (changed.indexOf(stream) > -1) seed = tuples[i][1](seed, stream());
    });
    return seed;
  }, streams);
  stream(seed);
  return stream;
}

function lift() {
  var fn = arguments[0];
  var streams = Array.prototype.slice.call(arguments, 1);
  return merge(streams).map(function (streams) {
    return fn.apply(undefined, streams);
  });
}

function open(s) {
  return s.state === "pending" || s.state === "active" || s.state === "changing";
}

var _default = Stream;
exports.default = _default;
},{}],"node_modules/ramda/es/F.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * A function that always returns `false`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.T
 * @example
 *
 *      R.F(); //=> false
 */
var F = function () {
  return false;
};

var _default = F;
exports.default = _default;
},{}],"node_modules/ramda/es/T.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * A function that always returns `true`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.F
 * @example
 *
 *      R.T(); //=> true
 */
var T = function () {
  return true;
};

var _default = T;
exports.default = _default;
},{}],"node_modules/ramda/es/__.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of
 * their positions.
 *
 * If `g` is a curried ternary function and `_` is `R.__`, the following are
 * equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2, _)(1, 3)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @name __
 * @constant
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @example
 *
 *      const greet = R.replace('{name}', R.__, 'Hello, {name}!');
 *      greet('Alice'); //=> 'Hello, Alice!'
 */
var _default = {
  '@@functional/placeholder': true
};
exports.default = _default;
},{}],"node_modules/ramda/es/internal/_isPlaceholder.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isPlaceholder;

function _isPlaceholder(a) {
  return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}
},{}],"node_modules/ramda/es/internal/_curry1.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _curry1;

var _isPlaceholder2 = _interopRequireDefault(require("./_isPlaceholder.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || (0, _isPlaceholder2.default)(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}
},{"./_isPlaceholder.js":"node_modules/ramda/es/internal/_isPlaceholder.js"}],"node_modules/ramda/es/internal/_curry2.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _curry2;

var _curry = _interopRequireDefault(require("./_curry1.js"));

var _isPlaceholder2 = _interopRequireDefault(require("./_isPlaceholder.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;

      case 1:
        return (0, _isPlaceholder2.default)(a) ? f2 : (0, _curry.default)(function (_b) {
          return fn(a, _b);
        });

      default:
        return (0, _isPlaceholder2.default)(a) && (0, _isPlaceholder2.default)(b) ? f2 : (0, _isPlaceholder2.default)(a) ? (0, _curry.default)(function (_a) {
          return fn(_a, b);
        }) : (0, _isPlaceholder2.default)(b) ? (0, _curry.default)(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}
},{"./_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./_isPlaceholder.js":"node_modules/ramda/es/internal/_isPlaceholder.js"}],"node_modules/ramda/es/add.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds two values.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @see R.subtract
 * @example
 *
 *      R.add(2, 3);       //=>  5
 *      R.add(7)(10);      //=> 17
 */
var add =
/*#__PURE__*/
(0, _curry.default)(function add(a, b) {
  return Number(a) + Number(b);
});
var _default = add;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_concat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _concat;

/**
 * Private `concat` function to merge two array-like objects.
 *
 * @private
 * @param {Array|Arguments} [set1=[]] An array-like object.
 * @param {Array|Arguments} [set2=[]] An array-like object.
 * @return {Array} A new, merged array.
 * @example
 *
 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 */
function _concat(set1, set2) {
  set1 = set1 || [];
  set2 = set2 || [];
  var idx;
  var len1 = set1.length;
  var len2 = set2.length;
  var result = [];
  idx = 0;

  while (idx < len1) {
    result[result.length] = set1[idx];
    idx += 1;
  }

  idx = 0;

  while (idx < len2) {
    result[result.length] = set2[idx];
    idx += 1;
  }

  return result;
}
},{}],"node_modules/ramda/es/internal/_arity.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _arity;

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };

    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };

    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };

    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}
},{}],"node_modules/ramda/es/internal/_curryN.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _curryN;

var _arity2 = _interopRequireDefault(require("./_arity.js"));

var _isPlaceholder2 = _interopRequireDefault(require("./_isPlaceholder.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;

      if (combinedIdx < received.length && (!(0, _isPlaceholder2.default)(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;

      if (!(0, _isPlaceholder2.default)(result)) {
        left -= 1;
      }

      combinedIdx += 1;
    }

    return left <= 0 ? fn.apply(this, combined) : (0, _arity2.default)(left, _curryN(length, combined, fn));
  };
}
},{"./_arity.js":"node_modules/ramda/es/internal/_arity.js","./_isPlaceholder.js":"node_modules/ramda/es/internal/_isPlaceholder.js"}],"node_modules/ramda/es/curryN.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curry3 = _interopRequireDefault(require("./internal/_curry2.js"));

var _curryN2 = _interopRequireDefault(require("./internal/_curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */
var curryN =
/*#__PURE__*/
(0, _curry3.default)(function curryN(length, fn) {
  if (length === 1) {
    return (0, _curry.default)(fn);
  }

  return (0, _arity2.default)(length, (0, _curryN2.default)(length, [], fn));
});
var _default = curryN;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_curryN.js":"node_modules/ramda/es/internal/_curryN.js"}],"node_modules/ramda/es/addIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new list iteration function from an existing one by adding two new
 * parameters to its callback function: the current index, and the entire list.
 *
 * This would turn, for instance, [`R.map`](#map) function into one that
 * more closely resembles `Array.prototype.map`. Note that this will only work
 * for functions in which the iteration callback function is the first
 * parameter, and where the list is the last parameter. (This latter might be
 * unimportant if the list parameter is not used.)
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Function
 * @category List
 * @sig ((a ... -> b) ... -> [a] -> *) -> ((a ..., Int, [a] -> b) ... -> [a] -> *)
 * @param {Function} fn A list iteration function that does not pass index or list to its callback
 * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
 * @example
 *
 *      const mapIndexed = R.addIndex(R.map);
 *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
 *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
 */
var addIndex =
/*#__PURE__*/
(0, _curry.default)(function addIndex(fn) {
  return (0, _curryN.default)(fn.length, function () {
    var idx = 0;
    var origFn = arguments[0];
    var list = arguments[arguments.length - 1];
    var args = Array.prototype.slice.call(arguments, 0);

    args[0] = function () {
      var result = origFn.apply(this, (0, _concat2.default)(arguments, [idx, list]));
      idx += 1;
      return result;
    };

    return fn.apply(this, args);
  });
});
var _default = addIndex;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/internal/_curry3.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _curry3;

var _curry = _interopRequireDefault(require("./_curry1.js"));

var _curry4 = _interopRequireDefault(require("./_curry2.js"));

var _isPlaceholder2 = _interopRequireDefault(require("./_isPlaceholder.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;

      case 1:
        return (0, _isPlaceholder2.default)(a) ? f3 : (0, _curry4.default)(function (_b, _c) {
          return fn(a, _b, _c);
        });

      case 2:
        return (0, _isPlaceholder2.default)(a) && (0, _isPlaceholder2.default)(b) ? f3 : (0, _isPlaceholder2.default)(a) ? (0, _curry4.default)(function (_a, _c) {
          return fn(_a, b, _c);
        }) : (0, _isPlaceholder2.default)(b) ? (0, _curry4.default)(function (_b, _c) {
          return fn(a, _b, _c);
        }) : (0, _curry.default)(function (_c) {
          return fn(a, b, _c);
        });

      default:
        return (0, _isPlaceholder2.default)(a) && (0, _isPlaceholder2.default)(b) && (0, _isPlaceholder2.default)(c) ? f3 : (0, _isPlaceholder2.default)(a) && (0, _isPlaceholder2.default)(b) ? (0, _curry4.default)(function (_a, _b) {
          return fn(_a, _b, c);
        }) : (0, _isPlaceholder2.default)(a) && (0, _isPlaceholder2.default)(c) ? (0, _curry4.default)(function (_a, _c) {
          return fn(_a, b, _c);
        }) : (0, _isPlaceholder2.default)(b) && (0, _isPlaceholder2.default)(c) ? (0, _curry4.default)(function (_b, _c) {
          return fn(a, _b, _c);
        }) : (0, _isPlaceholder2.default)(a) ? (0, _curry.default)(function (_a) {
          return fn(_a, b, c);
        }) : (0, _isPlaceholder2.default)(b) ? (0, _curry.default)(function (_b) {
          return fn(a, _b, c);
        }) : (0, _isPlaceholder2.default)(c) ? (0, _curry.default)(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}
},{"./_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_isPlaceholder.js":"node_modules/ramda/es/internal/_isPlaceholder.js"}],"node_modules/ramda/es/adjust.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Applies a function to the value at the given index of an array, returning a
 * new copy of the array with the element at the given index replaced with the
 * result of the function application.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig Number -> (a -> a) -> [a] -> [a]
 * @param {Number} idx The index.
 * @param {Function} fn The function to apply.
 * @param {Array|Arguments} list An array-like object whose value
 *        at the supplied index will be replaced.
 * @return {Array} A copy of the supplied array-like object with
 *         the element at index `idx` replaced with the value
 *         returned by applying `fn` to the existing element.
 * @see R.update
 * @example
 *
 *      R.adjust(1, R.toUpper, ['a', 'b', 'c', 'd']);      //=> ['a', 'B', 'c', 'd']
 *      R.adjust(-1, R.toUpper, ['a', 'b', 'c', 'd']);     //=> ['a', 'b', 'c', 'D']
 * @symb R.adjust(-1, f, [a, b]) = [a, f(b)]
 * @symb R.adjust(0, f, [a, b]) = [f(a), b]
 */
var adjust =
/*#__PURE__*/
(0, _curry.default)(function adjust(idx, fn, list) {
  if (idx >= list.length || idx < -list.length) {
    return list;
  }

  var start = idx < 0 ? list.length : 0;

  var _idx = start + idx;

  var _list = (0, _concat2.default)(list);

  _list[_idx] = fn(list[_idx]);
  return _list;
});
var _default = adjust;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/internal/_isArray.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
var _default = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

exports.default = _default;
},{}],"node_modules/ramda/es/internal/_isTransformer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isTransformer;

function _isTransformer(obj) {
  return obj != null && typeof obj['@@transducer/step'] === 'function';
}
},{}],"node_modules/ramda/es/internal/_dispatchable.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _dispatchable;

var _isArray2 = _interopRequireDefault(require("./_isArray.js"));

var _isTransformer2 = _interopRequireDefault(require("./_isTransformer.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer [xf] to return a new transformer (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */
function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }

    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();

    if (!(0, _isArray2.default)(obj)) {
      var idx = 0;

      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }

        idx += 1;
      }

      if ((0, _isTransformer2.default)(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }

    return fn.apply(this, arguments);
  };
}
},{"./_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./_isTransformer.js":"node_modules/ramda/es/internal/_isTransformer.js"}],"node_modules/ramda/es/internal/_reduced.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _reduced;

function _reduced(x) {
  return x && x['@@transducer/reduced'] ? x : {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}
},{}],"node_modules/ramda/es/internal/_xfBase.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};
exports.default = _default;
},{}],"node_modules/ramda/es/internal/_xall.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XAll =
/*#__PURE__*/
function () {
  function XAll(f, xf) {
    this.xf = xf;
    this.f = f;
    this.all = true;
  }

  XAll.prototype['@@transducer/init'] = _xfBase2.default.init;

  XAll.prototype['@@transducer/result'] = function (result) {
    if (this.all) {
      result = this.xf['@@transducer/step'](result, true);
    }

    return this.xf['@@transducer/result'](result);
  };

  XAll.prototype['@@transducer/step'] = function (result, input) {
    if (!this.f(input)) {
      this.all = false;
      result = (0, _reduced2.default)(this.xf['@@transducer/step'](result, false));
    }

    return result;
  };

  return XAll;
}();

var _xall =
/*#__PURE__*/
(0, _curry.default)(function _xall(f, xf) {
  return new XAll(f, xf);
});

var _default = _xall;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/all.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xall2 = _interopRequireDefault(require("./internal/_xall.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if all elements of the list match the predicate, `false` if
 * there are any that don't.
 *
 * Dispatches to the `all` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
 *         otherwise.
 * @see R.any, R.none, R.transduce
 * @example
 *
 *      const equals3 = R.equals(3);
 *      R.all(equals3)([3, 3, 3, 3]); //=> true
 *      R.all(equals3)([3, 3, 1, 3]); //=> false
 */
var all =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['all'], _xall2.default, function all(fn, list) {
  var idx = 0;

  while (idx < list.length) {
    if (!fn(list[idx])) {
      return false;
    }

    idx += 1;
  }

  return true;
}));
var _default = all;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xall.js":"node_modules/ramda/es/internal/_xall.js"}],"node_modules/ramda/es/max.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the larger of its two arguments.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> a
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.maxBy, R.min
 * @example
 *
 *      R.max(789, 123); //=> 789
 *      R.max('a', 'b'); //=> 'b'
 */
var max =
/*#__PURE__*/
(0, _curry.default)(function max(a, b) {
  return b > a ? b : a;
});
var _default = max;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _map;

function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);

  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }

  return result;
}
},{}],"node_modules/ramda/es/internal/_isString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isString;

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}
},{}],"node_modules/ramda/es/internal/_isArrayLike.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry1.js"));

var _isArray2 = _interopRequireDefault(require("./_isArray.js"));

var _isString2 = _interopRequireDefault(require("./_isString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */
var _isArrayLike =
/*#__PURE__*/
(0, _curry.default)(function isArrayLike(x) {
  if ((0, _isArray2.default)(x)) {
    return true;
  }

  if (!x) {
    return false;
  }

  if (typeof x !== 'object') {
    return false;
  }

  if ((0, _isString2.default)(x)) {
    return false;
  }

  if (x.nodeType === 1) {
    return !!x.length;
  }

  if (x.length === 0) {
    return true;
  }

  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }

  return false;
});

var _default = _isArrayLike;
exports.default = _default;
},{"./_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./_isString.js":"node_modules/ramda/es/internal/_isString.js"}],"node_modules/ramda/es/internal/_xwrap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _xwrap;

var XWrap =
/*#__PURE__*/
function () {
  function XWrap(fn) {
    this.f = fn;
  }

  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };

  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };

  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}
},{}],"node_modules/ramda/es/bind.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */
var bind =
/*#__PURE__*/
(0, _curry.default)(function bind(fn, thisObj) {
  return (0, _arity2.default)(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});
var _default = bind;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_reduce.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _reduce;

var _isArrayLike2 = _interopRequireDefault(require("./_isArrayLike.js"));

var _xwrap2 = _interopRequireDefault(require("./_xwrap.js"));

var _bind = _interopRequireDefault(require("../bind.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    idx += 1;
  }

  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();

  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    step = iter.next();
  }

  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName]((0, _bind.default)(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';

function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = (0, _xwrap2.default)(fn);
  }

  if ((0, _isArrayLike2.default)(list)) {
    return _arrayReduce(fn, acc, list);
  }

  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }

  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }

  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }

  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}
},{"./_isArrayLike.js":"node_modules/ramda/es/internal/_isArrayLike.js","./_xwrap.js":"node_modules/ramda/es/internal/_xwrap.js","../bind.js":"node_modules/ramda/es/bind.js"}],"node_modules/ramda/es/internal/_xmap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XMap =
/*#__PURE__*/
function () {
  function XMap(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XMap.prototype['@@transducer/init'] = _xfBase2.default.init;
  XMap.prototype['@@transducer/result'] = _xfBase2.default.result;

  XMap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, this.f(input));
  };

  return XMap;
}();

var _xmap =
/*#__PURE__*/
(0, _curry.default)(function _xmap(f, xf) {
  return new XMap(f, xf);
});

var _default = _xmap;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/internal/_has.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _has;

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
},{}],"node_modules/ramda/es/internal/_isArguments.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _has2 = _interopRequireDefault(require("./_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toString = Object.prototype.toString;

var _isArguments =
/*#__PURE__*/
function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return (0, _has2.default)('callee', x);
  };
}();

var _default = _isArguments;
exports.default = _default;
},{"./_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/keys.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

var _isArguments2 = _interopRequireDefault(require("./internal/_isArguments.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// cover IE < 9 keys issues
var hasEnumBug = !
/*#__PURE__*/
{
  toString: null
}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

var hasArgsEnumBug =
/*#__PURE__*/
function () {
  'use strict';

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;

  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }

    idx += 1;
  }

  return false;
};
/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */


var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
/*#__PURE__*/
(0, _curry.default)(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) :
/*#__PURE__*/
(0, _curry.default)(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }

  var prop, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && (0, _isArguments2.default)(obj);

  for (prop in obj) {
    if ((0, _has2.default)(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }

  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;

    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];

      if ((0, _has2.default)(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }

      nIdx -= 1;
    }
  }

  return ks;
});
var _default = keys;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js","./internal/_isArguments.js":"node_modules/ramda/es/internal/_isArguments.js"}],"node_modules/ramda/es/map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _map2 = _interopRequireDefault(require("./internal/_map.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _xmap2 = _interopRequireDefault(require("./internal/_xmap.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function and
 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
 * applies the function to each of the functor's values, and returns
 * a functor of the same shape.
 *
 * Ramda provides suitable `map` implementations for `Array` and `Object`,
 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
 *
 * Dispatches to the `map` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * Also treats functions as functors and will compose them together.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => (a -> b) -> f a -> f b
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {Array} list The list to be iterated over.
 * @return {Array} The new list.
 * @see R.transduce, R.addIndex
 * @example
 *
 *      const double = x => x * 2;
 *
 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
 *
 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
 * @symb R.map(f, [a, b]) = [f(a), f(b)]
 * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
 * @symb R.map(f, functor_o) = functor_o.map(f)
 */
var map =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['fantasy-land/map', 'map'], _xmap2.default, function map(fn, functor) {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return (0, _curryN.default)(functor.length, function () {
        return fn.call(this, functor.apply(this, arguments));
      });

    case '[object Object]':
      return (0, _reduce2.default)(function (acc, key) {
        acc[key] = fn(functor[key]);
        return acc;
      }, {}, (0, _keys.default)(functor));

    default:
      return (0, _map2.default)(fn, functor);
  }
}));
var _default = map;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_map.js":"node_modules/ramda/es/internal/_map.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_xmap.js":"node_modules/ramda/es/internal/_xmap.js","./curryN.js":"node_modules/ramda/es/curryN.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/path.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Retrieve the value at a given path.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> a | Undefined
 * @param {Array} path The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path`.
 * @see R.prop
 * @example
 *
 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
 */
var path =
/*#__PURE__*/
(0, _curry.default)(function path(paths, obj) {
  var val = obj;
  var idx = 0;

  while (idx < paths.length) {
    if (val == null) {
      return;
    }

    val = val[paths[idx]];
    idx += 1;
  }

  return val;
});
var _default = path;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/prop.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _path = _interopRequireDefault(require("./path.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function that when supplied an object returns the indicated
 * property of that object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig s -> {s: a} -> a | Undefined
 * @param {String} p The property name
 * @param {Object} obj The object to query
 * @return {*} The value at `obj.p`.
 * @see R.path
 * @example
 *
 *      R.prop('x', {x: 100}); //=> 100
 *      R.prop('x', {}); //=> undefined
 *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
 */
var prop =
/*#__PURE__*/
(0, _curry.default)(function prop(p, obj) {
  return (0, _path.default)([p], obj);
});
var _default = prop;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./path.js":"node_modules/ramda/es/path.js"}],"node_modules/ramda/es/pluck.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _prop = _interopRequireDefault(require("./prop.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list by plucking the same named property off all objects in
 * the list supplied.
 *
 * `pluck` will work on
 * any [functor](https://github.com/fantasyland/fantasy-land#functor) in
 * addition to arrays, as it is equivalent to `R.map(R.prop(k), f)`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => k -> f {k: v} -> f v
 * @param {Number|String} key The key name to pluck off of each object.
 * @param {Array} f The array or functor to consider.
 * @return {Array} The list of values for the given key.
 * @see R.props
 * @example
 *
 *      var getAges = R.pluck('age');
 *      getAges([{name: 'fred', age: 29}, {name: 'wilma', age: 27}]); //=> [29, 27]
 *
 *      R.pluck(0, [[1, 2], [3, 4]]);               //=> [1, 3]
 *      R.pluck('val', {a: {val: 3}, b: {val: 5}}); //=> {a: 3, b: 5}
 * @symb R.pluck('x', [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]) = [1, 3, 5]
 * @symb R.pluck(0, [[1, 2], [3, 4], [5, 6]]) = [1, 3, 5]
 */
var pluck =
/*#__PURE__*/
(0, _curry.default)(function pluck(p, list) {
  return (0, _map.default)((0, _prop.default)(p), list);
});
var _default = pluck;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./map.js":"node_modules/ramda/es/map.js","./prop.js":"node_modules/ramda/es/prop.js"}],"node_modules/ramda/es/reduce.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */
var reduce =
/*#__PURE__*/
(0, _curry.default)(_reduce2.default);
var _default = reduce;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js"}],"node_modules/ramda/es/allPass.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _pluck = _interopRequireDefault(require("./pluck.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a list of predicates and returns a predicate that returns true for a
 * given list of arguments if every one of the provided predicates is satisfied
 * by those arguments.
 *
 * The function returned is a curried function whose arity matches that of the
 * highest-arity predicate.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Logic
 * @sig [(*... -> Boolean)] -> (*... -> Boolean)
 * @param {Array} predicates An array of predicates to check
 * @return {Function} The combined predicate
 * @see R.anyPass
 * @example
 *
 *      const isQueen = R.propEq('rank', 'Q');
 *      const isSpade = R.propEq('suit', '♠︎');
 *      const isQueenOfSpades = R.allPass([isQueen, isSpade]);
 *
 *      isQueenOfSpades({rank: 'Q', suit: '♣︎'}); //=> false
 *      isQueenOfSpades({rank: 'Q', suit: '♠︎'}); //=> true
 */
var allPass =
/*#__PURE__*/
(0, _curry.default)(function allPass(preds) {
  return (0, _curryN.default)((0, _reduce.default)(_max.default, 0, (0, _pluck.default)('length', preds)), function () {
    var idx = 0;
    var len = preds.length;

    while (idx < len) {
      if (!preds[idx].apply(this, arguments)) {
        return false;
      }

      idx += 1;
    }

    return true;
  });
});
var _default = allPass;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js","./max.js":"node_modules/ramda/es/max.js","./pluck.js":"node_modules/ramda/es/pluck.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/always.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      const t = R.always('Tee');
 *      t(); //=> 'Tee'
 */
var always =
/*#__PURE__*/
(0, _curry.default)(function always(val) {
  return function () {
    return val;
  };
});
var _default = always;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/and.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if both arguments are `true`; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {Any} a
 * @param {Any} b
 * @return {Any} the first argument if it is falsy, otherwise the second argument.
 * @see R.both
 * @example
 *
 *      R.and(true, true); //=> true
 *      R.and(true, false); //=> false
 *      R.and(false, true); //=> false
 *      R.and(false, false); //=> false
 */
var and =
/*#__PURE__*/
(0, _curry.default)(function and(a, b) {
  return a && b;
});
var _default = and;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_xany.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XAny =
/*#__PURE__*/
function () {
  function XAny(f, xf) {
    this.xf = xf;
    this.f = f;
    this.any = false;
  }

  XAny.prototype['@@transducer/init'] = _xfBase2.default.init;

  XAny.prototype['@@transducer/result'] = function (result) {
    if (!this.any) {
      result = this.xf['@@transducer/step'](result, false);
    }

    return this.xf['@@transducer/result'](result);
  };

  XAny.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.any = true;
      result = (0, _reduced2.default)(this.xf['@@transducer/step'](result, true));
    }

    return result;
  };

  return XAny;
}();

var _xany =
/*#__PURE__*/
(0, _curry.default)(function _xany(f, xf) {
  return new XAny(f, xf);
});

var _default = _xany;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/any.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xany2 = _interopRequireDefault(require("./internal/_xany.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if at least one of the elements of the list match the predicate,
 * `false` otherwise.
 *
 * Dispatches to the `any` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
 *         otherwise.
 * @see R.all, R.none, R.transduce
 * @example
 *
 *      const lessThan0 = R.flip(R.lt)(0);
 *      const lessThan2 = R.flip(R.lt)(2);
 *      R.any(lessThan0)([1, 2]); //=> false
 *      R.any(lessThan2)([1, 2]); //=> true
 */
var any =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['any'], _xany2.default, function any(fn, list) {
  var idx = 0;

  while (idx < list.length) {
    if (fn(list[idx])) {
      return true;
    }

    idx += 1;
  }

  return false;
}));
var _default = any;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xany.js":"node_modules/ramda/es/internal/_xany.js"}],"node_modules/ramda/es/anyPass.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _pluck = _interopRequireDefault(require("./pluck.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a list of predicates and returns a predicate that returns true for a
 * given list of arguments if at least one of the provided predicates is
 * satisfied by those arguments.
 *
 * The function returned is a curried function whose arity matches that of the
 * highest-arity predicate.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Logic
 * @sig [(*... -> Boolean)] -> (*... -> Boolean)
 * @param {Array} predicates An array of predicates to check
 * @return {Function} The combined predicate
 * @see R.allPass
 * @example
 *
 *      const isClub = R.propEq('suit', '♣');
 *      const isSpade = R.propEq('suit', '♠');
 *      const isBlackCard = R.anyPass([isClub, isSpade]);
 *
 *      isBlackCard({rank: '10', suit: '♣'}); //=> true
 *      isBlackCard({rank: 'Q', suit: '♠'}); //=> true
 *      isBlackCard({rank: 'Q', suit: '♦'}); //=> false
 */
var anyPass =
/*#__PURE__*/
(0, _curry.default)(function anyPass(preds) {
  return (0, _curryN.default)((0, _reduce.default)(_max.default, 0, (0, _pluck.default)('length', preds)), function () {
    var idx = 0;
    var len = preds.length;

    while (idx < len) {
      if (preds[idx].apply(this, arguments)) {
        return true;
      }

      idx += 1;
    }

    return false;
  });
});
var _default = anyPass;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js","./max.js":"node_modules/ramda/es/max.js","./pluck.js":"node_modules/ramda/es/pluck.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/ap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _map = _interopRequireDefault(require("./map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ap applies a list of functions to a list of values.
 *
 * Dispatches to the `ap` method of the second argument, if present. Also
 * treats curried functions as applicatives.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig [a -> b] -> [a] -> [b]
 * @sig Apply f => f (a -> b) -> f a -> f b
 * @sig (r -> a -> b) -> (r -> a) -> (r -> b)
 * @param {*} applyF
 * @param {*} applyX
 * @return {*}
 * @example
 *
 *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
 *      R.ap([R.concat('tasty '), R.toUpper], ['pizza', 'salad']); //=> ["tasty pizza", "tasty salad", "PIZZA", "SALAD"]
 *
 *      // R.ap can also be used as S combinator
 *      // when only two functions are passed
 *      R.ap(R.concat, R.toUpper)('Ramda') //=> 'RamdaRAMDA'
 * @symb R.ap([f, g], [a, b]) = [f(a), f(b), g(a), g(b)]
 */
var ap =
/*#__PURE__*/
(0, _curry.default)(function ap(applyF, applyX) {
  return typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) : typeof applyF.ap === 'function' ? applyF.ap(applyX) : typeof applyF === 'function' ? function (x) {
    return applyF(x)(applyX(x));
  } : (0, _reduce2.default)(function (acc, f) {
    return (0, _concat2.default)(acc, (0, _map.default)(f, applyX));
  }, [], applyF);
});
var _default = ap;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/internal/_aperture.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _aperture;

function _aperture(n, list) {
  var idx = 0;
  var limit = list.length - (n - 1);
  var acc = new Array(limit >= 0 ? limit : 0);

  while (idx < limit) {
    acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
    idx += 1;
  }

  return acc;
}
},{}],"node_modules/ramda/es/internal/_xaperture.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./_concat.js"));

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XAperture =
/*#__PURE__*/
function () {
  function XAperture(n, xf) {
    this.xf = xf;
    this.pos = 0;
    this.full = false;
    this.acc = new Array(n);
  }

  XAperture.prototype['@@transducer/init'] = _xfBase2.default.init;

  XAperture.prototype['@@transducer/result'] = function (result) {
    this.acc = null;
    return this.xf['@@transducer/result'](result);
  };

  XAperture.prototype['@@transducer/step'] = function (result, input) {
    this.store(input);
    return this.full ? this.xf['@@transducer/step'](result, this.getCopy()) : result;
  };

  XAperture.prototype.store = function (input) {
    this.acc[this.pos] = input;
    this.pos += 1;

    if (this.pos === this.acc.length) {
      this.pos = 0;
      this.full = true;
    }
  };

  XAperture.prototype.getCopy = function () {
    return (0, _concat2.default)(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
  };

  return XAperture;
}();

var _xaperture =
/*#__PURE__*/
(0, _curry.default)(function _xaperture(n, xf) {
  return new XAperture(n, xf);
});

var _default = _xaperture;
exports.default = _default;
},{"./_concat.js":"node_modules/ramda/es/internal/_concat.js","./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/aperture.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _aperture2 = _interopRequireDefault(require("./internal/_aperture.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xaperture2 = _interopRequireDefault(require("./internal/_xaperture.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list, composed of n-tuples of consecutive elements. If `n` is
 * greater than the length of the list, an empty list is returned.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @param {Number} n The size of the tuples to create
 * @param {Array} list The list to split into `n`-length tuples
 * @return {Array} The resulting list of `n`-length tuples
 * @see R.transduce
 * @example
 *
 *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
 *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
 */
var aperture =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xaperture2.default, _aperture2.default));
var _default = aperture;
exports.default = _default;
},{"./internal/_aperture.js":"node_modules/ramda/es/internal/_aperture.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xaperture.js":"node_modules/ramda/es/internal/_xaperture.js"}],"node_modules/ramda/es/append.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing the contents of the given list, followed by
 * the given element.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The element to add to the end of the new list.
 * @param {Array} list The list of elements to add a new item to.
 *        list.
 * @return {Array} A new list containing the elements of the old list followed by `el`.
 * @see R.prepend
 * @example
 *
 *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
 *      R.append('tests', []); //=> ['tests']
 *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
 */
var append =
/*#__PURE__*/
(0, _curry.default)(function append(el, list) {
  return (0, _concat2.default)(list, [el]);
});
var _default = append;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/apply.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Applies function `fn` to the argument list `args`. This is useful for
 * creating a fixed-arity function from a variadic function. `fn` should be a
 * bound function if context is significant.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig (*... -> a) -> [*] -> a
 * @param {Function} fn The function which will be called with `args`
 * @param {Array} args The arguments to call `fn` with
 * @return {*} result The result, equivalent to `fn(...args)`
 * @see R.call, R.unapply
 * @example
 *
 *      const nums = [1, 2, 3, -99, 42, 6, 7];
 *      R.apply(Math.max, nums); //=> 42
 * @symb R.apply(f, [a, b, c]) = f(a, b, c)
 */
var apply =
/*#__PURE__*/
(0, _curry.default)(function apply(fn, args) {
  return fn.apply(this, args);
});
var _default = apply;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/values.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a list of all the enumerable own properties of the supplied object.
 * Note that the order of the output array is not guaranteed across different
 * JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own properties.
 * @see R.valuesIn, R.keys
 * @example
 *
 *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
 */
var values =
/*#__PURE__*/
(0, _curry.default)(function values(obj) {
  var props = (0, _keys.default)(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;

  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }

  return vals;
});
var _default = values;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/applySpec.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _apply = _interopRequireDefault(require("./apply.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _pluck = _interopRequireDefault(require("./pluck.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

var _values = _interopRequireDefault(require("./values.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Use custom mapValues function to avoid issues with specs that include a "map" key and R.map
// delegating calls to .map
function mapValues(fn, obj) {
  return (0, _keys.default)(obj).reduce(function (acc, key) {
    acc[key] = fn(obj[key]);
    return acc;
  }, {});
}
/**
 * Given a spec object recursively mapping properties to functions, creates a
 * function producing an object of the same structure, by mapping each property
 * to the result of calling its associated function with the supplied arguments.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Function
 * @sig {k: ((a, b, ..., m) -> v)} -> ((a, b, ..., m) -> {k: v})
 * @param {Object} spec an object recursively mapping properties to functions for
 *        producing the values for these properties.
 * @return {Function} A function that returns an object of the same structure
 * as `spec', with each property set to the value returned by calling its
 * associated function with the supplied arguments.
 * @see R.converge, R.juxt
 * @example
 *
 *      const getMetrics = R.applySpec({
 *        sum: R.add,
 *        nested: { mul: R.multiply }
 *      });
 *      getMetrics(2, 4); // => { sum: 6, nested: { mul: 8 } }
 * @symb R.applySpec({ x: f, y: { z: g } })(a, b) = { x: f(a, b), y: { z: g(a, b) } }
 */


var applySpec =
/*#__PURE__*/
(0, _curry.default)(function applySpec(spec) {
  spec = mapValues(function (v) {
    return typeof v == 'function' ? v : applySpec(v);
  }, spec);
  return (0, _curryN.default)((0, _reduce.default)(_max.default, 0, (0, _pluck.default)('length', (0, _values.default)(spec))), function () {
    var args = arguments;
    return mapValues(function (f) {
      return (0, _apply.default)(f, args);
    }, spec);
  });
});
var _default = applySpec;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./apply.js":"node_modules/ramda/es/apply.js","./curryN.js":"node_modules/ramda/es/curryN.js","./max.js":"node_modules/ramda/es/max.js","./pluck.js":"node_modules/ramda/es/pluck.js","./reduce.js":"node_modules/ramda/es/reduce.js","./keys.js":"node_modules/ramda/es/keys.js","./values.js":"node_modules/ramda/es/values.js"}],"node_modules/ramda/es/applyTo.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a value and applies a function to it.
 *
 * This function is also known as the `thrush` combinator.
 *
 * @func
 * @memberOf R
 * @since v0.25.0
 * @category Function
 * @sig a -> (a -> b) -> b
 * @param {*} x The value
 * @param {Function} f The function to apply
 * @return {*} The result of applying `f` to `x`
 * @example
 *
 *      const t42 = R.applyTo(42);
 *      t42(R.identity); //=> 42
 *      t42(R.add(1)); //=> 43
 */
var applyTo =
/*#__PURE__*/
(0, _curry.default)(function applyTo(x, f) {
  return f(x);
});
var _default = applyTo;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/ascend.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes an ascending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Function
 * @sig Ord b => (a -> b) -> a -> a -> Number
 * @param {Function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @return {Number} `-1` if fn(a) < fn(b), `1` if fn(b) < fn(a), otherwise `0`
 * @see R.descend
 * @example
 *
 *      const byAge = R.ascend(R.prop('age'));
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByYoungestFirst = R.sort(byAge, people);
 *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
 */
var ascend =
/*#__PURE__*/
(0, _curry.default)(function ascend(fn, a, b) {
  var aa = fn(a);
  var bb = fn(b);
  return aa < bb ? -1 : aa > bb ? 1 : 0;
});
var _default = ascend;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/assoc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig String -> a -> {k: v} -> {k: v}
 * @param {String} prop The property name to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @see R.dissoc, R.pick
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */
var assoc =
/*#__PURE__*/
(0, _curry.default)(function assoc(prop, val, obj) {
  var result = {};

  for (var p in obj) {
    result[p] = obj[p];
  }

  result[prop] = val;
  return result;
});
var _default = assoc;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/internal/_isInteger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */
var _default = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};

exports.default = _default;
},{}],"node_modules/ramda/es/isNil.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Type
 * @sig * -> Boolean
 * @param {*} x The value to test.
 * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 *
 *      R.isNil(null); //=> true
 *      R.isNil(undefined); //=> true
 *      R.isNil(0); //=> false
 *      R.isNil([]); //=> false
 */
var isNil =
/*#__PURE__*/
(0, _curry.default)(function isNil(x) {
  return x == null;
});
var _default = isNil;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/assocPath.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

var _isInteger2 = _interopRequireDefault(require("./internal/_isInteger.js"));

var _assoc = _interopRequireDefault(require("./assoc.js"));

var _isNil = _interopRequireDefault(require("./isNil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes a shallow clone of an object, setting or overriding the nodes required
 * to create the given path, and placing the specific value at the tail end of
 * that path. Note that this copies and flattens prototype properties onto the
 * new object as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> {a}
 * @param {Array} path the path to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except along the specified path.
 * @see R.dissocPath
 * @example
 *
 *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */
var assocPath =
/*#__PURE__*/
(0, _curry.default)(function assocPath(path, val, obj) {
  if (path.length === 0) {
    return val;
  }

  var idx = path[0];

  if (path.length > 1) {
    var nextObj = !(0, _isNil.default)(obj) && (0, _has2.default)(idx, obj) ? obj[idx] : (0, _isInteger2.default)(path[1]) ? [] : {};
    val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
  }

  if ((0, _isInteger2.default)(idx) && (0, _isArray2.default)(obj)) {
    var arr = [].concat(obj);
    arr[idx] = val;
    return arr;
  } else {
    return (0, _assoc.default)(idx, val, obj);
  }
});
var _default = assocPath;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./internal/_isInteger.js":"node_modules/ramda/es/internal/_isInteger.js","./assoc.js":"node_modules/ramda/es/assoc.js","./isNil.js":"node_modules/ramda/es/isNil.js"}],"node_modules/ramda/es/nAry.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly `n` parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} n The desired arity of the new function.
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity `n`.
 * @see R.binary, R.unary
 * @example
 *
 *      const takesTwoArgs = (a, b) => [a, b];
 *
 *      takesTwoArgs.length; //=> 2
 *      takesTwoArgs(1, 2); //=> [1, 2]
 *
 *      const takesOneArg = R.nAry(1, takesTwoArgs);
 *      takesOneArg.length; //=> 1
 *      // Only `n` arguments are passed to the wrapped function
 *      takesOneArg(1, 2); //=> [1, undefined]
 * @symb R.nAry(0, f)(a, b) = f()
 * @symb R.nAry(1, f)(a, b) = f(a)
 * @symb R.nAry(2, f)(a, b) = f(a, b)
 */
var nAry =
/*#__PURE__*/
(0, _curry.default)(function nAry(n, fn) {
  switch (n) {
    case 0:
      return function () {
        return fn.call(this);
      };

    case 1:
      return function (a0) {
        return fn.call(this, a0);
      };

    case 2:
      return function (a0, a1) {
        return fn.call(this, a0, a1);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.call(this, a0, a1, a2);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.call(this, a0, a1, a2, a3);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.call(this, a0, a1, a2, a3, a4);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.call(this, a0, a1, a2, a3, a4, a5);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      };

    default:
      throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
  }
});
var _default = nAry;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/binary.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _nAry = _interopRequireDefault(require("./nAry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 2 parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Function
 * @sig (* -> c) -> (a, b -> c)
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity 2.
 * @see R.nAry, R.unary
 * @example
 *
 *      const takesThreeArgs = function(a, b, c) {
 *        return [a, b, c];
 *      };
 *      takesThreeArgs.length; //=> 3
 *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
 *
 *      const takesTwoArgs = R.binary(takesThreeArgs);
 *      takesTwoArgs.length; //=> 2
 *      // Only 2 arguments are passed to the wrapped function
 *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
 * @symb R.binary(f)(a, b, c) = f(a, b)
 */
var binary =
/*#__PURE__*/
(0, _curry.default)(function binary(fn) {
  return (0, _nAry.default)(2, fn);
});
var _default = binary;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./nAry.js":"node_modules/ramda/es/nAry.js"}],"node_modules/ramda/es/internal/_isFunction.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isFunction;

function _isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}
},{}],"node_modules/ramda/es/liftN.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _ap = _interopRequireDefault(require("./ap.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _map = _interopRequireDefault(require("./map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * "lifts" a function to be the specified arity, so that it may "map over" that
 * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig Number -> (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.lift, R.ap
 * @example
 *
 *      const madd3 = R.liftN(3, (...args) => R.sum(args));
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 */
var liftN =
/*#__PURE__*/
(0, _curry.default)(function liftN(arity, fn) {
  var lifted = (0, _curryN.default)(arity, fn);
  return (0, _curryN.default)(arity, function () {
    return (0, _reduce2.default)(_ap.default, (0, _map.default)(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
  });
});
var _default = liftN;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./ap.js":"node_modules/ramda/es/ap.js","./curryN.js":"node_modules/ramda/es/curryN.js","./map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/lift.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _liftN = _interopRequireDefault(require("./liftN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
 * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.liftN
 * @example
 *
 *      const madd3 = R.lift((a, b, c) => a + b + c);
 *
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 *
 *      const madd5 = R.lift((a, b, c, d, e) => a + b + c + d + e);
 *
 *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
 */
var lift =
/*#__PURE__*/
(0, _curry.default)(function lift(fn) {
  return (0, _liftN.default)(fn.length, fn);
});
var _default = lift;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./liftN.js":"node_modules/ramda/es/liftN.js"}],"node_modules/ramda/es/both.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isFunction2 = _interopRequireDefault(require("./internal/_isFunction.js"));

var _and = _interopRequireDefault(require("./and.js"));

var _lift = _interopRequireDefault(require("./lift.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A function which calls the two provided functions and returns the `&&`
 * of the results.
 * It returns the result of the first function if it is false-y and the result
 * of the second function otherwise. Note that this is short-circuited,
 * meaning that the second function will not be invoked if the first returns a
 * false-y value.
 *
 * In addition to functions, `R.both` also accepts any fantasy-land compatible
 * applicative functor.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
 * @param {Function} f A predicate
 * @param {Function} g Another predicate
 * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
 * @see R.and
 * @example
 *
 *      const gt10 = R.gt(R.__, 10)
 *      const lt20 = R.lt(R.__, 20)
 *      const f = R.both(gt10, lt20);
 *      f(15); //=> true
 *      f(30); //=> false
 *
 *      R.both(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(false)
 *      R.both([false, false, 'a'], [11]); //=> [false, false, 11]
 */
var both =
/*#__PURE__*/
(0, _curry.default)(function both(f, g) {
  return (0, _isFunction2.default)(f) ? function _both() {
    return f.apply(this, arguments) && g.apply(this, arguments);
  } : (0, _lift.default)(_and.default)(f, g);
});
var _default = both;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isFunction.js":"node_modules/ramda/es/internal/_isFunction.js","./and.js":"node_modules/ramda/es/and.js","./lift.js":"node_modules/ramda/es/lift.js"}],"node_modules/ramda/es/curry.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a curried equivalent of the provided function. The curried function
 * has two unusual capabilities. First, its arguments needn't be provided one
 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> a) -> (* -> a)
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curryN, R.partial
 * @example
 *
 *      const addFourNumbers = (a, b, c, d) => a + b + c + d;
 *
 *      const curriedAddFourNumbers = R.curry(addFourNumbers);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */
var curry =
/*#__PURE__*/
(0, _curry.default)(function curry(fn) {
  return (0, _curryN.default)(fn.length, fn);
});
var _default = curry;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/call.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./curry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the result of calling its first argument with the remaining
 * arguments. This is occasionally useful as a converging function for
 * [`R.converge`](#converge): the first branch can produce a function while the
 * remaining branches produce values to be passed to that function as its
 * arguments.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig (*... -> a),*... -> a
 * @param {Function} fn The function to apply to the remaining arguments.
 * @param {...*} args Any number of positional arguments.
 * @return {*}
 * @see R.apply
 * @example
 *
 *      R.call(R.add, 1, 2); //=> 3
 *
 *      const indentN = R.pipe(R.repeat(' '),
 *                           R.join(''),
 *                           R.replace(/^(?!$)/gm));
 *
 *      const format = R.converge(R.call, [
 *                                  R.pipe(R.prop('indent'), indentN),
 *                                  R.prop('value')
 *                              ]);
 *
 *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
 * @symb R.call(f, a, b) = f(a, b)
 */
var call =
/*#__PURE__*/
(0, _curry.default)(function call(fn) {
  return fn.apply(this, Array.prototype.slice.call(arguments, 1));
});
var _default = call;
exports.default = _default;
},{"./curry.js":"node_modules/ramda/es/curry.js"}],"node_modules/ramda/es/internal/_makeFlat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _makeFlat;

var _isArrayLike2 = _interopRequireDefault(require("./_isArrayLike.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `_makeFlat` is a helper function that returns a one-level or fully recursive
 * function based on the flag passed in.
 *
 * @private
 */
function _makeFlat(recursive) {
  return function flatt(list) {
    var value, jlen, j;
    var result = [];
    var idx = 0;
    var ilen = list.length;

    while (idx < ilen) {
      if ((0, _isArrayLike2.default)(list[idx])) {
        value = recursive ? flatt(list[idx]) : list[idx];
        j = 0;
        jlen = value.length;

        while (j < jlen) {
          result[result.length] = value[j];
          j += 1;
        }
      } else {
        result[result.length] = list[idx];
      }

      idx += 1;
    }

    return result;
  };
}
},{"./_isArrayLike.js":"node_modules/ramda/es/internal/_isArrayLike.js"}],"node_modules/ramda/es/internal/_forceReduced.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _forceReduced;

function _forceReduced(x) {
  return {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}
},{}],"node_modules/ramda/es/internal/_flatCat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _forceReduced2 = _interopRequireDefault(require("./_forceReduced.js"));

var _isArrayLike2 = _interopRequireDefault(require("./_isArrayLike.js"));

var _reduce2 = _interopRequireDefault(require("./_reduce.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var preservingReduced = function (xf) {
  return {
    '@@transducer/init': _xfBase2.default.init,
    '@@transducer/result': function (result) {
      return xf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      var ret = xf['@@transducer/step'](result, input);
      return ret['@@transducer/reduced'] ? (0, _forceReduced2.default)(ret) : ret;
    }
  };
};

var _flatCat = function _xcat(xf) {
  var rxf = preservingReduced(xf);
  return {
    '@@transducer/init': _xfBase2.default.init,
    '@@transducer/result': function (result) {
      return rxf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      return !(0, _isArrayLike2.default)(input) ? (0, _reduce2.default)(rxf, result, [input]) : (0, _reduce2.default)(rxf, result, input);
    }
  };
};

var _default = _flatCat;
exports.default = _default;
},{"./_forceReduced.js":"node_modules/ramda/es/internal/_forceReduced.js","./_isArrayLike.js":"node_modules/ramda/es/internal/_isArrayLike.js","./_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/internal/_xchain.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _flatCat2 = _interopRequireDefault(require("./_flatCat.js"));

var _map = _interopRequireDefault(require("../map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _xchain =
/*#__PURE__*/
(0, _curry.default)(function _xchain(f, xf) {
  return (0, _map.default)(f, (0, _flatCat2.default)(xf));
});

var _default = _xchain;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_flatCat.js":"node_modules/ramda/es/internal/_flatCat.js","../map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/chain.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _makeFlat2 = _interopRequireDefault(require("./internal/_makeFlat.js"));

var _xchain2 = _interopRequireDefault(require("./internal/_xchain.js"));

var _map = _interopRequireDefault(require("./map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `chain` maps a function over a list and concatenates the results. `chain`
 * is also known as `flatMap` in some libraries.
 *
 * Dispatches to the `chain` method of the second argument, if present,
 * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
 *
 * If second argument is a function, `chain(f, g)(x)` is equivalent to `f(g(x), x)`.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain m => (a -> m b) -> m a -> m b
 * @param {Function} fn The function to map with
 * @param {Array} list The list to map over
 * @return {Array} The result of flat-mapping `list` with `fn`
 * @example
 *
 *      const duplicate = n => [n, n];
 *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
 *
 *      R.chain(R.append, R.head)([1, 2, 3]); //=> [1, 2, 3, 1]
 */
var chain =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['fantasy-land/chain', 'chain'], _xchain2.default, function chain(fn, monad) {
  if (typeof monad === 'function') {
    return function (x) {
      return fn(monad(x))(x);
    };
  }

  return (0, _makeFlat2.default)(false)((0, _map.default)(fn, monad));
}));
var _default = chain;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_makeFlat.js":"node_modules/ramda/es/internal/_makeFlat.js","./internal/_xchain.js":"node_modules/ramda/es/internal/_xchain.js","./map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/clamp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Restricts a number to be within a range.
 *
 * Also works for other ordered types such as Strings and Dates.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Relation
 * @sig Ord a => a -> a -> a -> a
 * @param {Number} minimum The lower limit of the clamp (inclusive)
 * @param {Number} maximum The upper limit of the clamp (inclusive)
 * @param {Number} value Value to be clamped
 * @return {Number} Returns `minimum` when `val < minimum`, `maximum` when `val > maximum`, returns `val` otherwise
 * @example
 *
 *      R.clamp(1, 10, -5) // => 1
 *      R.clamp(1, 10, 15) // => 10
 *      R.clamp(1, 10, 4)  // => 4
 */
var clamp =
/*#__PURE__*/
(0, _curry.default)(function clamp(min, max, value) {
  if (min > max) {
    throw new Error('min must not be greater than max in clamp(min, max, value)');
  }

  return value < min ? min : value > max ? max : value;
});
var _default = clamp;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/internal/_cloneRegExp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _cloneRegExp;

function _cloneRegExp(pattern) {
  return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}
},{}],"node_modules/ramda/es/type.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */
var type =
/*#__PURE__*/
(0, _curry.default)(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});
var _default = type;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/internal/_clone.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _clone;

var _cloneRegExp2 = _interopRequireDefault(require("./_cloneRegExp.js"));

var _type = _interopRequireDefault(require("../type.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */
function _clone(value, refFrom, refTo, deep) {
  var copy = function copy(copiedValue) {
    var len = refFrom.length;
    var idx = 0;

    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }

      idx += 1;
    }

    refFrom[idx + 1] = value;
    refTo[idx + 1] = copiedValue;

    for (var key in value) {
      copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
    }

    return copiedValue;
  };

  switch ((0, _type.default)(value)) {
    case 'Object':
      return copy({});

    case 'Array':
      return copy([]);

    case 'Date':
      return new Date(value.valueOf());

    case 'RegExp':
      return (0, _cloneRegExp2.default)(value);

    default:
      return value;
  }
}
},{"./_cloneRegExp.js":"node_modules/ramda/es/internal/_cloneRegExp.js","../type.js":"node_modules/ramda/es/type.js"}],"node_modules/ramda/es/clone.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _clone2 = _interopRequireDefault(require("./internal/_clone.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a deep copy of the value which may contain (nested) `Array`s and
 * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
 * assigned by reference rather than copied
 *
 * Dispatches to a `clone` method if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {*} -> {*}
 * @param {*} value The object or array to clone
 * @return {*} A deeply cloned copy of `val`
 * @example
 *
 *      const objects = [{}, {}, {}];
 *      const objectsClone = R.clone(objects);
 *      objects === objectsClone; //=> false
 *      objects[0] === objectsClone[0]; //=> false
 */
var clone =
/*#__PURE__*/
(0, _curry.default)(function clone(value) {
  return value != null && typeof value.clone === 'function' ? value.clone() : (0, _clone2.default)(value, [], [], true);
});
var _default = clone;
exports.default = _default;
},{"./internal/_clone.js":"node_modules/ramda/es/internal/_clone.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/comparator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes a comparator function out of a function that reports whether the first
 * element is less than the second.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b) -> Boolean) -> ((a, b) -> Number)
 * @param {Function} pred A predicate function of arity two which will return `true` if the first argument
 * is less than the second, `false` otherwise
 * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`
 * @example
 *
 *      const byAge = R.comparator((a, b) => a.age < b.age);
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByIncreasingAge = R.sort(byAge, people);
 *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
 */
var comparator =
/*#__PURE__*/
(0, _curry.default)(function comparator(pred) {
  return function (a, b) {
    return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
  };
});
var _default = comparator;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/not.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A function that returns the `!` of its argument. It will return `true` when
 * passed false-y value, and `false` when passed a truth-y one.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig * -> Boolean
 * @param {*} a any value
 * @return {Boolean} the logical inverse of passed argument.
 * @see R.complement
 * @example
 *
 *      R.not(true); //=> false
 *      R.not(false); //=> true
 *      R.not(0); //=> true
 *      R.not(1); //=> false
 */
var not =
/*#__PURE__*/
(0, _curry.default)(function not(a) {
  return !a;
});
var _default = not;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/complement.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lift = _interopRequireDefault(require("./lift.js"));

var _not = _interopRequireDefault(require("./not.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function `f` and returns a function `g` such that if called with the same arguments
 * when `f` returns a "truthy" value, `g` returns `false` and when `f` returns a "falsy" value `g` returns `true`.
 *
 * `R.complement` may be applied to any functor
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> *) -> (*... -> Boolean)
 * @param {Function} f
 * @return {Function}
 * @see R.not
 * @example
 *
 *      const isNotNil = R.complement(R.isNil);
 *      isNil(null); //=> true
 *      isNotNil(null); //=> false
 *      isNil(7); //=> false
 *      isNotNil(7); //=> true
 */
var complement =
/*#__PURE__*/
(0, _lift.default)(_not.default);
var _default = complement;
exports.default = _default;
},{"./lift.js":"node_modules/ramda/es/lift.js","./not.js":"node_modules/ramda/es/not.js"}],"node_modules/ramda/es/internal/_pipe.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _pipe;

function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}
},{}],"node_modules/ramda/es/internal/_checkForMethod.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _checkForMethod;

var _isArray2 = _interopRequireDefault(require("./_isArray.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */
function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;

    if (length === 0) {
      return fn();
    }

    var obj = arguments[length - 1];
    return (0, _isArray2.default)(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}
},{"./_isArray.js":"node_modules/ramda/es/internal/_isArray.js"}],"node_modules/ramda/es/slice.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _checkForMethod2 = _interopRequireDefault(require("./internal/_checkForMethod.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */
var slice =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _checkForMethod2.default)('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));
var _default = slice;
exports.default = _default;
},{"./internal/_checkForMethod.js":"node_modules/ramda/es/internal/_checkForMethod.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/tail.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _checkForMethod2 = _interopRequireDefault(require("./internal/_checkForMethod.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */
var tail =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _checkForMethod2.default)('tail',
/*#__PURE__*/
(0, _slice.default)(1, Infinity)));
var _default = tail;
exports.default = _default;
},{"./internal/_checkForMethod.js":"node_modules/ramda/es/internal/_checkForMethod.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/pipe.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pipe;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _pipe2 = _interopRequireDefault(require("./internal/_pipe.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

var _tail = _interopRequireDefault(require("./tail.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs left-to-right function composition. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      const f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 */
function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }

  return (0, _arity2.default)(arguments[0].length, (0, _reduce.default)(_pipe2.default, arguments[0], (0, _tail.default)(arguments)));
}
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_pipe.js":"node_modules/ramda/es/internal/_pipe.js","./reduce.js":"node_modules/ramda/es/reduce.js","./tail.js":"node_modules/ramda/es/tail.js"}],"node_modules/ramda/es/reverse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _isString2 = _interopRequireDefault(require("./internal/_isString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list or string with the elements or characters in reverse
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {Array|String} list
 * @return {Array|String}
 * @example
 *
 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
 *      R.reverse([1, 2]);     //=> [2, 1]
 *      R.reverse([1]);        //=> [1]
 *      R.reverse([]);         //=> []
 *
 *      R.reverse('abc');      //=> 'cba'
 *      R.reverse('ab');       //=> 'ba'
 *      R.reverse('a');        //=> 'a'
 *      R.reverse('');         //=> ''
 */
var reverse =
/*#__PURE__*/
(0, _curry.default)(function reverse(list) {
  return (0, _isString2.default)(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
});
var _default = reverse;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_isString.js":"node_modules/ramda/es/internal/_isString.js"}],"node_modules/ramda/es/compose.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compose;

var _pipe = _interopRequireDefault(require("./pipe.js"));

var _reverse = _interopRequireDefault(require("./reverse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs right-to-left function composition. The rightmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipe
 * @example
 *
 *      const classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
 *      const yellGreeting = R.compose(R.toUpper, classyGreeting);
 *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
 *
 * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
 */
function compose() {
  if (arguments.length === 0) {
    throw new Error('compose requires at least one argument');
  }

  return _pipe.default.apply(this, (0, _reverse.default)(arguments));
}
},{"./pipe.js":"node_modules/ramda/es/pipe.js","./reverse.js":"node_modules/ramda/es/reverse.js"}],"node_modules/ramda/es/composeK.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = composeK;

var _chain = _interopRequireDefault(require("./chain.js"));

var _compose = _interopRequireDefault(require("./compose.js"));

var _map = _interopRequireDefault(require("./map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the right-to-left Kleisli composition of the provided functions,
 * each of which must return a value of a type supported by [`chain`](#chain).
 *
 * `R.composeK(h, g, f)` is equivalent to `R.compose(R.chain(h), R.chain(g), f)`.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Function
 * @sig Chain m => ((y -> m z), (x -> m y), ..., (a -> m b)) -> (a -> m z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipeK
 * @deprecated since v0.26.0
 * @example
 *
 *       //  get :: String -> Object -> Maybe *
 *       const get = R.curry((propName, obj) => Maybe(obj[propName]))
 *
 *       //  getStateCode :: Maybe String -> Maybe String
 *       const getStateCode = R.composeK(
 *         R.compose(Maybe.of, R.toUpper),
 *         get('state'),
 *         get('address'),
 *         get('user'),
 *       );
 *       getStateCode({"user":{"address":{"state":"ny"}}}); //=> Maybe.Just("NY")
 *       getStateCode({}); //=> Maybe.Nothing()
 * @symb R.composeK(f, g, h)(a) = R.chain(f, R.chain(g, h(a)))
 */
function composeK() {
  if (arguments.length === 0) {
    throw new Error('composeK requires at least one argument');
  }

  var init = Array.prototype.slice.call(arguments);
  var last = init.pop();
  return (0, _compose.default)(_compose.default.apply(this, (0, _map.default)(_chain.default, init)), last);
}
},{"./chain.js":"node_modules/ramda/es/chain.js","./compose.js":"node_modules/ramda/es/compose.js","./map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/internal/_pipeP.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _pipeP;

function _pipeP(f, g) {
  return function () {
    var ctx = this;
    return f.apply(ctx, arguments).then(function (x) {
      return g.call(ctx, x);
    });
  };
}
},{}],"node_modules/ramda/es/pipeP.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pipeP;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _pipeP2 = _interopRequireDefault(require("./internal/_pipeP.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

var _tail = _interopRequireDefault(require("./tail.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs left-to-right composition of one or more Promise-returning
 * functions. The leftmost function may have any arity; the remaining functions
 * must be unary.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a -> Promise b), (b -> Promise c), ..., (y -> Promise z)) -> (a -> Promise z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.composeP
 * @deprecated since v0.26.0
 * @example
 *
 *      //  followersForUser :: String -> Promise [User]
 *      const followersForUser = R.pipeP(db.getUserById, db.getFollowers);
 */
function pipeP() {
  if (arguments.length === 0) {
    throw new Error('pipeP requires at least one argument');
  }

  return (0, _arity2.default)(arguments[0].length, (0, _reduce.default)(_pipeP2.default, arguments[0], (0, _tail.default)(arguments)));
}
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_pipeP.js":"node_modules/ramda/es/internal/_pipeP.js","./reduce.js":"node_modules/ramda/es/reduce.js","./tail.js":"node_modules/ramda/es/tail.js"}],"node_modules/ramda/es/composeP.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = composeP;

var _pipeP = _interopRequireDefault(require("./pipeP.js"));

var _reverse = _interopRequireDefault(require("./reverse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs right-to-left composition of one or more Promise-returning
 * functions. The rightmost function may have any arity; the remaining
 * functions must be unary.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((y -> Promise z), (x -> Promise y), ..., (a -> Promise b)) -> (a -> Promise z)
 * @param {...Function} functions The functions to compose
 * @return {Function}
 * @see R.pipeP
 * @deprecated since v0.26.0
 * @example
 *
 *      const db = {
 *        users: {
 *          JOE: {
 *            name: 'Joe',
 *            followers: ['STEVE', 'SUZY']
 *          }
 *        }
 *      }
 *
 *      // We'll pretend to do a db lookup which returns a promise
 *      const lookupUser = (userId) => Promise.resolve(db.users[userId])
 *      const lookupFollowers = (user) => Promise.resolve(user.followers)
 *      lookupUser('JOE').then(lookupFollowers)
 *
 *      //  followersForUser :: String -> Promise [UserId]
 *      const followersForUser = R.composeP(lookupFollowers, lookupUser);
 *      followersForUser('JOE').then(followers => console.log('Followers:', followers))
 *      // Followers: ["STEVE","SUZY"]
 */
function composeP() {
  if (arguments.length === 0) {
    throw new Error('composeP requires at least one argument');
  }

  return _pipeP.default.apply(this, (0, _reverse.default)(arguments));
}
},{"./pipeP.js":"node_modules/ramda/es/pipeP.js","./reverse.js":"node_modules/ramda/es/reverse.js"}],"node_modules/ramda/es/nth.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isString2 = _interopRequireDefault(require("./internal/_isString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the nth element of the given list or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} list
 * @return {*}
 * @example
 *
 *      const list = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, list); //=> 'bar'
 *      R.nth(-1, list); //=> 'quux'
 *      R.nth(-99, list); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */
var nth =
/*#__PURE__*/
(0, _curry.default)(function nth(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return (0, _isString2.default)(list) ? list.charAt(idx) : list[idx];
});
var _default = nth;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isString.js":"node_modules/ramda/es/internal/_isString.js"}],"node_modules/ramda/es/head.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nth = _interopRequireDefault(require("./nth.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the first element of the given list or string. In some libraries
 * this function is named `first`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {Array|String} list
 * @return {*}
 * @see R.tail, R.init, R.last
 * @example
 *
 *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
 *      R.head([]); //=> undefined
 *
 *      R.head('abc'); //=> 'a'
 *      R.head(''); //=> ''
 */
var head =
/*#__PURE__*/
(0, _nth.default)(0);
var _default = head;
exports.default = _default;
},{"./nth.js":"node_modules/ramda/es/nth.js"}],"node_modules/ramda/es/internal/_identity.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _identity;

function _identity(x) {
  return x;
}
},{}],"node_modules/ramda/es/identity.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _identity2 = _interopRequireDefault(require("./internal/_identity.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A function that does nothing but return the parameter supplied to it. Good
 * as a default or placeholder function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> a
 * @param {*} x The value to return.
 * @return {*} The input value, `x`.
 * @example
 *
 *      R.identity(1); //=> 1
 *
 *      const obj = {};
 *      R.identity(obj) === obj; //=> true
 * @symb R.identity(a) = a
 */
var identity =
/*#__PURE__*/
(0, _curry.default)(_identity2.default);
var _default = identity;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_identity.js":"node_modules/ramda/es/internal/_identity.js"}],"node_modules/ramda/es/pipeWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _head = _interopRequireDefault(require("./head.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _tail = _interopRequireDefault(require("./tail.js"));

var _identity = _interopRequireDefault(require("./identity.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs left-to-right function composition using transforming function. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of pipeWith is not automatically curried.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((* -> *), [((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)]) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.composeWith, R.pipe
 * @example
 *
 *      const pipeWhileNotNil = R.pipeWith((f, res) => R.isNil(res) ? res : f(res));
 *      const f = pipeWhileNotNil([Math.pow, R.negate, R.inc])
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipeWith(f)([g, h, i])(...args) = f(i, f(h, f(g, ...args)))
 */
var pipeWith =
/*#__PURE__*/
(0, _curry.default)(function pipeWith(xf, list) {
  if (list.length <= 0) {
    return _identity.default;
  }

  var headList = (0, _head.default)(list);
  var tailList = (0, _tail.default)(list);
  return (0, _arity2.default)(headList.length, function () {
    return (0, _reduce2.default)(function (result, f) {
      return xf.call(this, f, result);
    }, headList.apply(this, arguments), tailList);
  });
});
var _default = pipeWith;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./head.js":"node_modules/ramda/es/head.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./tail.js":"node_modules/ramda/es/tail.js","./identity.js":"node_modules/ramda/es/identity.js"}],"node_modules/ramda/es/composeWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _pipeWith = _interopRequireDefault(require("./pipeWith.js"));

var _reverse = _interopRequireDefault(require("./reverse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs right-to-left function composition using transforming function. The rightmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((* -> *), [(y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)]) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.compose, R.pipeWith
 * @example
 *
 *      const composeWhileNotNil = R.composeWith((f, res) => R.isNil(res) ? res : f(res));
 *
 *      composeWhileNotNil([R.inc, R.prop('age')])({age: 1}) //=> 2
 *      composeWhileNotNil([R.inc, R.prop('age')])({}) //=> undefined
 *
 * @symb R.composeWith(f)([g, h, i])(...args) = f(g, f(h, f(i, ...args)))
 */
var composeWith =
/*#__PURE__*/
(0, _curry.default)(function composeWith(xf, list) {
  return _pipeWith.default.apply(this, [xf, (0, _reverse.default)(list)]);
});
var _default = composeWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./pipeWith.js":"node_modules/ramda/es/pipeWith.js","./reverse.js":"node_modules/ramda/es/reverse.js"}],"node_modules/ramda/es/internal/_arrayFromIterator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _arrayFromIterator;

function _arrayFromIterator(iter) {
  var list = [];
  var next;

  while (!(next = iter.next()).done) {
    list.push(next.value);
  }

  return list;
}
},{}],"node_modules/ramda/es/internal/_includesWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _includesWith;

function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }

    idx += 1;
  }

  return false;
}
},{}],"node_modules/ramda/es/internal/_functionName.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _functionName;

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}
},{}],"node_modules/ramda/es/internal/_objectIs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function _objectIs(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
}

var _default = typeof Object.is === 'function' ? Object.is : _objectIs;

exports.default = _default;
},{}],"node_modules/ramda/es/internal/_equals.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _equals;

var _arrayFromIterator2 = _interopRequireDefault(require("./_arrayFromIterator.js"));

var _includesWith2 = _interopRequireDefault(require("./_includesWith.js"));

var _functionName2 = _interopRequireDefault(require("./_functionName.js"));

var _has2 = _interopRequireDefault(require("./_has.js"));

var _objectIs2 = _interopRequireDefault(require("./_objectIs.js"));

var _keys = _interopRequireDefault(require("../keys.js"));

var _type = _interopRequireDefault(require("../type.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */
function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = (0, _arrayFromIterator2.default)(aIterator);
  var b = (0, _arrayFromIterator2.default)(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  } // if *a* array contains any element that is not included in *b*


  return !(0, _includesWith2.default)(function (b, aItem) {
    return !(0, _includesWith2.default)(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if ((0, _objectIs2.default)(a, b)) {
    return true;
  }

  var typeA = (0, _type.default)(a);

  if (typeA !== (0, _type.default)(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && (0, _functionName2.default)(a.constructor) === 'Promise') {
        return a === b;
      }

      break;

    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && (0, _objectIs2.default)(a.valueOf(), b.valueOf()))) {
        return false;
      }

      break;

    case 'Date':
      if (!(0, _objectIs2.default)(a.valueOf(), b.valueOf())) {
        return false;
      }

      break;

    case 'Error':
      return a.name === b.name && a.message === b.message;

    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }

      break;
  }

  var idx = stackA.length - 1;

  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }

    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;

    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = (0, _keys.default)(a);

  if (keysA.length !== (0, _keys.default)(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);
  idx = keysA.length - 1;

  while (idx >= 0) {
    var key = keysA[idx];

    if (!((0, _has2.default)(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }

    idx -= 1;
  }

  return true;
}
},{"./_arrayFromIterator.js":"node_modules/ramda/es/internal/_arrayFromIterator.js","./_includesWith.js":"node_modules/ramda/es/internal/_includesWith.js","./_functionName.js":"node_modules/ramda/es/internal/_functionName.js","./_has.js":"node_modules/ramda/es/internal/_has.js","./_objectIs.js":"node_modules/ramda/es/internal/_objectIs.js","../keys.js":"node_modules/ramda/es/keys.js","../type.js":"node_modules/ramda/es/type.js"}],"node_modules/ramda/es/equals.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _equals2 = _interopRequireDefault(require("./internal/_equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */
var equals =
/*#__PURE__*/
(0, _curry.default)(function equals(a, b) {
  return (0, _equals2.default)(a, b, [], []);
});
var _default = equals;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_equals.js":"node_modules/ramda/es/internal/_equals.js"}],"node_modules/ramda/es/internal/_indexOf.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _indexOf;

var _equals = _interopRequireDefault(require("../equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _indexOf(list, a, idx) {
  var inf, item; // Array.prototype.indexOf doesn't exist below IE9

  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;

          while (idx < list.length) {
            item = list[idx];

            if (item === 0 && 1 / item === inf) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];

            if (typeof item === 'number' && item !== item) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } // non-zero numbers can utilise Set


        return list.indexOf(a, idx);
      // all these types can utilise Set

      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }

    }
  } // anything else not covered above, defer to R.equals


  while (idx < list.length) {
    if ((0, _equals.default)(list[idx], a)) {
      return idx;
    }

    idx += 1;
  }

  return -1;
}
},{"../equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/internal/_includes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _includes;

var _indexOf2 = _interopRequireDefault(require("./_indexOf.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _includes(a, list) {
  return (0, _indexOf2.default)(list, a, 0) >= 0;
}
},{"./_indexOf.js":"node_modules/ramda/es/internal/_indexOf.js"}],"node_modules/ramda/es/internal/_quote.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _quote;

function _quote(s) {
  var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b') // \b matches word boundary; [\b] matches backspace
  .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
  return '"' + escaped.replace(/"/g, '\\"') + '"';
}
},{}],"node_modules/ramda/es/internal/_toISOString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
 */
var pad = function pad(n) {
  return (n < 10 ? '0' : '') + n;
};

var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
  return d.toISOString();
} : function _toISOString(d) {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
};

var _default = _toISOString;
exports.default = _default;
},{}],"node_modules/ramda/es/internal/_complement.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _complement;

function _complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
}
},{}],"node_modules/ramda/es/internal/_filter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _filter;

function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];

  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }

    idx += 1;
  }

  return result;
}
},{}],"node_modules/ramda/es/internal/_isObject.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isObject;

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}
},{}],"node_modules/ramda/es/internal/_xfilter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XFilter =
/*#__PURE__*/
function () {
  function XFilter(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XFilter.prototype['@@transducer/init'] = _xfBase2.default.init;
  XFilter.prototype['@@transducer/result'] = _xfBase2.default.result;

  XFilter.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
  };

  return XFilter;
}();

var _xfilter =
/*#__PURE__*/
(0, _curry.default)(function _xfilter(f, xf) {
  return new XFilter(f, xf);
});

var _default = _xfilter;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/filter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _filter2 = _interopRequireDefault(require("./internal/_filter.js"));

var _isObject2 = _interopRequireDefault(require("./internal/_isObject.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _xfilter2 = _interopRequireDefault(require("./internal/_xfilter.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a predicate and a `Filterable`, and returns a new filterable of the
 * same type containing the members of the given filterable which satisfy the
 * given predicate. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * Dispatches to the `filter` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array} Filterable
 * @see R.reject, R.transduce, R.addIndex
 * @example
 *
 *      const isEven = n => n % 2 === 0;
 *
 *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */
var filter =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['filter'], _xfilter2.default, function (pred, filterable) {
  return (0, _isObject2.default)(filterable) ? (0, _reduce2.default)(function (acc, key) {
    if (pred(filterable[key])) {
      acc[key] = filterable[key];
    }

    return acc;
  }, {}, (0, _keys.default)(filterable)) : // else
  (0, _filter2.default)(pred, filterable);
}));
var _default = filter;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_filter.js":"node_modules/ramda/es/internal/_filter.js","./internal/_isObject.js":"node_modules/ramda/es/internal/_isObject.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_xfilter.js":"node_modules/ramda/es/internal/_xfilter.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/reject.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _complement2 = _interopRequireDefault(require("./internal/_complement.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _filter = _interopRequireDefault(require("./filter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The complement of [`filter`](#filter).
 *
 * Acts as a transducer if a transformer is given in list position. Filterable
 * objects include plain objects or any object that has a filter method such
 * as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array}
 * @see R.filter, R.transduce, R.addIndex
 * @example
 *
 *      const isOdd = (n) => n % 2 === 1;
 *
 *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */
var reject =
/*#__PURE__*/
(0, _curry.default)(function reject(pred, filterable) {
  return (0, _filter.default)((0, _complement2.default)(pred), filterable);
});
var _default = reject;
exports.default = _default;
},{"./internal/_complement.js":"node_modules/ramda/es/internal/_complement.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./filter.js":"node_modules/ramda/es/filter.js"}],"node_modules/ramda/es/internal/_toString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _toString;

var _includes2 = _interopRequireDefault(require("./_includes.js"));

var _map2 = _interopRequireDefault(require("./_map.js"));

var _quote2 = _interopRequireDefault(require("./_quote.js"));

var _toISOString2 = _interopRequireDefault(require("./_toISOString.js"));

var _keys = _interopRequireDefault(require("../keys.js"));

var _reject = _interopRequireDefault(require("../reject.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return (0, _includes2.default)(y, xs) ? '<Circular>' : _toString(y, xs);
  }; //  mapPairs :: (Object, [String]) -> [String]


  var mapPairs = function (obj, keys) {
    return (0, _map2.default)(function (k) {
      return (0, _quote2.default)(k) + ': ' + recur(obj[k]);
    }, keys.slice().sort());
  };

  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + (0, _map2.default)(recur, x).join(', ') + '))';

    case '[object Array]':
      return '[' + (0, _map2.default)(recur, x).concat(mapPairs(x, (0, _reject.default)(function (k) {
        return /^\d+$/.test(k);
      }, (0, _keys.default)(x)))).join(', ') + ']';

    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();

    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : (0, _quote2.default)((0, _toISOString2.default)(x))) + ')';

    case '[object Null]':
      return 'null';

    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);

    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : (0, _quote2.default)(x);

    case '[object Undefined]':
      return 'undefined';

    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();

        if (repr !== '[object Object]') {
          return repr;
        }
      }

      return '{' + mapPairs(x, (0, _keys.default)(x)).join(', ') + '}';
  }
}
},{"./_includes.js":"node_modules/ramda/es/internal/_includes.js","./_map.js":"node_modules/ramda/es/internal/_map.js","./_quote.js":"node_modules/ramda/es/internal/_quote.js","./_toISOString.js":"node_modules/ramda/es/internal/_toISOString.js","../keys.js":"node_modules/ramda/es/keys.js","../reject.js":"node_modules/ramda/es/reject.js"}],"node_modules/ramda/es/toString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _toString2 = _interopRequireDefault(require("./internal/_toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the string representation of the given value. `eval`'ing the output
 * should result in a value equivalent to the input value. Many of the built-in
 * `toString` methods do not satisfy this requirement.
 *
 * If the given value is an `[object Object]` with a `toString` method other
 * than `Object.prototype.toString`, this method is invoked with no arguments
 * to produce the return value. This means user-defined constructor functions
 * can provide a suitable `toString` method. For example:
 *
 *     function Point(x, y) {
 *       this.x = x;
 *       this.y = y;
 *     }
 *
 *     Point.prototype.toString = function() {
 *       return 'new Point(' + this.x + ', ' + this.y + ')';
 *     };
 *
 *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category String
 * @sig * -> String
 * @param {*} val
 * @return {String}
 * @example
 *
 *      R.toString(42); //=> '42'
 *      R.toString('abc'); //=> '"abc"'
 *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
 *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
 *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
 */
var toString =
/*#__PURE__*/
(0, _curry.default)(function toString(val) {
  return (0, _toString2.default)(val, []);
});
var _default = toString;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_toString.js":"node_modules/ramda/es/internal/_toString.js"}],"node_modules/ramda/es/concat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

var _isFunction2 = _interopRequireDefault(require("./internal/_isFunction.js"));

var _isString2 = _interopRequireDefault(require("./internal/_isString.js"));

var _toString = _interopRequireDefault(require("./toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the result of concatenating the given lists or strings.
 *
 * Note: `R.concat` expects both arguments to be of the same type,
 * unlike the native `Array.prototype.concat` method. It will throw
 * an error if you `concat` an Array with a non-Array value.
 *
 * Dispatches to the `concat` method of the first argument, if present.
 * Can also concatenate two members of a [fantasy-land
 * compatible semigroup](https://github.com/fantasyland/fantasy-land#semigroup).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a] -> [a]
 * @sig String -> String -> String
 * @param {Array|String} firstList The first list
 * @param {Array|String} secondList The second list
 * @return {Array|String} A list consisting of the elements of `firstList` followed by the elements of
 * `secondList`.
 *
 * @example
 *
 *      R.concat('ABC', 'DEF'); // 'ABCDEF'
 *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 *      R.concat([], []); //=> []
 */
var concat =
/*#__PURE__*/
(0, _curry.default)(function concat(a, b) {
  if ((0, _isArray2.default)(a)) {
    if ((0, _isArray2.default)(b)) {
      return a.concat(b);
    }

    throw new TypeError((0, _toString.default)(b) + ' is not an array');
  }

  if ((0, _isString2.default)(a)) {
    if ((0, _isString2.default)(b)) {
      return a + b;
    }

    throw new TypeError((0, _toString.default)(b) + ' is not a string');
  }

  if (a != null && (0, _isFunction2.default)(a['fantasy-land/concat'])) {
    return a['fantasy-land/concat'](b);
  }

  if (a != null && (0, _isFunction2.default)(a.concat)) {
    return a.concat(b);
  }

  throw new TypeError((0, _toString.default)(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
});
var _default = concat;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./internal/_isFunction.js":"node_modules/ramda/es/internal/_isFunction.js","./internal/_isString.js":"node_modules/ramda/es/internal/_isString.js","./toString.js":"node_modules/ramda/es/toString.js"}],"node_modules/ramda/es/cond.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function, `fn`, which encapsulates `if/else, if/else, ...` logic.
 * `R.cond` takes a list of [predicate, transformer] pairs. All of the arguments
 * to `fn` are applied to each of the predicates in turn until one returns a
 * "truthy" value, at which point `fn` returns the result of applying its
 * arguments to the corresponding transformer. If none of the predicates
 * matches, `fn` returns undefined.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Logic
 * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
 * @param {Array} pairs A list of [predicate, transformer]
 * @return {Function}
 * @see R.ifElse, R.unless, R.when
 * @example
 *
 *      const fn = R.cond([
 *        [R.equals(0),   R.always('water freezes at 0°C')],
 *        [R.equals(100), R.always('water boils at 100°C')],
 *        [R.T,           temp => 'nothing special happens at ' + temp + '°C']
 *      ]);
 *      fn(0); //=> 'water freezes at 0°C'
 *      fn(50); //=> 'nothing special happens at 50°C'
 *      fn(100); //=> 'water boils at 100°C'
 */
var cond =
/*#__PURE__*/
(0, _curry.default)(function cond(pairs) {
  var arity = (0, _reduce.default)(_max.default, 0, (0, _map.default)(function (pair) {
    return pair[0].length;
  }, pairs));
  return (0, _arity2.default)(arity, function () {
    var idx = 0;

    while (idx < pairs.length) {
      if (pairs[idx][0].apply(this, arguments)) {
        return pairs[idx][1].apply(this, arguments);
      }

      idx += 1;
    }
  });
});
var _default = cond;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./map.js":"node_modules/ramda/es/map.js","./max.js":"node_modules/ramda/es/max.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/constructN.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _curry3 = _interopRequireDefault(require("./curry.js"));

var _nAry = _interopRequireDefault(require("./nAry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type. The arity of the function
 * returned is specified to allow using variadic constructor functions.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Function
 * @sig Number -> (* -> {*}) -> (* -> {*})
 * @param {Number} n The arity of the constructor function.
 * @param {Function} Fn The constructor function to wrap.
 * @return {Function} A wrapped, curried constructor function.
 * @example
 *
 *      // Variadic Constructor function
 *      function Salad() {
 *        this.ingredients = arguments;
 *      }
 *
 *      Salad.prototype.recipe = function() {
 *        const instructions = R.map(ingredient => 'Add a dollop of ' + ingredient, this.ingredients);
 *        return R.join('\n', instructions);
 *      };
 *
 *      const ThreeLayerSalad = R.constructN(3, Salad);
 *
 *      // Notice we no longer need the 'new' keyword, and the constructor is curried for 3 arguments.
 *      const salad = ThreeLayerSalad('Mayonnaise')('Potato Chips')('Ketchup');
 *
 *      console.log(salad.recipe());
 *      // Add a dollop of Mayonnaise
 *      // Add a dollop of Potato Chips
 *      // Add a dollop of Ketchup
 */
var constructN =
/*#__PURE__*/
(0, _curry.default)(function constructN(n, Fn) {
  if (n > 10) {
    throw new Error('Constructor with greater than ten arguments');
  }

  if (n === 0) {
    return function () {
      return new Fn();
    };
  }

  return (0, _curry3.default)((0, _nAry.default)(n, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
    switch (arguments.length) {
      case 1:
        return new Fn($0);

      case 2:
        return new Fn($0, $1);

      case 3:
        return new Fn($0, $1, $2);

      case 4:
        return new Fn($0, $1, $2, $3);

      case 5:
        return new Fn($0, $1, $2, $3, $4);

      case 6:
        return new Fn($0, $1, $2, $3, $4, $5);

      case 7:
        return new Fn($0, $1, $2, $3, $4, $5, $6);

      case 8:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7);

      case 9:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);

      case 10:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
    }
  }));
});
var _default = constructN;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./curry.js":"node_modules/ramda/es/curry.js","./nAry.js":"node_modules/ramda/es/nAry.js"}],"node_modules/ramda/es/construct.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _constructN = _interopRequireDefault(require("./constructN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> {*}) -> (* -> {*})
 * @param {Function} fn The constructor function to wrap.
 * @return {Function} A wrapped, curried constructor function.
 * @see R.invoker
 * @example
 *
 *      // Constructor function
 *      function Animal(kind) {
 *        this.kind = kind;
 *      };
 *      Animal.prototype.sighting = function() {
 *        return "It's a " + this.kind + "!";
 *      }
 *
 *      const AnimalConstructor = R.construct(Animal)
 *
 *      // Notice we no longer need the 'new' keyword:
 *      AnimalConstructor('Pig'); //=> {"kind": "Pig", "sighting": function (){...}};
 *
 *      const animalTypes = ["Lion", "Tiger", "Bear"];
 *      const animalSighting = R.invoker(0, 'sighting');
 *      const sightNewAnimal = R.compose(animalSighting, AnimalConstructor);
 *      R.map(sightNewAnimal, animalTypes); //=> ["It's a Lion!", "It's a Tiger!", "It's a Bear!"]
 */
var construct =
/*#__PURE__*/
(0, _curry.default)(function construct(Fn) {
  return (0, _constructN.default)(Fn.length, Fn);
});
var _default = construct;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./constructN.js":"node_modules/ramda/es/constructN.js"}],"node_modules/ramda/es/contains.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes2 = _interopRequireDefault(require("./internal/_includes.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 * Works also with strings.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.includes
 * @deprecated since v0.26.0
 * @example
 *
 *      R.contains(3, [1, 2, 3]); //=> true
 *      R.contains(4, [1, 2, 3]); //=> false
 *      R.contains({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.contains([42], [[42]]); //=> true
 *      R.contains('ba', 'banana'); //=>true
 */
var contains =
/*#__PURE__*/
(0, _curry.default)(_includes2.default);
var _default = contains;
exports.default = _default;
},{"./internal/_includes.js":"node_modules/ramda/es/internal/_includes.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/converge.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _map2 = _interopRequireDefault(require("./internal/_map.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _pluck = _interopRequireDefault(require("./pluck.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Accepts a converging function and a list of branching functions and returns
 * a new function. The arity of the new function is the same as the arity of
 * the longest branching function. When invoked, this new function is applied
 * to some arguments, and each branching function is applied to those same
 * arguments. The results of each branching function are passed as arguments
 * to the converging function to produce the return value.
 *
 * @func
 * @memberOf R
 * @since v0.4.2
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [((a, b, ...) -> x1), ((a, b, ...) -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} after A function. `after` will be invoked with the return values of
 *        `fn1` and `fn2` as its arguments.
 * @param {Array} functions A list of functions.
 * @return {Function} A new function.
 * @see R.useWith
 * @example
 *
 *      const average = R.converge(R.divide, [R.sum, R.length])
 *      average([1, 2, 3, 4, 5, 6, 7]) //=> 4
 *
 *      const strangeConcat = R.converge(R.concat, [R.toUpper, R.toLower])
 *      strangeConcat("Yodel") //=> "YODELyodel"
 *
 * @symb R.converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
 */
var converge =
/*#__PURE__*/
(0, _curry.default)(function converge(after, fns) {
  return (0, _curryN.default)((0, _reduce.default)(_max.default, 0, (0, _pluck.default)('length', fns)), function () {
    var args = arguments;
    var context = this;
    return after.apply(context, (0, _map2.default)(function (fn) {
      return fn.apply(context, args);
    }, fns));
  });
});
var _default = converge;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_map.js":"node_modules/ramda/es/internal/_map.js","./curryN.js":"node_modules/ramda/es/curryN.js","./max.js":"node_modules/ramda/es/max.js","./pluck.js":"node_modules/ramda/es/pluck.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/internal/_xreduceBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curryN2 = _interopRequireDefault(require("./_curryN.js"));

var _has2 = _interopRequireDefault(require("./_has.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XReduceBy =
/*#__PURE__*/
function () {
  function XReduceBy(valueFn, valueAcc, keyFn, xf) {
    this.valueFn = valueFn;
    this.valueAcc = valueAcc;
    this.keyFn = keyFn;
    this.xf = xf;
    this.inputs = {};
  }

  XReduceBy.prototype['@@transducer/init'] = _xfBase2.default.init;

  XReduceBy.prototype['@@transducer/result'] = function (result) {
    var key;

    for (key in this.inputs) {
      if ((0, _has2.default)(key, this.inputs)) {
        result = this.xf['@@transducer/step'](result, this.inputs[key]);

        if (result['@@transducer/reduced']) {
          result = result['@@transducer/value'];
          break;
        }
      }
    }

    this.inputs = null;
    return this.xf['@@transducer/result'](result);
  };

  XReduceBy.prototype['@@transducer/step'] = function (result, input) {
    var key = this.keyFn(input);
    this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
    this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
    return result;
  };

  return XReduceBy;
}();

var _xreduceBy =
/*#__PURE__*/
(0, _curryN2.default)(4, [], function _xreduceBy(valueFn, valueAcc, keyFn, xf) {
  return new XReduceBy(valueFn, valueAcc, keyFn, xf);
});

var _default = _xreduceBy;
exports.default = _default;
},{"./_curryN.js":"node_modules/ramda/es/internal/_curryN.js","./_has.js":"node_modules/ramda/es/internal/_has.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/reduceBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curryN2 = _interopRequireDefault(require("./internal/_curryN.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _xreduceBy2 = _interopRequireDefault(require("./internal/_xreduceBy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Groups the elements of the list according to the result of calling
 * the String-returning function `keyFn` on each element and reduces the elements
 * of each group to a single value via the reducer function `valueFn`.
 *
 * This function is basically a more general [`groupBy`](#groupBy) function.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category List
 * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
 * @param {Function} valueFn The function that reduces the elements of each group to a single
 *        value. Receives two values, accumulator for a particular group and the current element.
 * @param {*} acc The (initial) accumulator value for each group.
 * @param {Function} keyFn The function that maps the list's element into a key.
 * @param {Array} list The array to group.
 * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
 *         `valueFn` for elements which produced that key when passed to `keyFn`.
 * @see R.groupBy, R.reduce
 * @example
 *
 *      const groupNames = (acc, {name}) => acc.concat(name)
 *      const toGrade = ({score}) =>
 *        score < 65 ? 'F' :
 *        score < 70 ? 'D' :
 *        score < 80 ? 'C' :
 *        score < 90 ? 'B' : 'A'
 *
 *      var students = [
 *        {name: 'Abby', score: 83},
 *        {name: 'Bart', score: 62},
 *        {name: 'Curt', score: 88},
 *        {name: 'Dora', score: 92},
 *      ]
 *
 *      reduceBy(groupNames, [], toGrade, students)
 *      //=> {"A": ["Dora"], "B": ["Abby", "Curt"], "F": ["Bart"]}
 */
var reduceBy =
/*#__PURE__*/
(0, _curryN2.default)(4, [],
/*#__PURE__*/
(0, _dispatchable2.default)([], _xreduceBy2.default, function reduceBy(valueFn, valueAcc, keyFn, list) {
  return (0, _reduce2.default)(function (acc, elt) {
    var key = keyFn(elt);
    acc[key] = valueFn((0, _has2.default)(key, acc) ? acc[key] : valueAcc, elt);
    return acc;
  }, {}, list);
}));
var _default = reduceBy;
exports.default = _default;
},{"./internal/_curryN.js":"node_modules/ramda/es/internal/_curryN.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_xreduceBy.js":"node_modules/ramda/es/internal/_xreduceBy.js"}],"node_modules/ramda/es/countBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reduceBy = _interopRequireDefault(require("./reduceBy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Counts the elements of a list according to how many match each value of a
 * key generated by the supplied function. Returns an object mapping the keys
 * produced by `fn` to the number of occurrences in the list. Note that all
 * keys are coerced to strings because of how JavaScript objects work.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig (a -> String) -> [a] -> {*}
 * @param {Function} fn The function used to map values to keys.
 * @param {Array} list The list to count elements from.
 * @return {Object} An object mapping keys to number of occurrences in the list.
 * @example
 *
 *      const numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
 *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
 *
 *      const letters = ['a', 'b', 'A', 'a', 'B', 'c'];
 *      R.countBy(R.toLower)(letters);   //=> {'a': 3, 'b': 2, 'c': 1}
 */
var countBy =
/*#__PURE__*/
(0, _reduceBy.default)(function (acc, elem) {
  return acc + 1;
}, 0);
var _default = countBy;
exports.default = _default;
},{"./reduceBy.js":"node_modules/ramda/es/reduceBy.js"}],"node_modules/ramda/es/dec.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _add = _interopRequireDefault(require("./add.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Decrements its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n - 1
 * @see R.inc
 * @example
 *
 *      R.dec(42); //=> 41
 */
var dec =
/*#__PURE__*/
(0, _add.default)(-1);
var _default = dec;
exports.default = _default;
},{"./add.js":"node_modules/ramda/es/add.js"}],"node_modules/ramda/es/defaultTo.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the second argument if it is not `null`, `undefined` or `NaN`;
 * otherwise the first argument is returned.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {a} default The default value.
 * @param {b} val `val` will be returned instead of `default` unless `val` is `null`, `undefined` or `NaN`.
 * @return {*} The second value if it is not `null`, `undefined` or `NaN`, otherwise the default value
 * @example
 *
 *      const defaultTo42 = R.defaultTo(42);
 *
 *      defaultTo42(null);  //=> 42
 *      defaultTo42(undefined);  //=> 42
 *      defaultTo42(false);  //=> false
 *      defaultTo42('Ramda');  //=> 'Ramda'
 *      // parseInt('string') results in NaN
 *      defaultTo42(parseInt('string')); //=> 42
 */
var defaultTo =
/*#__PURE__*/
(0, _curry.default)(function defaultTo(d, v) {
  return v == null || v !== v ? d : v;
});
var _default = defaultTo;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/descend.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes a descending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Function
 * @sig Ord b => (a -> b) -> a -> a -> Number
 * @param {Function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @return {Number} `-1` if fn(a) > fn(b), `1` if fn(b) > fn(a), otherwise `0`
 * @see R.ascend
 * @example
 *
 *      const byAge = R.descend(R.prop('age'));
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByOldestFirst = R.sort(byAge, people);
 *        //=> [{ name: 'Peter', age: 78 }, { name: 'Emma', age: 70 }, { name: 'Mikhail', age: 62 }]
 */
var descend =
/*#__PURE__*/
(0, _curry.default)(function descend(fn, a, b) {
  var aa = fn(a);
  var bb = fn(b);
  return aa > bb ? -1 : aa < bb ? 1 : 0;
});
var _default = descend;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/internal/_Set.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes2 = _interopRequireDefault(require("./_includes.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _Set =
/*#__PURE__*/
function () {
  function _Set() {
    /* globals Set */
    this._nativeSet = typeof Set === 'function' ? new Set() : null;
    this._items = {};
  } // until we figure out why jsdoc chokes on this
  // @param item The item to add to the Set
  // @returns {boolean} true if the item did not exist prior, otherwise false
  //


  _Set.prototype.add = function (item) {
    return !hasOrAdd(item, true, this);
  }; //
  // @param item The item to check for existence in the Set
  // @returns {boolean} true if the item exists in the Set, otherwise false
  //


  _Set.prototype.has = function (item) {
    return hasOrAdd(item, false, this);
  }; //
  // Combines the logic for checking whether an item is a member of the set and
  // for adding a new item to the set.
  //
  // @param item       The item to check or add to the Set instance.
  // @param shouldAdd  If true, the item will be added to the set if it doesn't
  //                   already exist.
  // @param set        The set instance to check or add to.
  // @return {boolean} true if the item already existed, otherwise false.
  //


  return _Set;
}();

function hasOrAdd(item, shouldAdd, set) {
  var type = typeof item;
  var prevSize, newSize;

  switch (type) {
    case 'string':
    case 'number':
      // distinguish between +0 and -0
      if (item === 0 && 1 / item === -Infinity) {
        if (set._items['-0']) {
          return true;
        } else {
          if (shouldAdd) {
            set._items['-0'] = true;
          }

          return false;
        }
      } // these types can all utilise the native Set


      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;

          set._nativeSet.add(item);

          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = {};
            set._items[type][item] = true;
          }

          return false;
        } else if (item in set._items[type]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][item] = true;
          }

          return false;
        }
      }

    case 'boolean':
      // set._items['boolean'] holds a two element array
      // representing [ falseExists, trueExists ]
      if (type in set._items) {
        var bIdx = item ? 1 : 0;

        if (set._items[type][bIdx]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][bIdx] = true;
          }

          return false;
        }
      } else {
        if (shouldAdd) {
          set._items[type] = item ? [false, true] : [true, false];
        }

        return false;
      }

    case 'function':
      // compare functions for reference equality
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;

          set._nativeSet.add(item);

          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = [item];
          }

          return false;
        }

        if (!(0, _includes2.default)(item, set._items[type])) {
          if (shouldAdd) {
            set._items[type].push(item);
          }

          return false;
        }

        return true;
      }

    case 'undefined':
      if (set._items[type]) {
        return true;
      } else {
        if (shouldAdd) {
          set._items[type] = true;
        }

        return false;
      }

    case 'object':
      if (item === null) {
        if (!set._items['null']) {
          if (shouldAdd) {
            set._items['null'] = true;
          }

          return false;
        }

        return true;
      }

    /* falls through */

    default:
      // reduce the search size of heterogeneous sets by creating buckets
      // for each type.
      type = Object.prototype.toString.call(item);

      if (!(type in set._items)) {
        if (shouldAdd) {
          set._items[type] = [item];
        }

        return false;
      } // scan through all previously applied items


      if (!(0, _includes2.default)(item, set._items[type])) {
        if (shouldAdd) {
          set._items[type].push(item);
        }

        return false;
      }

      return true;
  }
} // A simple Set type that honours R.equals semantics


var _default = _Set;
exports.default = _default;
},{"./_includes.js":"node_modules/ramda/es/internal/_includes.js"}],"node_modules/ramda/es/difference.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _Set2 = _interopRequireDefault(require("./internal/_Set.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Objects and Arrays are compared in terms of
 * value equality, not reference equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith, R.without
 * @example
 *
 *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
 *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
 *      R.difference([{a: 1}, {b: 2}], [{a: 1}, {c: 3}]) //=> [{b: 2}]
 */
var difference =
/*#__PURE__*/
(0, _curry.default)(function difference(first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;
  var secondLen = second.length;
  var toFilterOut = new _Set2.default();

  for (var i = 0; i < secondLen; i += 1) {
    toFilterOut.add(second[i]);
  }

  while (idx < firstLen) {
    if (toFilterOut.add(first[idx])) {
      out[out.length] = first[idx];
    }

    idx += 1;
  }

  return out;
});
var _default = difference;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_Set.js":"node_modules/ramda/es/internal/_Set.js"}],"node_modules/ramda/es/differenceWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includesWith2 = _interopRequireDefault(require("./internal/_includesWith.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Duplication is determined according to the
 * value returned by applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.difference, R.symmetricDifference, R.symmetricDifferenceWith
 * @example
 *
 *      const cmp = (x, y) => x.a === y.a;
 *      const l1 = [{a: 1}, {a: 2}, {a: 3}];
 *      const l2 = [{a: 3}, {a: 4}];
 *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
 */
var differenceWith =
/*#__PURE__*/
(0, _curry.default)(function differenceWith(pred, first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;

  while (idx < firstLen) {
    if (!(0, _includesWith2.default)(pred, first[idx], second) && !(0, _includesWith2.default)(pred, first[idx], out)) {
      out.push(first[idx]);
    }

    idx += 1;
  }

  return out;
});
var _default = differenceWith;
exports.default = _default;
},{"./internal/_includesWith.js":"node_modules/ramda/es/internal/_includesWith.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/dissoc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new object that does not contain a `prop` property.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Object
 * @sig String -> {k: v} -> {k: v}
 * @param {String} prop The name of the property to dissociate
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original but without the specified property
 * @see R.assoc, R.omit
 * @example
 *
 *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
 */
var dissoc =
/*#__PURE__*/
(0, _curry.default)(function dissoc(prop, obj) {
  var result = {};

  for (var p in obj) {
    result[p] = obj[p];
  }

  delete result[prop];
  return result;
});
var _default = dissoc;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/remove.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Removes the sub-list of `list` starting at index `start` and containing
 * `count` elements. _Note that this is not destructive_: it returns a copy of
 * the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.2.2
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @param {Number} start The position to start removing elements
 * @param {Number} count The number of elements to remove
 * @param {Array} list The list to remove from
 * @return {Array} A new Array with `count` elements from `start` removed.
 * @see R.without
 * @example
 *
 *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
 */
var remove =
/*#__PURE__*/
(0, _curry.default)(function remove(start, count, list) {
  var result = Array.prototype.slice.call(list, 0);
  result.splice(start, count);
  return result;
});
var _default = remove;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/update.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _adjust = _interopRequireDefault(require("./adjust.js"));

var _always = _interopRequireDefault(require("./always.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new copy of the array with the element at the provided index
 * replaced with the given value.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig Number -> a -> [a] -> [a]
 * @param {Number} idx The index to update.
 * @param {*} x The value to exist at the given index of the returned array.
 * @param {Array|Arguments} list The source array-like object to be updated.
 * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
 * @see R.adjust
 * @example
 *
 *      R.update(1, '_', ['a', 'b', 'c']);      //=> ['a', '_', 'c']
 *      R.update(-1, '_', ['a', 'b', 'c']);     //=> ['a', 'b', '_']
 * @symb R.update(-1, a, [b, c]) = [b, a]
 * @symb R.update(0, a, [b, c]) = [a, c]
 * @symb R.update(1, a, [b, c]) = [b, a]
 */
var update =
/*#__PURE__*/
(0, _curry.default)(function update(idx, x, list) {
  return (0, _adjust.default)(idx, (0, _always.default)(x), list);
});
var _default = update;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./adjust.js":"node_modules/ramda/es/adjust.js","./always.js":"node_modules/ramda/es/always.js"}],"node_modules/ramda/es/dissocPath.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isInteger2 = _interopRequireDefault(require("./internal/_isInteger.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

var _assoc = _interopRequireDefault(require("./assoc.js"));

var _dissoc = _interopRequireDefault(require("./dissoc.js"));

var _remove = _interopRequireDefault(require("./remove.js"));

var _update = _interopRequireDefault(require("./update.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Makes a shallow clone of an object, omitting the property at the given path.
 * Note that this copies and flattens prototype properties onto the new object
 * as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.11.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {k: v} -> {k: v}
 * @param {Array} path The path to the value to omit
 * @param {Object} obj The object to clone
 * @return {Object} A new object without the property at path
 * @see R.assocPath
 * @example
 *
 *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
 */
var dissocPath =
/*#__PURE__*/
(0, _curry.default)(function dissocPath(path, obj) {
  switch (path.length) {
    case 0:
      return obj;

    case 1:
      return (0, _isInteger2.default)(path[0]) && (0, _isArray2.default)(obj) ? (0, _remove.default)(path[0], 1, obj) : (0, _dissoc.default)(path[0], obj);

    default:
      var head = path[0];
      var tail = Array.prototype.slice.call(path, 1);

      if (obj[head] == null) {
        return obj;
      } else if ((0, _isInteger2.default)(head) && (0, _isArray2.default)(obj)) {
        return (0, _update.default)(head, dissocPath(tail, obj[head]), obj);
      } else {
        return (0, _assoc.default)(head, dissocPath(tail, obj[head]), obj);
      }

  }
});
var _default = dissocPath;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isInteger.js":"node_modules/ramda/es/internal/_isInteger.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./assoc.js":"node_modules/ramda/es/assoc.js","./dissoc.js":"node_modules/ramda/es/dissoc.js","./remove.js":"node_modules/ramda/es/remove.js","./update.js":"node_modules/ramda/es/update.js"}],"node_modules/ramda/es/divide.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Divides two numbers. Equivalent to `a / b`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a / b`.
 * @see R.multiply
 * @example
 *
 *      R.divide(71, 100); //=> 0.71
 *
 *      const half = R.divide(R.__, 2);
 *      half(42); //=> 21
 *
 *      const reciprocal = R.divide(1);
 *      reciprocal(4);   //=> 0.25
 */
var divide =
/*#__PURE__*/
(0, _curry.default)(function divide(a, b) {
  return a / b;
});
var _default = divide;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_xdrop.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XDrop =
/*#__PURE__*/
function () {
  function XDrop(n, xf) {
    this.xf = xf;
    this.n = n;
  }

  XDrop.prototype['@@transducer/init'] = _xfBase2.default.init;
  XDrop.prototype['@@transducer/result'] = _xfBase2.default.result;

  XDrop.prototype['@@transducer/step'] = function (result, input) {
    if (this.n > 0) {
      this.n -= 1;
      return result;
    }

    return this.xf['@@transducer/step'](result, input);
  };

  return XDrop;
}();

var _xdrop =
/*#__PURE__*/
(0, _curry.default)(function _xdrop(n, xf) {
  return new XDrop(n, xf);
});

var _default = _xdrop;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/drop.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xdrop2 = _interopRequireDefault(require("./internal/_xdrop.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns all but the first `n` elements of the given list, string, or
 * transducer/transformer (or object with a `drop` method).
 *
 * Dispatches to the `drop` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n
 * @param {*} list
 * @return {*} A copy of list without the first `n` elements
 * @see R.take, R.transduce, R.dropLast, R.dropWhile
 * @example
 *
 *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
 *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
 *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
 *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
 *      R.drop(3, 'ramda');               //=> 'da'
 */
var drop =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['drop'], _xdrop2.default, function drop(n, xs) {
  return (0, _slice.default)(Math.max(0, n), Infinity, xs);
}));
var _default = drop;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xdrop.js":"node_modules/ramda/es/internal/_xdrop.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/internal/_xtake.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XTake =
/*#__PURE__*/
function () {
  function XTake(n, xf) {
    this.xf = xf;
    this.n = n;
    this.i = 0;
  }

  XTake.prototype['@@transducer/init'] = _xfBase2.default.init;
  XTake.prototype['@@transducer/result'] = _xfBase2.default.result;

  XTake.prototype['@@transducer/step'] = function (result, input) {
    this.i += 1;
    var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input);
    return this.n >= 0 && this.i >= this.n ? (0, _reduced2.default)(ret) : ret;
  };

  return XTake;
}();

var _xtake =
/*#__PURE__*/
(0, _curry.default)(function _xtake(n, xf) {
  return new XTake(n, xf);
});

var _default = _xtake;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/take.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xtake2 = _interopRequireDefault(require("./internal/_xtake.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the first `n` elements of the given list, string, or
 * transducer/transformer (or object with a `take` method).
 *
 * Dispatches to the `take` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n
 * @param {*} list
 * @return {*}
 * @see R.drop
 * @example
 *
 *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
 *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
 *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(3, 'ramda');               //=> 'ram'
 *
 *      const personnel = [
 *        'Dave Brubeck',
 *        'Paul Desmond',
 *        'Eugene Wright',
 *        'Joe Morello',
 *        'Gerry Mulligan',
 *        'Bob Bates',
 *        'Joe Dodge',
 *        'Ron Crotty'
 *      ];
 *
 *      const takeFive = R.take(5);
 *      takeFive(personnel);
 *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
 * @symb R.take(-1, [a, b]) = [a, b]
 * @symb R.take(0, [a, b]) = []
 * @symb R.take(1, [a, b]) = [a]
 * @symb R.take(2, [a, b]) = [a, b]
 */
var take =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['take'], _xtake2.default, function take(n, xs) {
  return (0, _slice.default)(0, n < 0 ? Infinity : n, xs);
}));
var _default = take;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xtake.js":"node_modules/ramda/es/internal/_xtake.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/internal/_dropLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dropLast;

var _take = _interopRequireDefault(require("../take.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dropLast(n, xs) {
  return (0, _take.default)(n < xs.length ? xs.length - n : 0, xs);
}
},{"../take.js":"node_modules/ramda/es/take.js"}],"node_modules/ramda/es/internal/_xdropLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XDropLast =
/*#__PURE__*/
function () {
  function XDropLast(n, xf) {
    this.xf = xf;
    this.pos = 0;
    this.full = false;
    this.acc = new Array(n);
  }

  XDropLast.prototype['@@transducer/init'] = _xfBase2.default.init;

  XDropLast.prototype['@@transducer/result'] = function (result) {
    this.acc = null;
    return this.xf['@@transducer/result'](result);
  };

  XDropLast.prototype['@@transducer/step'] = function (result, input) {
    if (this.full) {
      result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
    }

    this.store(input);
    return result;
  };

  XDropLast.prototype.store = function (input) {
    this.acc[this.pos] = input;
    this.pos += 1;

    if (this.pos === this.acc.length) {
      this.pos = 0;
      this.full = true;
    }
  };

  return XDropLast;
}();

var _xdropLast =
/*#__PURE__*/
(0, _curry.default)(function _xdropLast(n, xf) {
  return new XDropLast(n, xf);
});

var _default = _xdropLast;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/dropLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _dropLast2 = _interopRequireDefault(require("./internal/_dropLast.js"));

var _xdropLast2 = _interopRequireDefault(require("./internal/_xdropLast.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a list containing all but the last `n` elements of the given `list`.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n The number of elements of `list` to skip.
 * @param {Array} list The list of elements to consider.
 * @return {Array} A copy of the list with only the first `list.length - n` elements
 * @see R.takeLast, R.drop, R.dropWhile, R.dropLastWhile
 * @example
 *
 *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
 *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
 *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
 *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
 *      R.dropLast(3, 'ramda');               //=> 'ra'
 */
var dropLast =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xdropLast2.default, _dropLast2.default));
var _default = dropLast;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_dropLast.js":"node_modules/ramda/es/internal/_dropLast.js","./internal/_xdropLast.js":"node_modules/ramda/es/internal/_xdropLast.js"}],"node_modules/ramda/es/internal/_dropLastWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dropLastWhile;

var _slice = _interopRequireDefault(require("../slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dropLastWhile(pred, xs) {
  var idx = xs.length - 1;

  while (idx >= 0 && pred(xs[idx])) {
    idx -= 1;
  }

  return (0, _slice.default)(0, idx + 1, xs);
}
},{"../slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/internal/_xdropLastWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduce2 = _interopRequireDefault(require("./_reduce.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XDropLastWhile =
/*#__PURE__*/
function () {
  function XDropLastWhile(fn, xf) {
    this.f = fn;
    this.retained = [];
    this.xf = xf;
  }

  XDropLastWhile.prototype['@@transducer/init'] = _xfBase2.default.init;

  XDropLastWhile.prototype['@@transducer/result'] = function (result) {
    this.retained = null;
    return this.xf['@@transducer/result'](result);
  };

  XDropLastWhile.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.retain(result, input) : this.flush(result, input);
  };

  XDropLastWhile.prototype.flush = function (result, input) {
    result = (0, _reduce2.default)(this.xf['@@transducer/step'], result, this.retained);
    this.retained = [];
    return this.xf['@@transducer/step'](result, input);
  };

  XDropLastWhile.prototype.retain = function (result, input) {
    this.retained.push(input);
    return result;
  };

  return XDropLastWhile;
}();

var _xdropLastWhile =
/*#__PURE__*/
(0, _curry.default)(function _xdropLastWhile(fn, xf) {
  return new XDropLastWhile(fn, xf);
});

var _default = _xdropLastWhile;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/dropLastWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _dropLastWhile2 = _interopRequireDefault(require("./internal/_dropLastWhile.js"));

var _xdropLastWhile2 = _interopRequireDefault(require("./internal/_xdropLastWhile.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list excluding all the tailing elements of a given list which
 * satisfy the supplied predicate function. It passes each value from the right
 * to the supplied predicate function, skipping elements until the predicate
 * function returns a `falsy` value. The predicate function is applied to one argument:
 * *(value)*.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} predicate The function to be called on each element
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array without any trailing elements that return `falsy` values from the `predicate`.
 * @see R.takeLastWhile, R.addIndex, R.drop, R.dropWhile
 * @example
 *
 *      const lteThree = x => x <= 3;
 *
 *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3, 4]
 *
 *      R.dropLastWhile(x => x !== 'd' , 'Ramda'); //=> 'Ramd'
 */
var dropLastWhile =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xdropLastWhile2.default, _dropLastWhile2.default));
var _default = dropLastWhile;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_dropLastWhile.js":"node_modules/ramda/es/internal/_dropLastWhile.js","./internal/_xdropLastWhile.js":"node_modules/ramda/es/internal/_xdropLastWhile.js"}],"node_modules/ramda/es/internal/_xdropRepeatsWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XDropRepeatsWith =
/*#__PURE__*/
function () {
  function XDropRepeatsWith(pred, xf) {
    this.xf = xf;
    this.pred = pred;
    this.lastValue = undefined;
    this.seenFirstValue = false;
  }

  XDropRepeatsWith.prototype['@@transducer/init'] = _xfBase2.default.init;
  XDropRepeatsWith.prototype['@@transducer/result'] = _xfBase2.default.result;

  XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
    var sameAsLast = false;

    if (!this.seenFirstValue) {
      this.seenFirstValue = true;
    } else if (this.pred(this.lastValue, input)) {
      sameAsLast = true;
    }

    this.lastValue = input;
    return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
  };

  return XDropRepeatsWith;
}();

var _xdropRepeatsWith =
/*#__PURE__*/
(0, _curry.default)(function _xdropRepeatsWith(pred, xf) {
  return new XDropRepeatsWith(pred, xf);
});

var _default = _xdropRepeatsWith;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/last.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nth = _interopRequireDefault(require("./nth.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.init, R.head, R.tail
 * @example
 *
 *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
 *      R.last([]); //=> undefined
 *
 *      R.last('abc'); //=> 'c'
 *      R.last(''); //=> ''
 */
var last =
/*#__PURE__*/
(0, _nth.default)(-1);
var _default = last;
exports.default = _default;
},{"./nth.js":"node_modules/ramda/es/nth.js"}],"node_modules/ramda/es/dropRepeatsWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xdropRepeatsWith2 = _interopRequireDefault(require("./internal/_xdropRepeatsWith.js"));

var _last = _interopRequireDefault(require("./last.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list without any consecutively repeating elements. Equality is
 * determined by applying the supplied predicate to each pair of consecutive elements. The
 * first element in a series of equal elements will be preserved.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig ((a, a) -> Boolean) -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *      const l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
 *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
 */
var dropRepeatsWith =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xdropRepeatsWith2.default, function dropRepeatsWith(pred, list) {
  var result = [];
  var idx = 1;
  var len = list.length;

  if (len !== 0) {
    result[0] = list[0];

    while (idx < len) {
      if (!pred((0, _last.default)(result), list[idx])) {
        result[result.length] = list[idx];
      }

      idx += 1;
    }
  }

  return result;
}));
var _default = dropRepeatsWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xdropRepeatsWith.js":"node_modules/ramda/es/internal/_xdropRepeatsWith.js","./last.js":"node_modules/ramda/es/last.js"}],"node_modules/ramda/es/dropRepeats.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xdropRepeatsWith2 = _interopRequireDefault(require("./internal/_xdropRepeatsWith.js"));

var _dropRepeatsWith = _interopRequireDefault(require("./dropRepeatsWith.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list without any consecutively repeating elements.
 * [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
 */
var dropRepeats =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([],
/*#__PURE__*/
(0, _xdropRepeatsWith2.default)(_equals.default),
/*#__PURE__*/
(0, _dropRepeatsWith.default)(_equals.default)));
var _default = dropRepeats;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xdropRepeatsWith.js":"node_modules/ramda/es/internal/_xdropRepeatsWith.js","./dropRepeatsWith.js":"node_modules/ramda/es/dropRepeatsWith.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/internal/_xdropWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XDropWhile =
/*#__PURE__*/
function () {
  function XDropWhile(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XDropWhile.prototype['@@transducer/init'] = _xfBase2.default.init;
  XDropWhile.prototype['@@transducer/result'] = _xfBase2.default.result;

  XDropWhile.prototype['@@transducer/step'] = function (result, input) {
    if (this.f) {
      if (this.f(input)) {
        return result;
      }

      this.f = null;
    }

    return this.xf['@@transducer/step'](result, input);
  };

  return XDropWhile;
}();

var _xdropWhile =
/*#__PURE__*/
(0, _curry.default)(function _xdropWhile(f, xf) {
  return new XDropWhile(f, xf);
});

var _default = _xdropWhile;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/dropWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xdropWhile2 = _interopRequireDefault(require("./internal/_xdropWhile.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list excluding the leading elements of a given list which
 * satisfy the supplied predicate function. It passes each value to the supplied
 * predicate function, skipping elements while the predicate function returns
 * `true`. The predicate function is applied to one argument: *(value)*.
 *
 * Dispatches to the `dropWhile` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.takeWhile, R.transduce, R.addIndex
 * @example
 *
 *      const lteTwo = x => x <= 2;
 *
 *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
 *
 *      R.dropWhile(x => x !== 'd' , 'Ramda'); //=> 'da'
 */
var dropWhile =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['dropWhile'], _xdropWhile2.default, function dropWhile(pred, xs) {
  var idx = 0;
  var len = xs.length;

  while (idx < len && pred(xs[idx])) {
    idx += 1;
  }

  return (0, _slice.default)(idx, Infinity, xs);
}));
var _default = dropWhile;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xdropWhile.js":"node_modules/ramda/es/internal/_xdropWhile.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/or.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if one or both of its arguments are `true`. Returns `false`
 * if both arguments are `false`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {Any} a
 * @param {Any} b
 * @return {Any} the first argument if truthy, otherwise the second argument.
 * @see R.either
 * @example
 *
 *      R.or(true, true); //=> true
 *      R.or(true, false); //=> true
 *      R.or(false, true); //=> true
 *      R.or(false, false); //=> false
 */
var or =
/*#__PURE__*/
(0, _curry.default)(function or(a, b) {
  return a || b;
});
var _default = or;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/either.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isFunction2 = _interopRequireDefault(require("./internal/_isFunction.js"));

var _lift = _interopRequireDefault(require("./lift.js"));

var _or = _interopRequireDefault(require("./or.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A function wrapping calls to the two functions in an `||` operation,
 * returning the result of the first function if it is truth-y and the result
 * of the second function otherwise. Note that this is short-circuited,
 * meaning that the second function will not be invoked if the first returns a
 * truth-y value.
 *
 * In addition to functions, `R.either` also accepts any fantasy-land compatible
 * applicative functor.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
 * @param {Function} f a predicate
 * @param {Function} g another predicate
 * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
 * @see R.or
 * @example
 *
 *      const gt10 = x => x > 10;
 *      const even = x => x % 2 === 0;
 *      const f = R.either(gt10, even);
 *      f(101); //=> true
 *      f(8); //=> true
 *
 *      R.either(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(55)
 *      R.either([false, false, 'a'], [11]) // => [11, 11, "a"]
 */
var either =
/*#__PURE__*/
(0, _curry.default)(function either(f, g) {
  return (0, _isFunction2.default)(f) ? function _either() {
    return f.apply(this, arguments) || g.apply(this, arguments);
  } : (0, _lift.default)(_or.default)(f, g);
});
var _default = either;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isFunction.js":"node_modules/ramda/es/internal/_isFunction.js","./lift.js":"node_modules/ramda/es/lift.js","./or.js":"node_modules/ramda/es/or.js"}],"node_modules/ramda/es/empty.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _isArguments2 = _interopRequireDefault(require("./internal/_isArguments.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

var _isObject2 = _interopRequireDefault(require("./internal/_isObject.js"));

var _isString2 = _interopRequireDefault(require("./internal/_isString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));      //=> Nothing()
 *      R.empty([1, 2, 3]);     //=> []
 *      R.empty('unicorns');    //=> ''
 *      R.empty({x: 1, y: 2});  //=> {}
 */
var empty =
/*#__PURE__*/
(0, _curry.default)(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : (0, _isArray2.default)(x) ? [] : (0, _isString2.default)(x) ? '' : (0, _isObject2.default)(x) ? {} : (0, _isArguments2.default)(x) ? function () {
    return arguments;
  }() : void 0 // else
  ;
});
var _default = empty;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_isArguments.js":"node_modules/ramda/es/internal/_isArguments.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./internal/_isObject.js":"node_modules/ramda/es/internal/_isObject.js","./internal/_isString.js":"node_modules/ramda/es/internal/_isString.js"}],"node_modules/ramda/es/takeLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _drop = _interopRequireDefault(require("./drop.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing the last `n` elements of the given list.
 * If `n > list.length`, returns a list of `list.length` elements.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n The number of elements to return.
 * @param {Array} xs The collection to consider.
 * @return {Array}
 * @see R.dropLast
 * @example
 *
 *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
 *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
 *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.takeLast(3, 'ramda');               //=> 'mda'
 */
var takeLast =
/*#__PURE__*/
(0, _curry.default)(function takeLast(n, xs) {
  return (0, _drop.default)(n >= 0 ? xs.length - n : 0, xs);
});
var _default = takeLast;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./drop.js":"node_modules/ramda/es/drop.js"}],"node_modules/ramda/es/endsWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

var _takeLast = _interopRequireDefault(require("./takeLast.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if a list ends with the provided sublist.
 *
 * Similarly, checks if a string ends with the provided substring.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category List
 * @sig [a] -> [a] -> Boolean
 * @sig String -> String -> Boolean
 * @param {*} suffix
 * @param {*} list
 * @return {Boolean}
 * @see R.startsWith
 * @example
 *
 *      R.endsWith('c', 'abc')                //=> true
 *      R.endsWith('b', 'abc')                //=> false
 *      R.endsWith(['c'], ['a', 'b', 'c'])    //=> true
 *      R.endsWith(['b'], ['a', 'b', 'c'])    //=> false
 */
var endsWith =
/*#__PURE__*/
(0, _curry.default)(function (suffix, list) {
  return (0, _equals.default)((0, _takeLast.default)(suffix.length, list), suffix);
});
var _default = endsWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./equals.js":"node_modules/ramda/es/equals.js","./takeLast.js":"node_modules/ramda/es/takeLast.js"}],"node_modules/ramda/es/eqBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function and two values in its domain and returns `true` if the
 * values map to the same value in the codomain; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Relation
 * @sig (a -> b) -> a -> a -> Boolean
 * @param {Function} f
 * @param {*} x
 * @param {*} y
 * @return {Boolean}
 * @example
 *
 *      R.eqBy(Math.abs, 5, -5); //=> true
 */
var eqBy =
/*#__PURE__*/
(0, _curry.default)(function eqBy(f, x, y) {
  return (0, _equals.default)(f(x), f(y));
});
var _default = eqBy;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/eqProps.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reports whether two objects have the same value, in [`R.equals`](#equals)
 * terms, for the specified property. Useful as a curried predicate.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig k -> {k: v} -> {k: v} -> Boolean
 * @param {String} prop The name of the property to compare
 * @param {Object} obj1
 * @param {Object} obj2
 * @return {Boolean}
 *
 * @example
 *
 *      const o1 = { a: 1, b: 2, c: 3, d: 4 };
 *      const o2 = { a: 10, b: 20, c: 3, d: 40 };
 *      R.eqProps('a', o1, o2); //=> false
 *      R.eqProps('c', o1, o2); //=> true
 */
var eqProps =
/*#__PURE__*/
(0, _curry.default)(function eqProps(prop, obj1, obj2) {
  return (0, _equals.default)(obj1[prop], obj2[prop]);
});
var _default = eqProps;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/evolve.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object by recursively evolving a shallow copy of `object`,
 * according to the `transformation` functions. All non-primitive properties
 * are copied by reference.
 *
 * A `transformation` function will not be invoked if its corresponding key
 * does not exist in the evolved object.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {k: (v -> v)} -> {k: v} -> {k: v}
 * @param {Object} transformations The object specifying transformation functions to apply
 *        to the object.
 * @param {Object} object The object to be transformed.
 * @return {Object} The transformed object.
 * @example
 *
 *      const tomato = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
 *      const transformations = {
 *        firstName: R.trim,
 *        lastName: R.trim, // Will not get invoked.
 *        data: {elapsed: R.add(1), remaining: R.add(-1)}
 *      };
 *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
 */
var evolve =
/*#__PURE__*/
(0, _curry.default)(function evolve(transformations, object) {
  var result = object instanceof Array ? [] : {};
  var transformation, key, type;

  for (key in object) {
    transformation = transformations[key];
    type = typeof transformation;
    result[key] = type === 'function' ? transformation(object[key]) : transformation && type === 'object' ? evolve(transformation, object[key]) : object[key];
  }

  return result;
});
var _default = evolve;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_xfind.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XFind =
/*#__PURE__*/
function () {
  function XFind(f, xf) {
    this.xf = xf;
    this.f = f;
    this.found = false;
  }

  XFind.prototype['@@transducer/init'] = _xfBase2.default.init;

  XFind.prototype['@@transducer/result'] = function (result) {
    if (!this.found) {
      result = this.xf['@@transducer/step'](result, void 0);
    }

    return this.xf['@@transducer/result'](result);
  };

  XFind.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.found = true;
      result = (0, _reduced2.default)(this.xf['@@transducer/step'](result, input));
    }

    return result;
  };

  return XFind;
}();

var _xfind =
/*#__PURE__*/
(0, _curry.default)(function _xfind(f, xf) {
  return new XFind(f, xf);
});

var _default = _xfind;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/find.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xfind2 = _interopRequireDefault(require("./internal/_xfind.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the first element of the list which matches the predicate, or
 * `undefined` if no element matches.
 *
 * Dispatches to the `find` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> a | undefined
 * @param {Function} fn The predicate function used to determine if the element is the
 *        desired one.
 * @param {Array} list The array to consider.
 * @return {Object} The element found, or `undefined`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
 *      R.find(R.propEq('a', 4))(xs); //=> undefined
 */
var find =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['find'], _xfind2.default, function find(fn, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (fn(list[idx])) {
      return list[idx];
    }

    idx += 1;
  }
}));
var _default = find;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xfind.js":"node_modules/ramda/es/internal/_xfind.js"}],"node_modules/ramda/es/internal/_xfindIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XFindIndex =
/*#__PURE__*/
function () {
  function XFindIndex(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.found = false;
  }

  XFindIndex.prototype['@@transducer/init'] = _xfBase2.default.init;

  XFindIndex.prototype['@@transducer/result'] = function (result) {
    if (!this.found) {
      result = this.xf['@@transducer/step'](result, -1);
    }

    return this.xf['@@transducer/result'](result);
  };

  XFindIndex.prototype['@@transducer/step'] = function (result, input) {
    this.idx += 1;

    if (this.f(input)) {
      this.found = true;
      result = (0, _reduced2.default)(this.xf['@@transducer/step'](result, this.idx));
    }

    return result;
  };

  return XFindIndex;
}();

var _xfindIndex =
/*#__PURE__*/
(0, _curry.default)(function _xfindIndex(f, xf) {
  return new XFindIndex(f, xf);
});

var _default = _xfindIndex;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/findIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xfindIndex2 = _interopRequireDefault(require("./internal/_xfindIndex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the index of the first element of the list which matches the
 * predicate, or `-1` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Number} The index of the element found, or `-1`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
 *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
 */
var findIndex =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xfindIndex2.default, function findIndex(fn, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (fn(list[idx])) {
      return idx;
    }

    idx += 1;
  }

  return -1;
}));
var _default = findIndex;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xfindIndex.js":"node_modules/ramda/es/internal/_xfindIndex.js"}],"node_modules/ramda/es/internal/_xfindLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XFindLast =
/*#__PURE__*/
function () {
  function XFindLast(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XFindLast.prototype['@@transducer/init'] = _xfBase2.default.init;

  XFindLast.prototype['@@transducer/result'] = function (result) {
    return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
  };

  XFindLast.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.last = input;
    }

    return result;
  };

  return XFindLast;
}();

var _xfindLast =
/*#__PURE__*/
(0, _curry.default)(function _xfindLast(f, xf) {
  return new XFindLast(f, xf);
});

var _default = _xfindLast;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/findLast.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xfindLast2 = _interopRequireDefault(require("./internal/_xfindLast.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the last element of the list which matches the predicate, or
 * `undefined` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> a | undefined
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Object} The element found, or `undefined`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
 *      R.findLast(R.propEq('a', 1))(xs); //=> {a: 1, b: 1}
 *      R.findLast(R.propEq('a', 4))(xs); //=> undefined
 */
var findLast =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xfindLast2.default, function findLast(fn, list) {
  var idx = list.length - 1;

  while (idx >= 0) {
    if (fn(list[idx])) {
      return list[idx];
    }

    idx -= 1;
  }
}));
var _default = findLast;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xfindLast.js":"node_modules/ramda/es/internal/_xfindLast.js"}],"node_modules/ramda/es/internal/_xfindLastIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XFindLastIndex =
/*#__PURE__*/
function () {
  function XFindLastIndex(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.lastIdx = -1;
  }

  XFindLastIndex.prototype['@@transducer/init'] = _xfBase2.default.init;

  XFindLastIndex.prototype['@@transducer/result'] = function (result) {
    return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
  };

  XFindLastIndex.prototype['@@transducer/step'] = function (result, input) {
    this.idx += 1;

    if (this.f(input)) {
      this.lastIdx = this.idx;
    }

    return result;
  };

  return XFindLastIndex;
}();

var _xfindLastIndex =
/*#__PURE__*/
(0, _curry.default)(function _xfindLastIndex(f, xf) {
  return new XFindLastIndex(f, xf);
});

var _default = _xfindLastIndex;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/findLastIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xfindLastIndex2 = _interopRequireDefault(require("./internal/_xfindLastIndex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the index of the last element of the list which matches the
 * predicate, or `-1` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Number} The index of the element found, or `-1`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
 *      R.findLastIndex(R.propEq('a', 1))(xs); //=> 1
 *      R.findLastIndex(R.propEq('a', 4))(xs); //=> -1
 */
var findLastIndex =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xfindLastIndex2.default, function findLastIndex(fn, list) {
  var idx = list.length - 1;

  while (idx >= 0) {
    if (fn(list[idx])) {
      return idx;
    }

    idx -= 1;
  }

  return -1;
}));
var _default = findLastIndex;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xfindLastIndex.js":"node_modules/ramda/es/internal/_xfindLastIndex.js"}],"node_modules/ramda/es/flatten.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _makeFlat2 = _interopRequireDefault(require("./internal/_makeFlat.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list by pulling every item out of it (and all its sub-arrays)
 * and putting them in a new array, depth-first.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b]
 * @param {Array} list The array to consider.
 * @return {Array} The flattened list.
 * @see R.unnest
 * @example
 *
 *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
 *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 */
var flatten =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _makeFlat2.default)(true));
var _default = flatten;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_makeFlat.js":"node_modules/ramda/es/internal/_makeFlat.js"}],"node_modules/ramda/es/flip.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
 * @param {Function} fn The function to invoke with its first two parameters reversed.
 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 *
 *      const mergeThree = (a, b, c) => [].concat(a, b, c);
 *
 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
 *
 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
 * @symb R.flip(f)(a, b, c) = f(b, a, c)
 */
var flip =
/*#__PURE__*/
(0, _curry.default)(function flip(fn) {
  return (0, _curryN.default)(fn.length, function (a, b) {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = b;
    args[1] = a;
    return fn.apply(this, args);
  });
});
var _default = flip;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/forEach.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _checkForMethod2 = _interopRequireDefault(require("./internal/_checkForMethod.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Iterate over an input `list`, calling a provided function `fn` for each
 * element in the list.
 *
 * `fn` receives one argument: *(value)*.
 *
 * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.forEach` method. For more
 * details on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
 *
 * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
 * the original array. In some libraries this function is named `each`.
 *
 * Dispatches to the `forEach` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> *) -> [a] -> [a]
 * @param {Function} fn The function to invoke. Receives one argument, `value`.
 * @param {Array} list The list to iterate over.
 * @return {Array} The original list.
 * @see R.addIndex
 * @example
 *
 *      const printXPlusFive = x => console.log(x + 5);
 *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
 *      // logs 6
 *      // logs 7
 *      // logs 8
 * @symb R.forEach(f, [a, b, c]) = [a, b, c]
 */
var forEach =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _checkForMethod2.default)('forEach', function forEach(fn, list) {
  var len = list.length;
  var idx = 0;

  while (idx < len) {
    fn(list[idx]);
    idx += 1;
  }

  return list;
}));
var _default = forEach;
exports.default = _default;
},{"./internal/_checkForMethod.js":"node_modules/ramda/es/internal/_checkForMethod.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/forEachObjIndexed.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Iterate over an input `object`, calling a provided function `fn` for each
 * key and value in the object.
 *
 * `fn` receives three argument: *(value, key, obj)*.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Object
 * @sig ((a, String, StrMap a) -> Any) -> StrMap a -> StrMap a
 * @param {Function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
 * @param {Object} obj The object to iterate over.
 * @return {Object} The original object.
 * @example
 *
 *      const printKeyConcatValue = (value, key) => console.log(key + ':' + value);
 *      R.forEachObjIndexed(printKeyConcatValue, {x: 1, y: 2}); //=> {x: 1, y: 2}
 *      // logs x:1
 *      // logs y:2
 * @symb R.forEachObjIndexed(f, {x: a, y: b}) = {x: a, y: b}
 */
var forEachObjIndexed =
/*#__PURE__*/
(0, _curry.default)(function forEachObjIndexed(fn, obj) {
  var keyList = (0, _keys.default)(obj);
  var idx = 0;

  while (idx < keyList.length) {
    var key = keyList[idx];
    fn(obj[key], key, obj);
    idx += 1;
  }

  return obj;
});
var _default = forEachObjIndexed;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/fromPairs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object from a list key-value pairs. If a key appears in
 * multiple pairs, the rightmost pair is included in the object.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [[k,v]] -> {k: v}
 * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
 * @return {Object} The object made by pairing up `keys` and `values`.
 * @see R.toPairs, R.pair
 * @example
 *
 *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
 */
var fromPairs =
/*#__PURE__*/
(0, _curry.default)(function fromPairs(pairs) {
  var result = {};
  var idx = 0;

  while (idx < pairs.length) {
    result[pairs[idx][0]] = pairs[idx][1];
    idx += 1;
  }

  return result;
});
var _default = fromPairs;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/groupBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _checkForMethod2 = _interopRequireDefault(require("./internal/_checkForMethod.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _reduceBy = _interopRequireDefault(require("./reduceBy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a list into sub-lists stored in an object, based on the result of
 * calling a String-returning function on each element, and grouping the
 * results according to values returned.
 *
 * Dispatches to the `groupBy` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> String) -> [a] -> {String: [a]}
 * @param {Function} fn Function :: a -> String
 * @param {Array} list The array to group
 * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
 *         that produced that key when passed to `fn`.
 * @see R.reduceBy, R.transduce
 * @example
 *
 *      const byGrade = R.groupBy(function(student) {
 *        const score = student.score;
 *        return score < 65 ? 'F' :
 *               score < 70 ? 'D' :
 *               score < 80 ? 'C' :
 *               score < 90 ? 'B' : 'A';
 *      });
 *      const students = [{name: 'Abby', score: 84},
 *                      {name: 'Eddy', score: 58},
 *                      // ...
 *                      {name: 'Jack', score: 69}];
 *      byGrade(students);
 *      // {
 *      //   'A': [{name: 'Dianne', score: 99}],
 *      //   'B': [{name: 'Abby', score: 84}]
 *      //   // ...,
 *      //   'F': [{name: 'Eddy', score: 58}]
 *      // }
 */
var groupBy =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _checkForMethod2.default)('groupBy',
/*#__PURE__*/
(0, _reduceBy.default)(function (acc, item) {
  if (acc == null) {
    acc = [];
  }

  acc.push(item);
  return acc;
}, null)));
var _default = groupBy;
exports.default = _default;
},{"./internal/_checkForMethod.js":"node_modules/ramda/es/internal/_checkForMethod.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./reduceBy.js":"node_modules/ramda/es/reduceBy.js"}],"node_modules/ramda/es/groupWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a list and returns a list of lists where each sublist's elements are
 * all satisfied pairwise comparison according to the provided function.
 * Only adjacent elements are passed to the comparison function.
 *
 * @func
 * @memberOf R
 * @since v0.21.0
 * @category List
 * @sig ((a, a) → Boolean) → [a] → [[a]]
 * @param {Function} fn Function for determining whether two given (adjacent)
 *        elements should be in the same group
 * @param {Array} list The array to group. Also accepts a string, which will be
 *        treated as a list of characters.
 * @return {List} A list that contains sublists of elements,
 *         whose concatenations are equal to the original list.
 * @example
 *
 * R.groupWith(R.equals, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0], [1, 1], [2], [3], [5], [8], [13], [21]]
 *
 * R.groupWith((a, b) => a + 1 === b, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0, 1], [1, 2, 3], [5], [8], [13], [21]]
 *
 * R.groupWith((a, b) => a % 2 === b % 2, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0], [1, 1], [2], [3, 5], [8], [13, 21]]
 *
 * R.groupWith(R.eqBy(isVowel), 'aestiou')
 * //=> ['ae', 'st', 'iou']
 */
var groupWith =
/*#__PURE__*/
(0, _curry.default)(function (fn, list) {
  var res = [];
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    var nextidx = idx + 1;

    while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
      nextidx += 1;
    }

    res.push(list.slice(idx, nextidx));
    idx = nextidx;
  }

  return res;
});
var _default = groupWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/gt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the first argument is greater than the second; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @see R.lt
 * @example
 *
 *      R.gt(2, 1); //=> true
 *      R.gt(2, 2); //=> false
 *      R.gt(2, 3); //=> false
 *      R.gt('a', 'z'); //=> false
 *      R.gt('z', 'a'); //=> true
 */
var gt =
/*#__PURE__*/
(0, _curry.default)(function gt(a, b) {
  return a > b;
});
var _default = gt;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/gte.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the first argument is greater than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.lte
 * @example
 *
 *      R.gte(2, 1); //=> true
 *      R.gte(2, 2); //=> true
 *      R.gte(2, 3); //=> false
 *      R.gte('a', 'z'); //=> false
 *      R.gte('z', 'a'); //=> true
 */
var gte =
/*#__PURE__*/
(0, _curry.default)(function gte(a, b) {
  return a >= b;
});
var _default = gte;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/hasPath.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns whether or not a path exists in an object. Only the object's
 * own properties are checked.
 *
 * @func
 * @memberOf R
 * @since v0.26.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> Boolean
 * @param {Array} path The path to use.
 * @param {Object} obj The object to check the path in.
 * @return {Boolean} Whether the path exists.
 * @see R.has
 * @example
 *
 *      R.hasPath(['a', 'b'], {a: {b: 2}});         // => true
 *      R.hasPath(['a', 'b'], {a: {b: undefined}}); // => true
 *      R.hasPath(['a', 'b'], {a: {c: 2}});         // => false
 *      R.hasPath(['a', 'b'], {});                  // => false
 */
var hasPath =
/*#__PURE__*/
(0, _curry.default)(function hasPath(_path, obj) {
  if (_path.length === 0) {
    return false;
  }

  var val = obj;
  var idx = 0;

  while (idx < _path.length) {
    if ((0, _has2.default)(_path[idx], val)) {
      val = val[_path[idx]];
      idx += 1;
    } else {
      return false;
    }
  }

  return true;
});
var _default = hasPath;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/has.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _hasPath = _interopRequireDefault(require("./hasPath.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns whether or not an object has an own property with the specified name
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Object
 * @sig s -> {s: x} -> Boolean
 * @param {String} prop The name of the property to check for.
 * @param {Object} obj The object to query.
 * @return {Boolean} Whether the property exists.
 * @example
 *
 *      const hasName = R.has('name');
 *      hasName({name: 'alice'});   //=> true
 *      hasName({name: 'bob'});     //=> true
 *      hasName({});                //=> false
 *
 *      const point = {x: 0, y: 0};
 *      const pointHas = R.has(R.__, point);
 *      pointHas('x');  //=> true
 *      pointHas('y');  //=> true
 *      pointHas('z');  //=> false
 */
var has =
/*#__PURE__*/
(0, _curry.default)(function has(prop, obj) {
  return (0, _hasPath.default)([prop], obj);
});
var _default = has;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./hasPath.js":"node_modules/ramda/es/hasPath.js"}],"node_modules/ramda/es/hasIn.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns whether or not an object or its prototype chain has a property with
 * the specified name
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Object
 * @sig s -> {s: x} -> Boolean
 * @param {String} prop The name of the property to check for.
 * @param {Object} obj The object to query.
 * @return {Boolean} Whether the property exists.
 * @example
 *
 *      function Rectangle(width, height) {
 *        this.width = width;
 *        this.height = height;
 *      }
 *      Rectangle.prototype.area = function() {
 *        return this.width * this.height;
 *      };
 *
 *      const square = new Rectangle(2, 2);
 *      R.hasIn('width', square);  //=> true
 *      R.hasIn('area', square);  //=> true
 */
var hasIn =
/*#__PURE__*/
(0, _curry.default)(function hasIn(prop, obj) {
  return prop in obj;
});
var _default = hasIn;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/identical.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectIs2 = _interopRequireDefault(require("./internal/_objectIs.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`;
 * `0` and `-0` are not identical.
 *
 * Note this is merely a curried version of ES6 `Object.is`.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      const o = {};
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */
var identical =
/*#__PURE__*/
(0, _curry.default)(_objectIs2.default);
var _default = identical;
exports.default = _default;
},{"./internal/_objectIs.js":"node_modules/ramda/es/internal/_objectIs.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/ifElse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a function that will process either the `onTrue` or the `onFalse`
 * function depending upon the result of the `condition` predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
 * @param {Function} condition A predicate function
 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
 * @return {Function} A new function that will process either the `onTrue` or the `onFalse`
 *                    function depending upon the result of the `condition` predicate.
 * @see R.unless, R.when, R.cond
 * @example
 *
 *      const incCount = R.ifElse(
 *        R.has('count'),
 *        R.over(R.lensProp('count'), R.inc),
 *        R.assoc('count', 1)
 *      );
 *      incCount({});           //=> { count: 1 }
 *      incCount({ count: 1 }); //=> { count: 2 }
 */
var ifElse =
/*#__PURE__*/
(0, _curry.default)(function ifElse(condition, onTrue, onFalse) {
  return (0, _curryN.default)(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
    return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
  });
});
var _default = ifElse;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/inc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _add = _interopRequireDefault(require("./add.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Increments its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n + 1
 * @see R.dec
 * @example
 *
 *      R.inc(42); //=> 43
 */
var inc =
/*#__PURE__*/
(0, _add.default)(1);
var _default = inc;
exports.default = _default;
},{"./add.js":"node_modules/ramda/es/add.js"}],"node_modules/ramda/es/includes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes2 = _interopRequireDefault(require("./internal/_includes.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 * Works also with strings.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.any
 * @example
 *
 *      R.includes(3, [1, 2, 3]); //=> true
 *      R.includes(4, [1, 2, 3]); //=> false
 *      R.includes({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.includes([42], [[42]]); //=> true
 *      R.includes('ba', 'banana'); //=>true
 */
var includes =
/*#__PURE__*/
(0, _curry.default)(_includes2.default);
var _default = includes;
exports.default = _default;
},{"./internal/_includes.js":"node_modules/ramda/es/internal/_includes.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/indexBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reduceBy = _interopRequireDefault(require("./reduceBy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a function that generates a key, turns a list of objects into an
 * object indexing the objects by the given key. Note that if multiple
 * objects generate the same value for the indexing key only the last value
 * will be included in the generated object.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (a -> String) -> [{k: v}] -> {k: {k: v}}
 * @param {Function} fn Function :: a -> String
 * @param {Array} array The array of objects to index
 * @return {Object} An object indexing each array element by the given property.
 * @example
 *
 *      const list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
 *      R.indexBy(R.prop('id'), list);
 *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
 */
var indexBy =
/*#__PURE__*/
(0, _reduceBy.default)(function (acc, elem) {
  return elem;
}, null);
var _default = indexBy;
exports.default = _default;
},{"./reduceBy.js":"node_modules/ramda/es/reduceBy.js"}],"node_modules/ramda/es/indexOf.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _indexOf2 = _interopRequireDefault(require("./internal/_indexOf.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the position of the first occurrence of an item in an array, or -1
 * if the item is not included in the array. [`R.equals`](#equals) is used to
 * determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Number
 * @param {*} target The item to find.
 * @param {Array} xs The array to search in.
 * @return {Number} the index of the target, or -1 if the target is not found.
 * @see R.lastIndexOf
 * @example
 *
 *      R.indexOf(3, [1,2,3,4]); //=> 2
 *      R.indexOf(10, [1,2,3,4]); //=> -1
 */
var indexOf =
/*#__PURE__*/
(0, _curry.default)(function indexOf(target, xs) {
  return typeof xs.indexOf === 'function' && !(0, _isArray2.default)(xs) ? xs.indexOf(target) : (0, _indexOf2.default)(xs, target, 0);
});
var _default = indexOf;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_indexOf.js":"node_modules/ramda/es/internal/_indexOf.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js"}],"node_modules/ramda/es/init.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns all but the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.last, R.head, R.tail
 * @example
 *
 *      R.init([1, 2, 3]);  //=> [1, 2]
 *      R.init([1, 2]);     //=> [1]
 *      R.init([1]);        //=> []
 *      R.init([]);         //=> []
 *
 *      R.init('abc');  //=> 'ab'
 *      R.init('ab');   //=> 'a'
 *      R.init('a');    //=> ''
 *      R.init('');     //=> ''
 */
var init =
/*#__PURE__*/
(0, _slice.default)(0, -1);
var _default = init;
exports.default = _default;
},{"./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/innerJoin.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includesWith2 = _interopRequireDefault(require("./internal/_includesWith.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _filter2 = _interopRequireDefault(require("./internal/_filter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a predicate `pred`, a list `xs`, and a list `ys`, and returns a list
 * `xs'` comprising each of the elements of `xs` which is equal to one or more
 * elements of `ys` according to `pred`.
 *
 * `pred` must be a binary function expecting an element from each list.
 *
 * `xs`, `ys`, and `xs'` are treated as sets, semantically, so ordering should
 * not be significant, but since `xs'` is ordered the implementation guarantees
 * that its values are in the same order as they appear in `xs`. Duplicates are
 * not removed, so `xs'` may contain duplicates if `xs` contains duplicates.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Relation
 * @sig ((a, b) -> Boolean) -> [a] -> [b] -> [a]
 * @param {Function} pred
 * @param {Array} xs
 * @param {Array} ys
 * @return {Array}
 * @see R.intersection
 * @example
 *
 *      R.innerJoin(
 *        (record, id) => record.id === id,
 *        [{id: 824, name: 'Richie Furay'},
 *         {id: 956, name: 'Dewey Martin'},
 *         {id: 313, name: 'Bruce Palmer'},
 *         {id: 456, name: 'Stephen Stills'},
 *         {id: 177, name: 'Neil Young'}],
 *        [177, 456, 999]
 *      );
 *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
 */
var innerJoin =
/*#__PURE__*/
(0, _curry.default)(function innerJoin(pred, xs, ys) {
  return (0, _filter2.default)(function (x) {
    return (0, _includesWith2.default)(pred, x, ys);
  }, xs);
});
var _default = innerJoin;
exports.default = _default;
},{"./internal/_includesWith.js":"node_modules/ramda/es/internal/_includesWith.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_filter.js":"node_modules/ramda/es/internal/_filter.js"}],"node_modules/ramda/es/insert.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Inserts the supplied element into the list, at the specified `index`. _Note that

 * this is not destructive_: it returns a copy of the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.2.2
 * @category List
 * @sig Number -> a -> [a] -> [a]
 * @param {Number} index The position to insert the element
 * @param {*} elt The element to insert into the Array
 * @param {Array} list The list to insert into
 * @return {Array} A new Array with `elt` inserted at `index`.
 * @example
 *
 *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
 */
var insert =
/*#__PURE__*/
(0, _curry.default)(function insert(idx, elt, list) {
  idx = idx < list.length && idx >= 0 ? idx : list.length;
  var result = Array.prototype.slice.call(list, 0);
  result.splice(idx, 0, elt);
  return result;
});
var _default = insert;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/insertAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Inserts the sub-list into the list, at the specified `index`. _Note that this is not
 * destructive_: it returns a copy of the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig Number -> [a] -> [a] -> [a]
 * @param {Number} index The position to insert the sub-list
 * @param {Array} elts The sub-list to insert into the Array
 * @param {Array} list The list to insert the sub-list into
 * @return {Array} A new Array with `elts` inserted starting at `index`.
 * @example
 *
 *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
 */
var insertAll =
/*#__PURE__*/
(0, _curry.default)(function insertAll(idx, elts, list) {
  idx = idx < list.length && idx >= 0 ? idx : list.length;
  return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
});
var _default = insertAll;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/uniqBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Set2 = _interopRequireDefault(require("./internal/_Set.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied function to
 * each list element. Prefers the first item if the supplied function produces
 * the same value on two items. [`R.equals`](#equals) is used for comparison.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> b) -> [a] -> [a]
 * @param {Function} fn A function used to produce a value to use during comparisons.
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
 */
var uniqBy =
/*#__PURE__*/
(0, _curry.default)(function uniqBy(fn, list) {
  var set = new _Set2.default();
  var result = [];
  var idx = 0;
  var appliedItem, item;

  while (idx < list.length) {
    item = list[idx];
    appliedItem = fn(item);

    if (set.add(appliedItem)) {
      result.push(item);
    }

    idx += 1;
  }

  return result;
});
var _default = uniqBy;
exports.default = _default;
},{"./internal/_Set.js":"node_modules/ramda/es/internal/_Set.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/uniq.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _identity = _interopRequireDefault(require("./identity.js"));

var _uniqBy = _interopRequireDefault(require("./uniqBy.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing only one copy of each element in the original
 * list. [`R.equals`](#equals) is used to determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
 *      R.uniq([1, '1']);     //=> [1, '1']
 *      R.uniq([[42], [42]]); //=> [[42]]
 */
var uniq =
/*#__PURE__*/
(0, _uniqBy.default)(_identity.default);
var _default = uniq;
exports.default = _default;
},{"./identity.js":"node_modules/ramda/es/identity.js","./uniqBy.js":"node_modules/ramda/es/uniqBy.js"}],"node_modules/ramda/es/intersection.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes2 = _interopRequireDefault(require("./internal/_includes.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _filter2 = _interopRequireDefault(require("./internal/_filter.js"));

var _flip = _interopRequireDefault(require("./flip.js"));

var _uniq = _interopRequireDefault(require("./uniq.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Combines two lists into a set (i.e. no duplicates) composed of those
 * elements common to both lists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The list of elements found in both `list1` and `list2`.
 * @see R.innerJoin
 * @example
 *
 *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
 */
var intersection =
/*#__PURE__*/
(0, _curry.default)(function intersection(list1, list2) {
  var lookupList, filteredList;

  if (list1.length > list2.length) {
    lookupList = list1;
    filteredList = list2;
  } else {
    lookupList = list2;
    filteredList = list1;
  }

  return (0, _uniq.default)((0, _filter2.default)((0, _flip.default)(_includes2.default)(lookupList), filteredList));
});
var _default = intersection;
exports.default = _default;
},{"./internal/_includes.js":"node_modules/ramda/es/internal/_includes.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_filter.js":"node_modules/ramda/es/internal/_filter.js","./flip.js":"node_modules/ramda/es/flip.js","./uniq.js":"node_modules/ramda/es/uniq.js"}],"node_modules/ramda/es/intersperse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _checkForMethod2 = _interopRequireDefault(require("./internal/_checkForMethod.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new list with the separator interposed between elements.
 *
 * Dispatches to the `intersperse` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} separator The element to add to the list.
 * @param {Array} list The list to be interposed.
 * @return {Array} The new list.
 * @example
 *
 *      R.intersperse('a', ['b', 'n', 'n', 's']); //=> ['b', 'a', 'n', 'a', 'n', 'a', 's']
 */
var intersperse =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _checkForMethod2.default)('intersperse', function intersperse(separator, list) {
  var out = [];
  var idx = 0;
  var length = list.length;

  while (idx < length) {
    if (idx === length - 1) {
      out.push(list[idx]);
    } else {
      out.push(list[idx], separator);
    }

    idx += 1;
  }

  return out;
}));
var _default = intersperse;
exports.default = _default;
},{"./internal/_checkForMethod.js":"node_modules/ramda/es/internal/_checkForMethod.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_objectAssign.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _has2 = _interopRequireDefault(require("./_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
function _objectAssign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  var idx = 1;
  var length = arguments.length;

  while (idx < length) {
    var source = arguments[idx];

    if (source != null) {
      for (var nextKey in source) {
        if ((0, _has2.default)(nextKey, source)) {
          output[nextKey] = source[nextKey];
        }
      }
    }

    idx += 1;
  }

  return output;
}

var _default = typeof Object.assign === 'function' ? Object.assign : _objectAssign;

exports.default = _default;
},{"./_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/objOf.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates an object containing a single key:value pair.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Object
 * @sig String -> a -> {String:a}
 * @param {String} key
 * @param {*} val
 * @return {Object}
 * @see R.pair
 * @example
 *
 *      const matchPhrases = R.compose(
 *        R.objOf('must'),
 *        R.map(R.objOf('match_phrase'))
 *      );
 *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
 */
var objOf =
/*#__PURE__*/
(0, _curry.default)(function objOf(key, val) {
  var obj = {};
  obj[key] = val;
  return obj;
});
var _default = objOf;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_stepCat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _stepCat;

var _objectAssign2 = _interopRequireDefault(require("./_objectAssign.js"));

var _identity2 = _interopRequireDefault(require("./_identity.js"));

var _isArrayLike2 = _interopRequireDefault(require("./_isArrayLike.js"));

var _isTransformer2 = _interopRequireDefault(require("./_isTransformer.js"));

var _objOf = _interopRequireDefault(require("../objOf.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _stepCatArray = {
  '@@transducer/init': Array,
  '@@transducer/step': function (xs, x) {
    xs.push(x);
    return xs;
  },
  '@@transducer/result': _identity2.default
};
var _stepCatString = {
  '@@transducer/init': String,
  '@@transducer/step': function (a, b) {
    return a + b;
  },
  '@@transducer/result': _identity2.default
};
var _stepCatObject = {
  '@@transducer/init': Object,
  '@@transducer/step': function (result, input) {
    return (0, _objectAssign2.default)(result, (0, _isArrayLike2.default)(input) ? (0, _objOf.default)(input[0], input[1]) : input);
  },
  '@@transducer/result': _identity2.default
};

function _stepCat(obj) {
  if ((0, _isTransformer2.default)(obj)) {
    return obj;
  }

  if ((0, _isArrayLike2.default)(obj)) {
    return _stepCatArray;
  }

  if (typeof obj === 'string') {
    return _stepCatString;
  }

  if (typeof obj === 'object') {
    return _stepCatObject;
  }

  throw new Error('Cannot create transformer for ' + obj);
}
},{"./_objectAssign.js":"node_modules/ramda/es/internal/_objectAssign.js","./_identity.js":"node_modules/ramda/es/internal/_identity.js","./_isArrayLike.js":"node_modules/ramda/es/internal/_isArrayLike.js","./_isTransformer.js":"node_modules/ramda/es/internal/_isTransformer.js","../objOf.js":"node_modules/ramda/es/objOf.js"}],"node_modules/ramda/es/into.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _clone2 = _interopRequireDefault(require("./internal/_clone.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _isTransformer2 = _interopRequireDefault(require("./internal/_isTransformer.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _stepCat2 = _interopRequireDefault(require("./internal/_stepCat.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms the items of the list with the transducer and appends the
 * transformed items to the accumulator using an appropriate iterator function
 * based on the accumulator type.
 *
 * The accumulator can be an array, string, object or a transformer. Iterated
 * items will be appended to arrays and concatenated to strings. Objects will
 * be merged directly or 2-item arrays will be merged as key, value pairs.
 *
 * The accumulator can also be a transformer object that provides a 2-arity
 * reducing iterator function, step, 0-arity initial value function, init, and
 * 1-arity result extraction function result. The step function is used as the
 * iterator function in reduce. The result function is used to convert the
 * final accumulator into the return type and in most cases is R.identity. The
 * init function is used to provide the initial accumulator.
 *
 * The iteration is performed with [`R.reduce`](#reduce) after initializing the
 * transducer.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig a -> (b -> b) -> [c] -> a
 * @param {*} acc The initial accumulator value.
 * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.transduce
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
 *
 *      R.into([], transducer, numbers); //=> [2, 3]
 *
 *      const intoArray = R.into([]);
 *      intoArray(transducer, numbers); //=> [2, 3]
 */
var into =
/*#__PURE__*/
(0, _curry.default)(function into(acc, xf, list) {
  return (0, _isTransformer2.default)(acc) ? (0, _reduce2.default)(xf(acc), acc['@@transducer/init'](), list) : (0, _reduce2.default)(xf((0, _stepCat2.default)(acc)), (0, _clone2.default)(acc, [], [], false), list);
});
var _default = into;
exports.default = _default;
},{"./internal/_clone.js":"node_modules/ramda/es/internal/_clone.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_isTransformer.js":"node_modules/ramda/es/internal/_isTransformer.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_stepCat.js":"node_modules/ramda/es/internal/_stepCat.js"}],"node_modules/ramda/es/invert.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Same as [`R.invertObj`](#invertObj), however this accounts for objects with
 * duplicate values by putting the values into an array.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {s: x} -> {x: [ s, ... ]}
 * @param {Object} obj The object or array to invert
 * @return {Object} out A new object with keys in an array.
 * @see R.invertObj
 * @example
 *
 *      const raceResultsByFirstName = {
 *        first: 'alice',
 *        second: 'jake',
 *        third: 'alice',
 *      };
 *      R.invert(raceResultsByFirstName);
 *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
 */
var invert =
/*#__PURE__*/
(0, _curry.default)(function invert(obj) {
  var props = (0, _keys.default)(obj);
  var len = props.length;
  var idx = 0;
  var out = {};

  while (idx < len) {
    var key = props[idx];
    var val = obj[key];
    var list = (0, _has2.default)(val, out) ? out[val] : out[val] = [];
    list[list.length] = key;
    idx += 1;
  }

  return out;
});
var _default = invert;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/invertObj.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new object with the keys of the given object as values, and the
 * values of the given object, which are coerced to strings, as keys. Note
 * that the last key found is preferred when handling the same value.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {s: x} -> {x: s}
 * @param {Object} obj The object or array to invert
 * @return {Object} out A new object
 * @see R.invert
 * @example
 *
 *      const raceResults = {
 *        first: 'alice',
 *        second: 'jake'
 *      };
 *      R.invertObj(raceResults);
 *      //=> { 'alice': 'first', 'jake':'second' }
 *
 *      // Alternatively:
 *      const raceResults = ['alice', 'jake'];
 *      R.invertObj(raceResults);
 *      //=> { 'alice': '0', 'jake':'1' }
 */
var invertObj =
/*#__PURE__*/
(0, _curry.default)(function invertObj(obj) {
  var props = (0, _keys.default)(obj);
  var len = props.length;
  var idx = 0;
  var out = {};

  while (idx < len) {
    var key = props[idx];
    out[obj[key]] = key;
    idx += 1;
  }

  return out;
});
var _default = invertObj;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/invoker.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isFunction2 = _interopRequireDefault(require("./internal/_isFunction.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _toString = _interopRequireDefault(require("./toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Turns a named method with a specified arity into a function that can be
 * called directly supplied with arguments and a target object.
 *
 * The returned function is curried and accepts `arity + 1` parameters where
 * the final parameter is the target object.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
 * @param {Number} arity Number of arguments the returned function should take
 *        before the target object.
 * @param {String} method Name of the method to call.
 * @return {Function} A new curried function.
 * @see R.construct
 * @example
 *
 *      const sliceFrom = R.invoker(1, 'slice');
 *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
 *      const sliceFrom6 = R.invoker(2, 'slice')(6);
 *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
 * @symb R.invoker(0, 'method')(o) = o['method']()
 * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
 * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
 */
var invoker =
/*#__PURE__*/
(0, _curry.default)(function invoker(arity, method) {
  return (0, _curryN.default)(arity + 1, function () {
    var target = arguments[arity];

    if (target != null && (0, _isFunction2.default)(target[method])) {
      return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
    }

    throw new TypeError((0, _toString.default)(target) + ' does not have a method named "' + method + '"');
  });
});
var _default = invoker;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isFunction.js":"node_modules/ramda/es/internal/_isFunction.js","./curryN.js":"node_modules/ramda/es/curryN.js","./toString.js":"node_modules/ramda/es/toString.js"}],"node_modules/ramda/es/is.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * See if an object (`val`) is an instance of the supplied constructor. This
 * function will check up the inheritance chain, if any.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Type
 * @sig (* -> {*}) -> a -> Boolean
 * @param {Object} ctor A constructor
 * @param {*} val The value to test
 * @return {Boolean}
 * @example
 *
 *      R.is(Object, {}); //=> true
 *      R.is(Number, 1); //=> true
 *      R.is(Object, 1); //=> false
 *      R.is(String, 's'); //=> true
 *      R.is(String, new String('')); //=> true
 *      R.is(Object, new String('')); //=> true
 *      R.is(Object, 's'); //=> false
 *      R.is(Number, {}); //=> false
 */
var is =
/*#__PURE__*/
(0, _curry.default)(function is(Ctor, val) {
  return val != null && val.constructor === Ctor || val instanceof Ctor;
});
var _default = is;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/isEmpty.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _empty = _interopRequireDefault(require("./empty.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);   //=> false
 *      R.isEmpty([]);          //=> true
 *      R.isEmpty('');          //=> true
 *      R.isEmpty(null);        //=> false
 *      R.isEmpty({});          //=> true
 *      R.isEmpty({length: 0}); //=> false
 */
var isEmpty =
/*#__PURE__*/
(0, _curry.default)(function isEmpty(x) {
  return x != null && (0, _equals.default)(x, (0, _empty.default)(x));
});
var _default = isEmpty;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./empty.js":"node_modules/ramda/es/empty.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/join.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _invoker = _interopRequireDefault(require("./invoker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a string made by inserting the `separator` between each element and
 * concatenating all the elements into a single string.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig String -> [a] -> String
 * @param {Number|String} separator The string used to separate the elements.
 * @param {Array} xs The elements to join into a string.
 * @return {String} str The string made by concatenating `xs` with `separator`.
 * @see R.split
 * @example
 *
 *      const spacer = R.join(' ');
 *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
 *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
 */
var join =
/*#__PURE__*/
(0, _invoker.default)(1, 'join');
var _default = join;
exports.default = _default;
},{"./invoker.js":"node_modules/ramda/es/invoker.js"}],"node_modules/ramda/es/juxt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _converge = _interopRequireDefault(require("./converge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * juxt applies a list of functions to a list of values.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Function
 * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
 * @param {Array} fns An array of functions
 * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
 * @see R.applySpec
 * @example
 *
 *      const getRange = R.juxt([Math.min, Math.max]);
 *      getRange(3, 4, 9, -3); //=> [-3, 9]
 * @symb R.juxt([f, g, h])(a, b) = [f(a, b), g(a, b), h(a, b)]
 */
var juxt =
/*#__PURE__*/
(0, _curry.default)(function juxt(fns) {
  return (0, _converge.default)(function () {
    return Array.prototype.slice.call(arguments, 0);
  }, fns);
});
var _default = juxt;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./converge.js":"node_modules/ramda/es/converge.js"}],"node_modules/ramda/es/keysIn.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a list containing the names of all the properties of the supplied
 * object, including prototype properties.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own and prototype properties.
 * @see R.keys, R.valuesIn
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.keysIn(f); //=> ['x', 'y']
 */
var keysIn =
/*#__PURE__*/
(0, _curry.default)(function keysIn(obj) {
  var prop;
  var ks = [];

  for (prop in obj) {
    ks[ks.length] = prop;
  }

  return ks;
});
var _default = keysIn;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/lastIndexOf.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isArray2 = _interopRequireDefault(require("./internal/_isArray.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the position of the last occurrence of an item in an array, or -1 if
 * the item is not included in the array. [`R.equals`](#equals) is used to
 * determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Number
 * @param {*} target The item to find.
 * @param {Array} xs The array to search in.
 * @return {Number} the index of the target, or -1 if the target is not found.
 * @see R.indexOf
 * @example
 *
 *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
 *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
 */
var lastIndexOf =
/*#__PURE__*/
(0, _curry.default)(function lastIndexOf(target, xs) {
  if (typeof xs.lastIndexOf === 'function' && !(0, _isArray2.default)(xs)) {
    return xs.lastIndexOf(target);
  } else {
    var idx = xs.length - 1;

    while (idx >= 0) {
      if ((0, _equals.default)(xs[idx], target)) {
        return idx;
      }

      idx -= 1;
    }

    return -1;
  }
});
var _default = lastIndexOf;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isArray.js":"node_modules/ramda/es/internal/_isArray.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/internal/_isNumber.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isNumber;

function _isNumber(x) {
  return Object.prototype.toString.call(x) === '[object Number]';
}
},{}],"node_modules/ramda/es/length.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _isNumber2 = _interopRequireDefault(require("./internal/_isNumber.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the number of elements in the array by returning `list.length`.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [a] -> Number
 * @param {Array} list The array to inspect.
 * @return {Number} The length of the array.
 * @example
 *
 *      R.length([]); //=> 0
 *      R.length([1, 2, 3]); //=> 3
 */
var length =
/*#__PURE__*/
(0, _curry.default)(function length(list) {
  return list != null && (0, _isNumber2.default)(list.length) ? list.length : NaN;
});
var _default = length;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_isNumber.js":"node_modules/ramda/es/internal/_isNumber.js"}],"node_modules/ramda/es/lens.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _map = _interopRequireDefault(require("./map.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a lens for the given getter and setter functions. The getter "gets"
 * the value of the focus; the setter "sets" the value of the focus. The setter
 * should not mutate the data structure.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
 * @param {Function} getter
 * @param {Function} setter
 * @return {Lens}
 * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lens(R.prop('x'), R.assoc('x'));
 *
 *      R.view(xLens, {x: 1, y: 2});            //=> 1
 *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
 *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
 */
var lens =
/*#__PURE__*/
(0, _curry.default)(function lens(getter, setter) {
  return function (toFunctorFn) {
    return function (target) {
      return (0, _map.default)(function (focus) {
        return setter(focus, target);
      }, toFunctorFn(getter(target)));
    };
  };
});
var _default = lens;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./map.js":"node_modules/ramda/es/map.js"}],"node_modules/ramda/es/lensIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _lens = _interopRequireDefault(require("./lens.js"));

var _nth = _interopRequireDefault(require("./nth.js"));

var _update = _interopRequireDefault(require("./update.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a lens whose focus is the specified index.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Number -> Lens s a
 * @param {Number} n
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const headLens = R.lensIndex(0);
 *
 *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
 *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
 *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
 */
var lensIndex =
/*#__PURE__*/
(0, _curry.default)(function lensIndex(n) {
  return (0, _lens.default)((0, _nth.default)(n), (0, _update.default)(n));
});
var _default = lensIndex;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./lens.js":"node_modules/ramda/es/lens.js","./nth.js":"node_modules/ramda/es/nth.js","./update.js":"node_modules/ramda/es/update.js"}],"node_modules/ramda/es/lensPath.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _assocPath = _interopRequireDefault(require("./assocPath.js"));

var _lens = _interopRequireDefault(require("./lens.js"));

var _path = _interopRequireDefault(require("./path.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a lens whose focus is the specified path.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @typedefn Idx = String | Int
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig [Idx] -> Lens s a
 * @param {Array} path The path to use.
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const xHeadYLens = R.lensPath(['x', 0, 'y']);
 *
 *      R.view(xHeadYLens, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> 2
 *      R.set(xHeadYLens, 1, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: 1, z: 3}, {y: 4, z: 5}]}
 *      R.over(xHeadYLens, R.negate, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: -2, z: 3}, {y: 4, z: 5}]}
 */
var lensPath =
/*#__PURE__*/
(0, _curry.default)(function lensPath(p) {
  return (0, _lens.default)((0, _path.default)(p), (0, _assocPath.default)(p));
});
var _default = lensPath;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./assocPath.js":"node_modules/ramda/es/assocPath.js","./lens.js":"node_modules/ramda/es/lens.js","./path.js":"node_modules/ramda/es/path.js"}],"node_modules/ramda/es/lensProp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _assoc = _interopRequireDefault(require("./assoc.js"));

var _lens = _interopRequireDefault(require("./lens.js"));

var _prop = _interopRequireDefault(require("./prop.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a lens whose focus is the specified property.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig String -> Lens s a
 * @param {String} k
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.view(xLens, {x: 1, y: 2});            //=> 1
 *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
 *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
 */
var lensProp =
/*#__PURE__*/
(0, _curry.default)(function lensProp(k) {
  return (0, _lens.default)((0, _prop.default)(k), (0, _assoc.default)(k));
});
var _default = lensProp;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./assoc.js":"node_modules/ramda/es/assoc.js","./lens.js":"node_modules/ramda/es/lens.js","./prop.js":"node_modules/ramda/es/prop.js"}],"node_modules/ramda/es/lt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the first argument is less than the second; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @see R.gt
 * @example
 *
 *      R.lt(2, 1); //=> false
 *      R.lt(2, 2); //=> false
 *      R.lt(2, 3); //=> true
 *      R.lt('a', 'z'); //=> true
 *      R.lt('z', 'a'); //=> false
 */
var lt =
/*#__PURE__*/
(0, _curry.default)(function lt(a, b) {
  return a < b;
});
var _default = lt;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/lte.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the first argument is less than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.gte
 * @example
 *
 *      R.lte(2, 1); //=> false
 *      R.lte(2, 2); //=> true
 *      R.lte(2, 3); //=> true
 *      R.lte('a', 'z'); //=> true
 *      R.lte('z', 'a'); //=> false
 */
var lte =
/*#__PURE__*/
(0, _curry.default)(function lte(a, b) {
  return a <= b;
});
var _default = lte;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/mapAccum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The `mapAccum` function behaves like a combination of map and reduce; it
 * applies a function to each element of a list, passing an accumulating
 * parameter from left to right, and returning a final value of this
 * accumulator together with the new list.
 *
 * The iterator function receives two arguments, *acc* and *value*, and should
 * return a tuple *[acc, value]*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.scan, R.addIndex, R.mapAccumRight
 * @example
 *
 *      const digits = ['1', '2', '3', '4'];
 *      const appender = (a, b) => [a + b, a + b];
 *
 *      R.mapAccum(appender, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
 * @symb R.mapAccum(f, a, [b, c, d]) = [
 *   f(f(f(a, b)[0], c)[0], d)[0],
 *   [
 *     f(a, b)[1],
 *     f(f(a, b)[0], c)[1],
 *     f(f(f(a, b)[0], c)[0], d)[1]
 *   ]
 * ]
 */
var mapAccum =
/*#__PURE__*/
(0, _curry.default)(function mapAccum(fn, acc, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  var tuple = [acc];

  while (idx < len) {
    tuple = fn(tuple[0], list[idx]);
    result[idx] = tuple[1];
    idx += 1;
  }

  return [tuple[0], result];
});
var _default = mapAccum;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/mapAccumRight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The `mapAccumRight` function behaves like a combination of map and reduce; it
 * applies a function to each element of a list, passing an accumulating
 * parameter from right to left, and returning a final value of this
 * accumulator together with the new list.
 *
 * Similar to [`mapAccum`](#mapAccum), except moves through the input list from
 * the right to the left.
 *
 * The iterator function receives two arguments, *acc* and *value*, and should
 * return a tuple *[acc, value]*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.addIndex, R.mapAccum
 * @example
 *
 *      const digits = ['1', '2', '3', '4'];
 *      const appender = (a, b) => [b + a, b + a];
 *
 *      R.mapAccumRight(appender, 5, digits); //=> ['12345', ['12345', '2345', '345', '45']]
 * @symb R.mapAccumRight(f, a, [b, c, d]) = [
 *   f(f(f(a, d)[0], c)[0], b)[0],
 *   [
 *     f(a, d)[1],
 *     f(f(a, d)[0], c)[1],
 *     f(f(f(a, d)[0], c)[0], b)[1]
 *   ]
 * ]
 */
var mapAccumRight =
/*#__PURE__*/
(0, _curry.default)(function mapAccumRight(fn, acc, list) {
  var idx = list.length - 1;
  var result = [];
  var tuple = [acc];

  while (idx >= 0) {
    tuple = fn(tuple[0], list[idx]);
    result[idx] = tuple[1];
    idx -= 1;
  }

  return [tuple[0], result];
});
var _default = mapAccumRight;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/mapObjIndexed.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An Object-specific version of [`map`](#map). The function is applied to three
 * arguments: *(value, key, obj)*. If only the value is significant, use
 * [`map`](#map) instead.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig ((*, String, Object) -> *) -> Object -> Object
 * @param {Function} fn
 * @param {Object} obj
 * @return {Object}
 * @see R.map
 * @example
 *
 *      const xyz = { x: 1, y: 2, z: 3 };
 *      const prependKeyAndDouble = (num, key, obj) => key + (num * 2);
 *
 *      R.mapObjIndexed(prependKeyAndDouble, xyz); //=> { x: 'x2', y: 'y4', z: 'z6' }
 */
var mapObjIndexed =
/*#__PURE__*/
(0, _curry.default)(function mapObjIndexed(fn, obj) {
  return (0, _reduce2.default)(function (acc, key) {
    acc[key] = fn(obj[key], key, obj);
    return acc;
  }, {}, (0, _keys.default)(obj));
});
var _default = mapObjIndexed;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./keys.js":"node_modules/ramda/es/keys.js"}],"node_modules/ramda/es/match.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Tests a regular expression against a String. Note that this function will
 * return an empty array when there are no matches. This differs from
 * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
 * which returns `null` when there are no matches.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category String
 * @sig RegExp -> String -> [String | Undefined]
 * @param {RegExp} rx A regular expression.
 * @param {String} str The string to match against
 * @return {Array} The list of matches or empty array.
 * @see R.test
 * @example
 *
 *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
 *      R.match(/a/, 'b'); //=> []
 *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
 */
var match =
/*#__PURE__*/
(0, _curry.default)(function match(rx, str) {
  return str.match(rx) || [];
});
var _default = match;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/mathMod.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isInteger2 = _interopRequireDefault(require("./internal/_isInteger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `mathMod` behaves like the modulo operator should mathematically, unlike the
 * `%` operator (and by extension, [`R.modulo`](#modulo)). So while
 * `-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
 * arguments, and returns NaN when the modulus is zero or negative.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} m The dividend.
 * @param {Number} p the modulus.
 * @return {Number} The result of `b mod a`.
 * @see R.modulo
 * @example
 *
 *      R.mathMod(-17, 5);  //=> 3
 *      R.mathMod(17, 5);   //=> 2
 *      R.mathMod(17, -5);  //=> NaN
 *      R.mathMod(17, 0);   //=> NaN
 *      R.mathMod(17.2, 5); //=> NaN
 *      R.mathMod(17, 5.3); //=> NaN
 *
 *      const clock = R.mathMod(R.__, 12);
 *      clock(15); //=> 3
 *      clock(24); //=> 0
 *
 *      const seventeenMod = R.mathMod(17);
 *      seventeenMod(3);  //=> 2
 *      seventeenMod(4);  //=> 1
 *      seventeenMod(10); //=> 7
 */
var mathMod =
/*#__PURE__*/
(0, _curry.default)(function mathMod(m, p) {
  if (!(0, _isInteger2.default)(m)) {
    return NaN;
  }

  if (!(0, _isInteger2.default)(p) || p < 1) {
    return NaN;
  }

  return (m % p + p) % p;
});
var _default = mathMod;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isInteger.js":"node_modules/ramda/es/internal/_isInteger.js"}],"node_modules/ramda/es/maxBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function and two values, and returns whichever value produces the
 * larger result when passed to the provided function.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Relation
 * @sig Ord b => (a -> b) -> a -> a -> a
 * @param {Function} f
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.max, R.minBy
 * @example
 *
 *      //  square :: Number -> Number
 *      const square = n => n * n;
 *
 *      R.maxBy(square, -3, 2); //=> -3
 *
 *      R.reduce(R.maxBy(square), 0, [3, -5, 4, 1, -2]); //=> -5
 *      R.reduce(R.maxBy(square), 0, []); //=> 0
 */
var maxBy =
/*#__PURE__*/
(0, _curry.default)(function maxBy(f, a, b) {
  return f(b) > f(a) ? b : a;
});
var _default = maxBy;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/sum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _add = _interopRequireDefault(require("./add.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The sum of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.sum([2,4,6,8,100,1]); //=> 121
 */
var sum =
/*#__PURE__*/
(0, _reduce.default)(_add.default, 0);
var _default = sum;
exports.default = _default;
},{"./add.js":"node_modules/ramda/es/add.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/mean.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _sum = _interopRequireDefault(require("./sum.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the mean of the given list of numbers.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list
 * @return {Number}
 * @see R.median
 * @example
 *
 *      R.mean([2, 7, 9]); //=> 6
 *      R.mean([]); //=> NaN
 */
var mean =
/*#__PURE__*/
(0, _curry.default)(function mean(list) {
  return (0, _sum.default)(list) / list.length;
});
var _default = mean;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./sum.js":"node_modules/ramda/es/sum.js"}],"node_modules/ramda/es/median.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _mean = _interopRequireDefault(require("./mean.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the median of the given list of numbers.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list
 * @return {Number}
 * @see R.mean
 * @example
 *
 *      R.median([2, 9, 7]); //=> 7
 *      R.median([7, 2, 10, 9]); //=> 8
 *      R.median([]); //=> NaN
 */
var median =
/*#__PURE__*/
(0, _curry.default)(function median(list) {
  var len = list.length;

  if (len === 0) {
    return NaN;
  }

  var width = 2 - len % 2;
  var idx = (len - width) / 2;
  return (0, _mean.default)(Array.prototype.slice.call(list, 0).sort(function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }).slice(idx, idx + width));
});
var _default = median;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./mean.js":"node_modules/ramda/es/mean.js"}],"node_modules/ramda/es/memoizeWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new function that, when invoked, caches the result of calling `fn`
 * for a given argument set and returns the result. Subsequent calls to the
 * memoized `fn` with the same argument set will not result in an additional
 * call to `fn`; instead, the cached result for that set of arguments will be
 * returned.
 *
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Function
 * @sig (*... -> String) -> (*... -> a) -> (*... -> a)
 * @param {Function} fn The function to generate the cache key.
 * @param {Function} fn The function to memoize.
 * @return {Function} Memoized version of `fn`.
 * @example
 *
 *      let count = 0;
 *      const factorial = R.memoizeWith(R.identity, n => {
 *        count += 1;
 *        return R.product(R.range(1, n + 1));
 *      });
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      count; //=> 1
 */
var memoizeWith =
/*#__PURE__*/
(0, _curry.default)(function memoizeWith(mFn, fn) {
  var cache = {};
  return (0, _arity2.default)(fn.length, function () {
    var key = mFn.apply(this, arguments);

    if (!(0, _has2.default)(key, cache)) {
      cache[key] = fn.apply(this, arguments);
    }

    return cache[key];
  });
});
var _default = memoizeWith;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/merge.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectAssign2 = _interopRequireDefault(require("./internal/_objectAssign.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeRight, R.mergeDeepRight, R.mergeWith, R.mergeWithKey
 * @deprecated
 * @example
 *
 *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const withDefaults = R.merge({x: 0, y: 0});
 *      withDefaults({y: 2}); //=> {x: 0, y: 2}
 * @symb R.merge(a, b) = {...a, ...b}
 */
var merge =
/*#__PURE__*/
(0, _curry.default)(function merge(l, r) {
  return (0, _objectAssign2.default)({}, l, r);
});
var _default = merge;
exports.default = _default;
},{"./internal/_objectAssign.js":"node_modules/ramda/es/internal/_objectAssign.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/mergeAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectAssign2 = _interopRequireDefault(require("./internal/_objectAssign.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Merges a list of objects together into one object.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig [{k: v}] -> {k: v}
 * @param {Array} list An array of objects
 * @return {Object} A merged object.
 * @see R.reduce
 * @example
 *
 *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
 *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
 * @symb R.mergeAll([{ x: 1 }, { y: 2 }, { z: 3 }]) = { x: 1, y: 2, z: 3 }
 */
var mergeAll =
/*#__PURE__*/
(0, _curry.default)(function mergeAll(list) {
  return _objectAssign2.default.apply(null, [{}].concat(list));
});
var _default = mergeAll;
exports.default = _default;
},{"./internal/_objectAssign.js":"node_modules/ramda/es/internal/_objectAssign.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/mergeWithKey.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the key
 * and the values associated with the key in each object, with the result being
 * used as the value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWithKey, R.merge, R.mergeWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeWithKey(concatValues,
 *                     { a: true, thing: 'foo', values: [10, 20] },
 *                     { b: true, thing: 'bar', values: [15, 35] });
 *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
 * @symb R.mergeWithKey(f, { x: 1, y: 2 }, { y: 5, z: 3 }) = { x: 1, y: f('y', 2, 5), z: 3 }
 */
var mergeWithKey =
/*#__PURE__*/
(0, _curry.default)(function mergeWithKey(fn, l, r) {
  var result = {};
  var k;

  for (k in l) {
    if ((0, _has2.default)(k, l)) {
      result[k] = (0, _has2.default)(k, r) ? fn(k, l[k], r[k]) : l[k];
    }
  }

  for (k in r) {
    if ((0, _has2.default)(k, r) && !(0, _has2.default)(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
});
var _default = mergeWithKey;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/mergeDeepWithKey.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _isObject2 = _interopRequireDefault(require("./internal/_isObject.js"));

var _mergeWithKey = _interopRequireDefault(require("./mergeWithKey.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be
 *   recursively merged.
 * - otherwise the provided function is applied to the key and associated values
 *   using the resulting value as the new value associated with the key.
 * If a key only exists in one object, the value will be associated with the key
 * of the resulting object.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.mergeWithKey, R.mergeDeepWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeDeepWithKey(concatValues,
 *                         { a: true, c: { thing: 'foo', values: [10, 20] }},
 *                         { b: true, c: { thing: 'bar', values: [15, 35] }});
 *      //=> { a: true, b: true, c: { thing: 'bar', values: [10, 20, 15, 35] }}
 */
var mergeDeepWithKey =
/*#__PURE__*/
(0, _curry.default)(function mergeDeepWithKey(fn, lObj, rObj) {
  return (0, _mergeWithKey.default)(function (k, lVal, rVal) {
    if ((0, _isObject2.default)(lVal) && (0, _isObject2.default)(rVal)) {
      return mergeDeepWithKey(fn, lVal, rVal);
    } else {
      return fn(k, lVal, rVal);
    }
  }, lObj, rObj);
});
var _default = mergeDeepWithKey;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./internal/_isObject.js":"node_modules/ramda/es/internal/_isObject.js","./mergeWithKey.js":"node_modules/ramda/es/mergeWithKey.js"}],"node_modules/ramda/es/mergeDeepLeft.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _mergeDeepWithKey = _interopRequireDefault(require("./mergeDeepWithKey.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects:
 * - and both values are objects, the two values will be recursively merged
 * - otherwise the value from the first object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig {a} -> {a} -> {a}
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.merge, R.mergeDeepRight, R.mergeDeepWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepLeft({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
 *                      { age: 40, contact: { email: 'baa@example.com' }});
 *      //=> { name: 'fred', age: 10, contact: { email: 'moo@example.com' }}
 */
var mergeDeepLeft =
/*#__PURE__*/
(0, _curry.default)(function mergeDeepLeft(lObj, rObj) {
  return (0, _mergeDeepWithKey.default)(function (k, lVal, rVal) {
    return lVal;
  }, lObj, rObj);
});
var _default = mergeDeepLeft;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./mergeDeepWithKey.js":"node_modules/ramda/es/mergeDeepWithKey.js"}],"node_modules/ramda/es/mergeDeepRight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _mergeDeepWithKey = _interopRequireDefault(require("./mergeDeepWithKey.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects:
 * - and both values are objects, the two values will be recursively merged
 * - otherwise the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig {a} -> {a} -> {a}
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.merge, R.mergeDeepLeft, R.mergeDeepWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepRight({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
 *                       { age: 40, contact: { email: 'baa@example.com' }});
 *      //=> { name: 'fred', age: 40, contact: { email: 'baa@example.com' }}
 */
var mergeDeepRight =
/*#__PURE__*/
(0, _curry.default)(function mergeDeepRight(lObj, rObj) {
  return (0, _mergeDeepWithKey.default)(function (k, lVal, rVal) {
    return rVal;
  }, lObj, rObj);
});
var _default = mergeDeepRight;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./mergeDeepWithKey.js":"node_modules/ramda/es/mergeDeepWithKey.js"}],"node_modules/ramda/es/mergeDeepWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _mergeDeepWithKey = _interopRequireDefault(require("./mergeDeepWithKey.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be
 *   recursively merged.
 * - otherwise the provided function is applied to associated values using the
 *   resulting value as the new value associated with the key.
 * If a key only exists in one object, the value will be associated with the key
 * of the resulting object.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.mergeWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepWith(R.concat,
 *                      { a: true, c: { values: [10, 20] }},
 *                      { b: true, c: { values: [15, 35] }});
 *      //=> { a: true, b: true, c: { values: [10, 20, 15, 35] }}
 */
var mergeDeepWith =
/*#__PURE__*/
(0, _curry.default)(function mergeDeepWith(fn, lObj, rObj) {
  return (0, _mergeDeepWithKey.default)(function (k, lVal, rVal) {
    return fn(lVal, rVal);
  }, lObj, rObj);
});
var _default = mergeDeepWith;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./mergeDeepWithKey.js":"node_modules/ramda/es/mergeDeepWithKey.js"}],"node_modules/ramda/es/mergeLeft.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectAssign2 = _interopRequireDefault(require("./internal/_objectAssign.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the first object will be used.
 *
 * @func
 * @memberOf R
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeRight, R.mergeDeepLeft, R.mergeWith, R.mergeWithKey
 * @example
 *
 *      R.mergeLeft({ 'age': 40 }, { 'name': 'fred', 'age': 10 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const resetToDefault = R.mergeLeft({x: 0});
 *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeLeft(a, b) = {...b, ...a}
 */
var mergeLeft =
/*#__PURE__*/
(0, _curry.default)(function mergeLeft(l, r) {
  return (0, _objectAssign2.default)({}, r, l);
});
var _default = mergeLeft;
exports.default = _default;
},{"./internal/_objectAssign.js":"node_modules/ramda/es/internal/_objectAssign.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/mergeRight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectAssign2 = _interopRequireDefault(require("./internal/_objectAssign.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeLeft, R.mergeDeepRight, R.mergeWith, R.mergeWithKey
 * @example
 *
 *      R.mergeRight({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const withDefaults = R.mergeRight({x: 0, y: 0});
 *      withDefaults({y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeRight(a, b) = {...a, ...b}
 */
var mergeRight =
/*#__PURE__*/
(0, _curry.default)(function mergeRight(l, r) {
  return (0, _objectAssign2.default)({}, l, r);
});
var _default = mergeRight;
exports.default = _default;
},{"./internal/_objectAssign.js":"node_modules/ramda/es/internal/_objectAssign.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/mergeWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _mergeWithKey = _interopRequireDefault(require("./mergeWithKey.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the values
 * associated with the key in each object, with the result being used as the
 * value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWith, R.merge, R.mergeWithKey
 * @example
 *
 *      R.mergeWith(R.concat,
 *                  { a: true, values: [10, 20] },
 *                  { b: true, values: [15, 35] });
 *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
 */
var mergeWith =
/*#__PURE__*/
(0, _curry.default)(function mergeWith(fn, l, r) {
  return (0, _mergeWithKey.default)(function (_, _l, _r) {
    return fn(_l, _r);
  }, l, r);
});
var _default = mergeWith;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./mergeWithKey.js":"node_modules/ramda/es/mergeWithKey.js"}],"node_modules/ramda/es/min.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the smaller of its two arguments.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> a
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.minBy, R.max
 * @example
 *
 *      R.min(789, 123); //=> 123
 *      R.min('a', 'b'); //=> 'a'
 */
var min =
/*#__PURE__*/
(0, _curry.default)(function min(a, b) {
  return b < a ? b : a;
});
var _default = min;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/minBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function and two values, and returns whichever value produces the
 * smaller result when passed to the provided function.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Relation
 * @sig Ord b => (a -> b) -> a -> a -> a
 * @param {Function} f
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.min, R.maxBy
 * @example
 *
 *      //  square :: Number -> Number
 *      const square = n => n * n;
 *
 *      R.minBy(square, -3, 2); //=> 2
 *
 *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
 *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
 */
var minBy =
/*#__PURE__*/
(0, _curry.default)(function minBy(f, a, b) {
  return f(b) < f(a) ? b : a;
});
var _default = minBy;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/modulo.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Divides the first parameter by the second and returns the remainder. Note
 * that this function preserves the JavaScript-style behavior for modulo. For
 * mathematical modulo see [`mathMod`](#mathMod).
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The value to the divide.
 * @param {Number} b The pseudo-modulus
 * @return {Number} The result of `b % a`.
 * @see R.mathMod
 * @example
 *
 *      R.modulo(17, 3); //=> 2
 *      // JS behavior:
 *      R.modulo(-17, 3); //=> -2
 *      R.modulo(17, -3); //=> 2
 *
 *      const isOdd = R.modulo(R.__, 2);
 *      isOdd(42); //=> 0
 *      isOdd(21); //=> 1
 */
var modulo =
/*#__PURE__*/
(0, _curry.default)(function modulo(a, b) {
  return a % b;
});
var _default = modulo;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/move.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Move an item, at index `from`, to index `to`, in a list of elements.
 * A new list will be created containing the new elements order.
 *
 * @func
 * @memberOf R
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @param {Number} from The source index
 * @param {Number} to The destination index
 * @param {Array} list The list which will serve to realise the move
 * @return {Array} The new list reordered
 * @example
 *
 *      R.move(0, 2, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['b', 'c', 'a', 'd', 'e', 'f']
 *      R.move(-1, 0, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['f', 'a', 'b', 'c', 'd', 'e'] list rotation
 */
var move =
/*#__PURE__*/
(0, _curry.default)(function (from, to, list) {
  var length = list.length;
  var result = list.slice();
  var positiveFrom = from < 0 ? length + from : from;
  var positiveTo = to < 0 ? length + to : to;
  var item = result.splice(positiveFrom, 1);
  return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
});
var _default = move;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/multiply.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Multiplies two numbers. Equivalent to `a * b` but curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a * b`.
 * @see R.divide
 * @example
 *
 *      const double = R.multiply(2);
 *      const triple = R.multiply(3);
 *      double(3);       //=>  6
 *      triple(4);       //=> 12
 *      R.multiply(2, 5);  //=> 10
 */
var multiply =
/*#__PURE__*/
(0, _curry.default)(function multiply(a, b) {
  return a * b;
});
var _default = multiply;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/negate.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Negates its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number}
 * @example
 *
 *      R.negate(42); //=> -42
 */
var negate =
/*#__PURE__*/
(0, _curry.default)(function negate(n) {
  return -n;
});
var _default = negate;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/none.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _complement2 = _interopRequireDefault(require("./internal/_complement.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _all = _interopRequireDefault(require("./all.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if no elements of the list match the predicate, `false`
 * otherwise.
 *
 * Dispatches to the `all` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
 * @see R.all, R.any
 * @example
 *
 *      const isEven = n => n % 2 === 0;
 *      const isOdd = n => n % 2 === 1;
 *
 *      R.none(isEven, [1, 3, 5, 7, 9, 11]); //=> true
 *      R.none(isOdd, [1, 3, 5, 7, 8, 11]); //=> false
 */
var none =
/*#__PURE__*/
(0, _curry.default)(function none(fn, input) {
  return (0, _all.default)((0, _complement2.default)(fn), input);
});
var _default = none;
exports.default = _default;
},{"./internal/_complement.js":"node_modules/ramda/es/internal/_complement.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./all.js":"node_modules/ramda/es/all.js"}],"node_modules/ramda/es/nthArg.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _nth = _interopRequireDefault(require("./nth.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function which returns its nth argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig Number -> *... -> *
 * @param {Number} n
 * @return {Function}
 * @example
 *
 *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
 *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
 * @symb R.nthArg(-1)(a, b, c) = c
 * @symb R.nthArg(0)(a, b, c) = a
 * @symb R.nthArg(1)(a, b, c) = b
 */
var nthArg =
/*#__PURE__*/
(0, _curry.default)(function nthArg(n) {
  var arity = n < 0 ? 1 : n + 1;
  return (0, _curryN.default)(arity, function () {
    return (0, _nth.default)(n, arguments);
  });
});
var _default = nthArg;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./curryN.js":"node_modules/ramda/es/curryN.js","./nth.js":"node_modules/ramda/es/nth.js"}],"node_modules/ramda/es/o.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `o` is a curried composition function that returns a unary function.
 * Like [`compose`](#compose), `o` performs right-to-left function composition.
 * Unlike [`compose`](#compose), the rightmost function passed to `o` will be
 * invoked with only one argument. Also, unlike [`compose`](#compose), `o` is
 * limited to accepting only 2 unary functions. The name o was chosen because
 * of its similarity to the mathematical composition operator ∘.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Function
 * @sig (b -> c) -> (a -> b) -> a -> c
 * @param {Function} f
 * @param {Function} g
 * @return {Function}
 * @see R.compose, R.pipe
 * @example
 *
 *      const classyGreeting = name => "The name's " + name.last + ", " + name.first + " " + name.last
 *      const yellGreeting = R.o(R.toUpper, classyGreeting);
 *      yellGreeting({first: 'James', last: 'Bond'}); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.o(R.multiply(10), R.add(10))(-4) //=> 60
 *
 * @symb R.o(f, g, x) = f(g(x))
 */
var o =
/*#__PURE__*/
(0, _curry.default)(function o(f, g, x) {
  return f(g(x));
});
var _default = o;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/internal/_of.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _of;

function _of(x) {
  return [x];
}
},{}],"node_modules/ramda/es/of.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _of2 = _interopRequireDefault(require("./internal/_of.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a singleton array containing the value provided.
 *
 * Note this `of` is different from the ES6 `of`; See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> [a]
 * @param {*} x any value
 * @return {Array} An array wrapping `x`.
 * @example
 *
 *      R.of(null); //=> [null]
 *      R.of([42]); //=> [[42]]
 */
var of =
/*#__PURE__*/
(0, _curry.default)(_of2.default);
var _default = of;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_of.js":"node_modules/ramda/es/internal/_of.js"}],"node_modules/ramda/es/omit.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a partial copy of an object omitting the keys specified.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [String] -> {String: *} -> {String: *}
 * @param {Array} names an array of String property names to omit from the new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with properties from `names` not on it.
 * @see R.pick
 * @example
 *
 *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
 */
var omit =
/*#__PURE__*/
(0, _curry.default)(function omit(names, obj) {
  var result = {};
  var index = {};
  var idx = 0;
  var len = names.length;

  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }

  for (var prop in obj) {
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }

  return result;
});
var _default = omit;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/once.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Accepts a function `fn` and returns a function that guards invocation of
 * `fn` such that `fn` can only ever be called once, no matter how many times
 * the returned function is invoked. The first value calculated is returned in
 * subsequent invocations.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (a... -> b) -> (a... -> b)
 * @param {Function} fn The function to wrap in a call-only-once wrapper.
 * @return {Function} The wrapped function.
 * @example
 *
 *      const addOneOnce = R.once(x => x + 1);
 *      addOneOnce(10); //=> 11
 *      addOneOnce(addOneOnce(50)); //=> 11
 */
var once =
/*#__PURE__*/
(0, _curry.default)(function once(fn) {
  var called = false;
  var result;
  return (0, _arity2.default)(fn.length, function () {
    if (called) {
      return result;
    }

    called = true;
    result = fn.apply(this, arguments);
    return result;
  });
});
var _default = once;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/internal/_assertPromise.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _assertPromise;

var _isFunction2 = _interopRequireDefault(require("./_isFunction.js"));

var _toString2 = _interopRequireDefault(require("./_toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertPromise(name, p) {
  if (p == null || !(0, _isFunction2.default)(p.then)) {
    throw new TypeError('`' + name + '` expected a Promise, received ' + (0, _toString2.default)(p, []));
  }
}
},{"./_isFunction.js":"node_modules/ramda/es/internal/_isFunction.js","./_toString.js":"node_modules/ramda/es/internal/_toString.js"}],"node_modules/ramda/es/otherwise.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _assertPromise2 = _interopRequireDefault(require("./internal/_assertPromise.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the result of applying the onFailure function to the value inside
 * a failed promise. This is useful for handling rejected promises
 * inside function compositions.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig (e -> b) -> (Promise e a) -> (Promise e b)
 * @sig (e -> (Promise f b)) -> (Promise e a) -> (Promise f b)
 * @param {Function} onFailure The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @return {Promise} The result of calling `p.then(null, onFailure)`
 * @see R.then
 * @example
 *
 *      var failedFetch = (id) => Promise.reject('bad ID');
 *      var useDefault = () => ({ firstName: 'Bob', lastName: 'Loblaw' })
 *
 *      //recoverFromFailure :: String -> Promise ({firstName, lastName})
 *      var recoverFromFailure = R.pipe(
 *        failedFetch,
 *        R.otherwise(useDefault),
 *        R.then(R.pick(['firstName', 'lastName'])),
 *      );
 *      recoverFromFailure(12345).then(console.log)
 */
var otherwise =
/*#__PURE__*/
(0, _curry.default)(function otherwise(f, p) {
  (0, _assertPromise2.default)('otherwise', p);
  return p.then(null, f);
});
var _default = otherwise;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_assertPromise.js":"node_modules/ramda/es/internal/_assertPromise.js"}],"node_modules/ramda/es/over.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// `Identity` is a functor that holds a single value, where `map` simply
// transforms the held value with the provided function.
var Identity = function (x) {
  return {
    value: x,
    map: function (f) {
      return Identity(f(x));
    }
  };
};
/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the result of applying the given function to
 * the focused value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> (a -> a) -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const headLens = R.lensIndex(0);
 *
 *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
 */


var over =
/*#__PURE__*/
(0, _curry.default)(function over(lens, f, x) {
  // The value returned by the getter function is first transformed with `f`,
  // then set as the value of an `Identity`. This is then mapped over with the
  // setter function of the lens.
  return lens(function (y) {
    return Identity(f(y));
  })(x).value;
});
var _default = over;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/pair.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category List
 * @sig a -> b -> (a,b)
 * @param {*} fst
 * @param {*} snd
 * @return {Array}
 * @see R.objOf, R.of
 * @example
 *
 *      R.pair('foo', 'bar'); //=> ['foo', 'bar']
 */
var pair =
/*#__PURE__*/
(0, _curry.default)(function pair(fst, snd) {
  return [fst, snd];
});
var _default = pair;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/internal/_createPartialApplicator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _createPartialApplicator;

var _arity2 = _interopRequireDefault(require("./_arity.js"));

var _curry = _interopRequireDefault(require("./_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createPartialApplicator(concat) {
  return (0, _curry.default)(function (fn, args) {
    return (0, _arity2.default)(Math.max(0, fn.length - args.length), function () {
      return fn.apply(this, concat(args, arguments));
    });
  });
}
},{"./_arity.js":"node_modules/ramda/es/internal/_arity.js","./_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/partial.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _createPartialApplicator2 = _interopRequireDefault(require("./internal/_createPartialApplicator.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided initially followed by the arguments provided to `g`.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partialRight, R.curry
 * @example
 *
 *      const multiply2 = (a, b) => a * b;
 *      const double = R.partial(multiply2, [2]);
 *      double(2); //=> 4
 *
 *      const greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      const sayHello = R.partial(greet, ['Hello']);
 *      const sayHelloToMs = R.partial(sayHello, ['Ms.']);
 *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partial(f, [a, b])(c, d) = f(a, b, c, d)
 */
var partial =
/*#__PURE__*/
(0, _createPartialApplicator2.default)(_concat2.default);
var _default = partial;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_createPartialApplicator.js":"node_modules/ramda/es/internal/_createPartialApplicator.js"}],"node_modules/ramda/es/partialRight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _createPartialApplicator2 = _interopRequireDefault(require("./internal/_createPartialApplicator.js"));

var _flip = _interopRequireDefault(require("./flip.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided to `g` followed by the arguments provided initially.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partial
 * @example
 *
 *      const greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      const greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
 *
 *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partialRight(f, [a, b])(c, d) = f(c, d, a, b)
 */
var partialRight =
/*#__PURE__*/
(0, _createPartialApplicator2.default)(
/*#__PURE__*/
(0, _flip.default)(_concat2.default));
var _default = partialRight;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_createPartialApplicator.js":"node_modules/ramda/es/internal/_createPartialApplicator.js","./flip.js":"node_modules/ramda/es/flip.js"}],"node_modules/ramda/es/partition.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _filter = _interopRequireDefault(require("./filter.js"));

var _juxt = _interopRequireDefault(require("./juxt.js"));

var _reject = _interopRequireDefault(require("./reject.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a predicate and a list or other `Filterable` object and returns the
 * pair of filterable objects of the same type of elements which do and do not
 * satisfy, the predicate, respectively. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
 * @param {Function} pred A predicate to determine which side the element belongs to.
 * @param {Array} filterable the list (or other filterable) to partition.
 * @return {Array} An array, containing first the subset of elements that satisfy the
 *         predicate, and second the subset of elements that do not satisfy.
 * @see R.filter, R.reject
 * @example
 *
 *      R.partition(R.includes('s'), ['sss', 'ttt', 'foo', 'bars']);
 *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
 *
 *      R.partition(R.includes('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
 *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
 */
var partition =
/*#__PURE__*/
(0, _juxt.default)([_filter.default, _reject.default]);
var _default = partition;
exports.default = _default;
},{"./filter.js":"node_modules/ramda/es/filter.js","./juxt.js":"node_modules/ramda/es/juxt.js","./reject.js":"node_modules/ramda/es/reject.js"}],"node_modules/ramda/es/pathEq.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

var _path2 = _interopRequireDefault(require("./path.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Determines whether a nested path on an object has a specific value, in
 * [`R.equals`](#equals) terms. Most likely used to filter a list.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Relation
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> Boolean
 * @param {Array} path The path of the nested property to use
 * @param {*} val The value to compare the nested property with
 * @param {Object} obj The object to check the nested property in
 * @return {Boolean} `true` if the value equals the nested object property,
 *         `false` otherwise.
 * @example
 *
 *      const user1 = { address: { zipCode: 90210 } };
 *      const user2 = { address: { zipCode: 55555 } };
 *      const user3 = { name: 'Bob' };
 *      const users = [ user1, user2, user3 ];
 *      const isFamous = R.pathEq(['address', 'zipCode'], 90210);
 *      R.filter(isFamous, users); //=> [ user1 ]
 */
var pathEq =
/*#__PURE__*/
(0, _curry.default)(function pathEq(_path, val, obj) {
  return (0, _equals.default)((0, _path2.default)(_path, obj), val);
});
var _default = pathEq;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./equals.js":"node_modules/ramda/es/equals.js","./path.js":"node_modules/ramda/es/path.js"}],"node_modules/ramda/es/pathOr.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _defaultTo = _interopRequireDefault(require("./defaultTo.js"));

var _path = _interopRequireDefault(require("./path.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * If the given, non-null object has a value at the given path, returns the
 * value at that path. Otherwise returns the provided default value.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig a -> [Idx] -> {a} -> a
 * @param {*} d The default value.
 * @param {Array} p The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path` of the supplied object or the default value.
 * @example
 *
 *      R.pathOr('N/A', ['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.pathOr('N/A', ['a', 'b'], {c: {b: 2}}); //=> "N/A"
 */
var pathOr =
/*#__PURE__*/
(0, _curry.default)(function pathOr(d, p, obj) {
  return (0, _defaultTo.default)(d, (0, _path.default)(p, obj));
});
var _default = pathOr;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./defaultTo.js":"node_modules/ramda/es/defaultTo.js","./path.js":"node_modules/ramda/es/path.js"}],"node_modules/ramda/es/pathSatisfies.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _path = _interopRequireDefault(require("./path.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified object property at given path satisfies the
 * given predicate; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Logic
 * @typedefn Idx = String | Int
 * @sig (a -> Boolean) -> [Idx] -> {a} -> Boolean
 * @param {Function} pred
 * @param {Array} propPath
 * @param {*} obj
 * @return {Boolean}
 * @see R.propSatisfies, R.path
 * @example
 *
 *      R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}}); //=> true
 */
var pathSatisfies =
/*#__PURE__*/
(0, _curry.default)(function pathSatisfies(pred, propPath, obj) {
  return propPath.length > 0 && pred((0, _path.default)(propPath, obj));
});
var _default = pathSatisfies;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./path.js":"node_modules/ramda/es/path.js"}],"node_modules/ramda/es/pick.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a partial copy of an object containing only the keys specified. If
 * the key does not exist, the property is ignored.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.omit, R.props
 * @example
 *
 *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
 */
var pick =
/*#__PURE__*/
(0, _curry.default)(function pick(names, obj) {
  var result = {};
  var idx = 0;

  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }

    idx += 1;
  }

  return result;
});
var _default = pick;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/pickAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Similar to `pick` except that this one includes a `key: undefined` pair for
 * properties that don't exist.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.pick
 * @example
 *
 *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
 */
var pickAll =
/*#__PURE__*/
(0, _curry.default)(function pickAll(names, obj) {
  var result = {};
  var idx = 0;
  var len = names.length;

  while (idx < len) {
    var name = names[idx];
    result[name] = obj[name];
    idx += 1;
  }

  return result;
});
var _default = pickAll;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/pickBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a partial copy of an object containing only the keys that satisfy
 * the supplied predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig ((v, k) -> Boolean) -> {k: v} -> {k: v}
 * @param {Function} pred A predicate to determine whether or not a key
 *        should be included on the output object.
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties that satisfy `pred`
 *         on it.
 * @see R.pick, R.filter
 * @example
 *
 *      const isUpperCase = (val, key) => key.toUpperCase() === key;
 *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
 */
var pickBy =
/*#__PURE__*/
(0, _curry.default)(function pickBy(test, obj) {
  var result = {};

  for (var prop in obj) {
    if (test(obj[prop], prop, obj)) {
      result[prop] = obj[prop];
    }
  }

  return result;
});
var _default = pickBy;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/pipeK.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pipeK;

var _composeK = _interopRequireDefault(require("./composeK.js"));

var _reverse = _interopRequireDefault(require("./reverse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the left-to-right Kleisli composition of the provided functions,
 * each of which must return a value of a type supported by [`chain`](#chain).
 *
 * `R.pipeK(f, g, h)` is equivalent to `R.pipe(f, R.chain(g), R.chain(h))`.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Function
 * @sig Chain m => ((a -> m b), (b -> m c), ..., (y -> m z)) -> (a -> m z)
 * @param {...Function}
 * @return {Function}
 * @see R.composeK
 * @deprecated since v0.26.0
 * @example
 *
 *      //  parseJson :: String -> Maybe *
 *      //  get :: String -> Object -> Maybe *
 *
 *      //  getStateCode :: Maybe String -> Maybe String
 *      const getStateCode = R.pipeK(
 *        parseJson,
 *        get('user'),
 *        get('address'),
 *        get('state'),
 *        R.compose(Maybe.of, R.toUpper)
 *      );
 *
 *      getStateCode('{"user":{"address":{"state":"ny"}}}');
 *      //=> Just('NY')
 *      getStateCode('[Invalid JSON]');
 *      //=> Nothing()
 * @symb R.pipeK(f, g, h)(a) = R.chain(h, R.chain(g, f(a)))
 */
function pipeK() {
  if (arguments.length === 0) {
    throw new Error('pipeK requires at least one argument');
  }

  return _composeK.default.apply(this, (0, _reverse.default)(arguments));
}
},{"./composeK.js":"node_modules/ramda/es/composeK.js","./reverse.js":"node_modules/ramda/es/reverse.js"}],"node_modules/ramda/es/prepend.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list with the given element at the front, followed by the
 * contents of the list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The item to add to the head of the output list.
 * @param {Array} list The array to add to the tail of the output list.
 * @return {Array} A new array.
 * @see R.append
 * @example
 *
 *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
 */
var prepend =
/*#__PURE__*/
(0, _curry.default)(function prepend(el, list) {
  return (0, _concat2.default)([el], list);
});
var _default = prepend;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/product.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _multiply = _interopRequireDefault(require("./multiply.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Multiplies together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The product of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.product([2,4,6,8,100,1]); //=> 38400
 */
var product =
/*#__PURE__*/
(0, _reduce.default)(_multiply.default, 1);
var _default = product;
exports.default = _default;
},{"./multiply.js":"node_modules/ramda/es/multiply.js","./reduce.js":"node_modules/ramda/es/reduce.js"}],"node_modules/ramda/es/useWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Accepts a function `fn` and a list of transformer functions and returns a
 * new curried function. When the new function is invoked, it calls the
 * function `fn` with parameters consisting of the result of calling each
 * supplied handler on successive arguments to the new function.
 *
 * If more arguments are passed to the returned function than transformer
 * functions, those arguments are passed directly to `fn` as additional
 * parameters. If you expect additional arguments that don't need to be
 * transformed, although you can ignore them, it's best to pass an identity
 * function so that the new function reports the correct arity.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} fn The function to wrap.
 * @param {Array} transformers A list of transformer functions
 * @return {Function} The wrapped function.
 * @see R.converge
 * @example
 *
 *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
 *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
 *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
 *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
 * @symb R.useWith(f, [g, h])(a, b) = f(g(a), h(b))
 */
var useWith =
/*#__PURE__*/
(0, _curry.default)(function useWith(fn, transformers) {
  return (0, _curryN.default)(transformers.length, function () {
    var args = [];
    var idx = 0;

    while (idx < transformers.length) {
      args.push(transformers[idx].call(this, arguments[idx]));
      idx += 1;
    }

    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
  });
});
var _default = useWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/project.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _map2 = _interopRequireDefault(require("./internal/_map.js"));

var _identity = _interopRequireDefault(require("./identity.js"));

var _pickAll = _interopRequireDefault(require("./pickAll.js"));

var _useWith = _interopRequireDefault(require("./useWith.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reasonable analog to SQL `select` statement.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @category Relation
 * @sig [k] -> [{k: v}] -> [{k: v}]
 * @param {Array} props The property names to project
 * @param {Array} objs The objects to query
 * @return {Array} An array of objects with just the `props` properties.
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
 *      const kids = [abby, fred];
 *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
 */
var project =
/*#__PURE__*/
(0, _useWith.default)(_map2.default, [_pickAll.default, _identity.default]); // passing `identity` gives correct arity

var _default = project;
exports.default = _default;
},{"./internal/_map.js":"node_modules/ramda/es/internal/_map.js","./identity.js":"node_modules/ramda/es/identity.js","./pickAll.js":"node_modules/ramda/es/pickAll.js","./useWith.js":"node_modules/ramda/es/useWith.js"}],"node_modules/ramda/es/propEq.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified object property is equal, in
 * [`R.equals`](#equals) terms, to the given value; `false` otherwise.
 * You can test multiple properties with [`R.whereEq`](#whereEq).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig String -> a -> Object -> Boolean
 * @param {String} name
 * @param {*} val
 * @param {*} obj
 * @return {Boolean}
 * @see R.whereEq, R.propSatisfies, R.equals
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond'};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown'};
 *      const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
 *      const alois = {name: 'Alois', age: 15, disposition: 'surly'};
 *      const kids = [abby, fred, rusty, alois];
 *      const hasBrownHair = R.propEq('hair', 'brown');
 *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
 */
var propEq =
/*#__PURE__*/
(0, _curry.default)(function propEq(name, val, obj) {
  return (0, _equals.default)(val, obj[name]);
});
var _default = propEq;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./equals.js":"node_modules/ramda/es/equals.js"}],"node_modules/ramda/es/propIs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _is = _interopRequireDefault(require("./is.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified object property is of the given type;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Type
 * @sig Type -> String -> Object -> Boolean
 * @param {Function} type
 * @param {String} name
 * @param {*} obj
 * @return {Boolean}
 * @see R.is, R.propSatisfies
 * @example
 *
 *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
 *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
 *      R.propIs(Number, 'x', {});            //=> false
 */
var propIs =
/*#__PURE__*/
(0, _curry.default)(function propIs(type, name, obj) {
  return (0, _is.default)(type, obj[name]);
});
var _default = propIs;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./is.js":"node_modules/ramda/es/is.js"}],"node_modules/ramda/es/propOr.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _pathOr = _interopRequireDefault(require("./pathOr.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * If the given, non-null object has an own property with the specified name,
 * returns the value of that property. Otherwise returns the provided default
 * value.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Object
 * @sig a -> String -> Object -> a
 * @param {*} val The default value.
 * @param {String} p The name of the property to return.
 * @param {Object} obj The object to query.
 * @return {*} The value of given property of the supplied object or the default value.
 * @example
 *
 *      const alice = {
 *        name: 'ALICE',
 *        age: 101
 *      };
 *      const favorite = R.prop('favoriteLibrary');
 *      const favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
 *
 *      favorite(alice);  //=> undefined
 *      favoriteWithDefault(alice);  //=> 'Ramda'
 */
var propOr =
/*#__PURE__*/
(0, _curry.default)(function propOr(val, p, obj) {
  return (0, _pathOr.default)(val, [p], obj);
});
var _default = propOr;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./pathOr.js":"node_modules/ramda/es/pathOr.js"}],"node_modules/ramda/es/propSatisfies.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns `true` if the specified object property satisfies the given
 * predicate; `false` otherwise. You can test multiple properties with
 * [`R.where`](#where).
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Logic
 * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
 * @param {Function} pred
 * @param {String} name
 * @param {*} obj
 * @return {Boolean}
 * @see R.where, R.propEq, R.propIs
 * @example
 *
 *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
 */
var propSatisfies =
/*#__PURE__*/
(0, _curry.default)(function propSatisfies(pred, name, obj) {
  return pred(obj[name]);
});
var _default = propSatisfies;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/props.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Acts as multiple `prop`: array of keys in, array of values out. Preserves
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> [v]
 * @param {Array} ps The property names to fetch
 * @param {Object} obj The object to query
 * @return {Array} The corresponding values or partially applied function.
 * @example
 *
 *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
 *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
 *
 *      const fullName = R.compose(R.join(' '), R.props(['first', 'last']));
 *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
 */
var props =
/*#__PURE__*/
(0, _curry.default)(function props(ps, obj) {
  var len = ps.length;
  var out = [];
  var idx = 0;

  while (idx < len) {
    out[idx] = obj[ps[idx]];
    idx += 1;
  }

  return out;
});
var _default = props;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/range.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isNumber2 = _interopRequireDefault(require("./internal/_isNumber.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> Number -> [Number]
 * @param {Number} from The first number in the list.
 * @param {Number} to One more than the last number in the list.
 * @return {Array} The list of numbers in the set `[a, b)`.
 * @example
 *
 *      R.range(1, 5);    //=> [1, 2, 3, 4]
 *      R.range(50, 53);  //=> [50, 51, 52]
 */
var range =
/*#__PURE__*/
(0, _curry.default)(function range(from, to) {
  if (!((0, _isNumber2.default)(from) && (0, _isNumber2.default)(to))) {
    throw new TypeError('Both arguments to range must be numbers');
  }

  var result = [];
  var n = from;

  while (n < to) {
    result.push(n);
    n += 1;
  }

  return result;
});
var _default = range;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isNumber.js":"node_modules/ramda/es/internal/_isNumber.js"}],"node_modules/ramda/es/reduceRight.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * Similar to [`reduce`](#reduce), except moves through the input list from the
 * right to the left.
 *
 * The iterator function receives two values: *(value, acc)*, while the arguments'
 * order of `reduce`'s iterator function is *(acc, value)*.
 *
 * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduceRight` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> b) -> b -> [a] -> b
 * @param {Function} fn The iterator function. Receives two values, the current element from the array
 *        and the accumulator.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.addIndex
 * @example
 *
 *      R.reduceRight(R.subtract, 0, [1, 2, 3, 4]) // => (1 - (2 - (3 - (4 - 0)))) = -2
 *      //    -               -2
 *      //   / \              / \
 *      //  1   -            1   3
 *      //     / \              / \
 *      //    2   -     ==>    2  -1
 *      //       / \              / \
 *      //      3   -            3   4
 *      //         / \              / \
 *      //        4   0            4   0
 *
 * @symb R.reduceRight(f, a, [b, c, d]) = f(b, f(c, f(d, a)))
 */
var reduceRight =
/*#__PURE__*/
(0, _curry.default)(function reduceRight(fn, acc, list) {
  var idx = list.length - 1;

  while (idx >= 0) {
    acc = fn(list[idx], acc);
    idx -= 1;
  }

  return acc;
});
var _default = reduceRight;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/reduceWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curryN2 = _interopRequireDefault(require("./internal/_curryN.js"));

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _reduced2 = _interopRequireDefault(require("./internal/_reduced.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Like [`reduce`](#reduce), `reduceWhile` returns a single item by iterating
 * through the list, successively calling the iterator function. `reduceWhile`
 * also takes a predicate that is evaluated before each step. If the predicate
 * returns `false`, it "short-circuits" the iteration and returns the current
 * value of the accumulator.
 *
 * @func
 * @memberOf R
 * @since v0.22.0
 * @category List
 * @sig ((a, b) -> Boolean) -> ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} pred The predicate. It is passed the accumulator and the
 *        current element.
 * @param {Function} fn The iterator function. Receives two values, the
 *        accumulator and the current element.
 * @param {*} a The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.reduced
 * @example
 *
 *      const isOdd = (acc, x) => x % 2 === 1;
 *      const xs = [1, 3, 5, 60, 777, 800];
 *      R.reduceWhile(isOdd, R.add, 0, xs); //=> 9
 *
 *      const ys = [2, 4, 6]
 *      R.reduceWhile(isOdd, R.add, 111, ys); //=> 111
 */
var reduceWhile =
/*#__PURE__*/
(0, _curryN2.default)(4, [], function _reduceWhile(pred, fn, a, list) {
  return (0, _reduce2.default)(function (acc, x) {
    return pred(acc, x) ? fn(acc, x) : (0, _reduced2.default)(acc);
  }, a, list);
});
var _default = reduceWhile;
exports.default = _default;
},{"./internal/_curryN.js":"node_modules/ramda/es/internal/_curryN.js","./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_reduced.js":"node_modules/ramda/es/internal/_reduced.js"}],"node_modules/ramda/es/reduced.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _reduced2 = _interopRequireDefault(require("./internal/_reduced.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a value wrapped to indicate that it is the final value of the reduce
 * and transduce functions. The returned value should be considered a black
 * box: the internal structure is not guaranteed to be stable.
 *
 * Note: this optimization is only available to the below functions:
 * - [`reduce`](#reduce)
 * - [`reduceWhile`](#reduceWhile)
 * - [`transduce`](#transduce)
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category List
 * @sig a -> *
 * @param {*} x The final value of the reduce.
 * @return {*} The wrapped value.
 * @see R.reduce, R.reduceWhile, R.transduce
 * @example
 *
 *     R.reduce(
 *       (acc, item) => item > 3 ? R.reduced(acc) : acc.concat(item),
 *       [],
 *       [1, 2, 3, 4, 5]) // [1, 2, 3]
 */
var reduced =
/*#__PURE__*/
(0, _curry.default)(_reduced2.default);
var _default = reduced;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_reduced.js":"node_modules/ramda/es/internal/_reduced.js"}],"node_modules/ramda/es/times.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Calls an input function `n` times, returning an array containing the results
 * of those function calls.
 *
 * `fn` is passed one argument: The current value of `n`, which begins at `0`
 * and is gradually incremented to `n - 1`.
 *
 * @func
 * @memberOf R
 * @since v0.2.3
 * @category List
 * @sig (Number -> a) -> Number -> [a]
 * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
 * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
 * @return {Array} An array containing the return values of all calls to `fn`.
 * @see R.repeat
 * @example
 *
 *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
 * @symb R.times(f, 0) = []
 * @symb R.times(f, 1) = [f(0)]
 * @symb R.times(f, 2) = [f(0), f(1)]
 */
var times =
/*#__PURE__*/
(0, _curry.default)(function times(fn, n) {
  var len = Number(n);
  var idx = 0;
  var list;

  if (len < 0 || isNaN(len)) {
    throw new RangeError('n must be a non-negative number');
  }

  list = new Array(len);

  while (idx < len) {
    list[idx] = fn(idx);
    idx += 1;
  }

  return list;
});
var _default = times;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/repeat.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _always = _interopRequireDefault(require("./always.js"));

var _times = _interopRequireDefault(require("./times.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a fixed list of size `n` containing a specified identical value.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig a -> n -> [a]
 * @param {*} value The value to repeat.
 * @param {Number} n The desired size of the output list.
 * @return {Array} A new array containing `n` `value`s.
 * @see R.times
 * @example
 *
 *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
 *
 *      const obj = {};
 *      const repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
 *      repeatedObjs[0] === repeatedObjs[1]; //=> true
 * @symb R.repeat(a, 0) = []
 * @symb R.repeat(a, 1) = [a]
 * @symb R.repeat(a, 2) = [a, a]
 */
var repeat =
/*#__PURE__*/
(0, _curry.default)(function repeat(value, n) {
  return (0, _times.default)((0, _always.default)(value), n);
});
var _default = repeat;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./always.js":"node_modules/ramda/es/always.js","./times.js":"node_modules/ramda/es/times.js"}],"node_modules/ramda/es/replace.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Replace a substring or regex match in a string with a replacement.
 *
 * The first two parameters correspond to the parameters of the
 * `String.prototype.replace()` function, so the second parameter can also be a
 * function.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category String
 * @sig RegExp|String -> String -> String -> String
 * @param {RegExp|String} pattern A regular expression or a substring to match.
 * @param {String} replacement The string to replace the matches with.
 * @param {String} str The String to do the search and replacement in.
 * @return {String} The result.
 * @example
 *
 *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *
 *      // Use the "g" (global) flag to replace all occurrences:
 *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
 */
var replace =
/*#__PURE__*/
(0, _curry.default)(function replace(regex, replacement, str) {
  return str.replace(regex, replacement);
});
var _default = replace;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/scan.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Scan is similar to [`reduce`](#reduce), but returns a list of successively
 * reduced values from the left
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> [a]
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {Array} A list of all intermediately reduced values.
 * @see R.reduce, R.mapAccum
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
 * @symb R.scan(f, a, [b, c]) = [a, f(a, b), f(f(a, b), c)]
 */
var scan =
/*#__PURE__*/
(0, _curry.default)(function scan(fn, acc, list) {
  var idx = 0;
  var len = list.length;
  var result = [acc];

  while (idx < len) {
    acc = fn(acc, list[idx]);
    result[idx + 1] = acc;
    idx += 1;
  }

  return result;
});
var _default = scan;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/sequence.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _ap = _interopRequireDefault(require("./ap.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _prepend = _interopRequireDefault(require("./prepend.js"));

var _reduceRight = _interopRequireDefault(require("./reduceRight.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
 * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
 * Applicative of Traversable.
 *
 * Dispatches to the `sequence` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (Applicative f, Traversable t) => (a -> f a) -> t (f a) -> f (t a)
 * @param {Function} of
 * @param {*} traversable
 * @return {*}
 * @see R.traverse
 * @example
 *
 *      R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
 *      R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
 *
 *      R.sequence(R.of, Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
 *      R.sequence(R.of, Nothing());       //=> [Nothing()]
 */
var sequence =
/*#__PURE__*/
(0, _curry.default)(function sequence(of, traversable) {
  return typeof traversable.sequence === 'function' ? traversable.sequence(of) : (0, _reduceRight.default)(function (x, acc) {
    return (0, _ap.default)((0, _map.default)(_prepend.default, x), acc);
  }, of([]), traversable);
});
var _default = sequence;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./ap.js":"node_modules/ramda/es/ap.js","./map.js":"node_modules/ramda/es/map.js","./prepend.js":"node_modules/ramda/es/prepend.js","./reduceRight.js":"node_modules/ramda/es/reduceRight.js"}],"node_modules/ramda/es/set.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _always = _interopRequireDefault(require("./always.js"));

var _over = _interopRequireDefault(require("./over.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the given value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> a -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
 *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
 */
var set =
/*#__PURE__*/
(0, _curry.default)(function set(lens, v, x) {
  return (0, _over.default)(lens, (0, _always.default)(v), x);
});
var _default = set;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./always.js":"node_modules/ramda/es/always.js","./over.js":"node_modules/ramda/es/over.js"}],"node_modules/ramda/es/sort.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a copy of the list, sorted according to the comparator function,
 * which should accept two values at a time and return a negative number if the
 * first value is smaller, a positive number if it's larger, and zero if they
 * are equal. Please note that this is a **copy** of the list. It does not
 * modify the original.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, a) -> Number) -> [a] -> [a]
 * @param {Function} comparator A sorting function :: a -> b -> Int
 * @param {Array} list The list to sort
 * @return {Array} a new array with its elements sorted by the comparator function.
 * @example
 *
 *      const diff = function(a, b) { return a - b; };
 *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
 */
var sort =
/*#__PURE__*/
(0, _curry.default)(function sort(comparator, list) {
  return Array.prototype.slice.call(list, 0).sort(comparator);
});
var _default = sort;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/sortBy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sorts the list according to the supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord b => (a -> b) -> [a] -> [a]
 * @param {Function} fn
 * @param {Array} list The list to sort.
 * @return {Array} A new list sorted by the keys generated by `fn`.
 * @example
 *
 *      const sortByFirstItem = R.sortBy(R.prop(0));
 *      const pairs = [[-1, 1], [-2, 2], [-3, 3]];
 *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
 *
 *      const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
 *      const alice = {
 *        name: 'ALICE',
 *        age: 101
 *      };
 *      const bob = {
 *        name: 'Bob',
 *        age: -10
 *      };
 *      const clara = {
 *        name: 'clara',
 *        age: 314.159
 *      };
 *      const people = [clara, bob, alice];
 *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
 */
var sortBy =
/*#__PURE__*/
(0, _curry.default)(function sortBy(fn, list) {
  return Array.prototype.slice.call(list, 0).sort(function (a, b) {
    var aa = fn(a);
    var bb = fn(b);
    return aa < bb ? -1 : aa > bb ? 1 : 0;
  });
});
var _default = sortBy;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/sortWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sorts a list according to a list of comparators.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Relation
 * @sig [(a, a) -> Number] -> [a] -> [a]
 * @param {Array} functions A list of comparator functions.
 * @param {Array} list The list to sort.
 * @return {Array} A new list sorted according to the comarator functions.
 * @example
 *
 *      const alice = {
 *        name: 'alice',
 *        age: 40
 *      };
 *      const bob = {
 *        name: 'bob',
 *        age: 30
 *      };
 *      const clara = {
 *        name: 'clara',
 *        age: 40
 *      };
 *      const people = [clara, bob, alice];
 *      const ageNameSort = R.sortWith([
 *        R.descend(R.prop('age')),
 *        R.ascend(R.prop('name'))
 *      ]);
 *      ageNameSort(people); //=> [alice, clara, bob]
 */
var sortWith =
/*#__PURE__*/
(0, _curry.default)(function sortWith(fns, list) {
  return Array.prototype.slice.call(list, 0).sort(function (a, b) {
    var result = 0;
    var i = 0;

    while (result === 0 && i < fns.length) {
      result = fns[i](a, b);
      i += 1;
    }

    return result;
  });
});
var _default = sortWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/split.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _invoker = _interopRequireDefault(require("./invoker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a string into an array of strings based on the given
 * separator.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category String
 * @sig (String | RegExp) -> String -> [String]
 * @param {String|RegExp} sep The pattern.
 * @param {String} str The string to separate into an array.
 * @return {Array} The array of strings from `str` separated by `str`.
 * @see R.join
 * @example
 *
 *      const pathComponents = R.split('/');
 *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
 *
 *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
 */
var split =
/*#__PURE__*/
(0, _invoker.default)(1, 'split');
var _default = split;
exports.default = _default;
},{"./invoker.js":"node_modules/ramda/es/invoker.js"}],"node_modules/ramda/es/splitAt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _length = _interopRequireDefault(require("./length.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a given list or string at a given index.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig Number -> [a] -> [[a], [a]]
 * @sig Number -> String -> [String, String]
 * @param {Number} index The index where the array/string is split.
 * @param {Array|String} array The array/string to be split.
 * @return {Array}
 * @example
 *
 *      R.splitAt(1, [1, 2, 3]);          //=> [[1], [2, 3]]
 *      R.splitAt(5, 'hello world');      //=> ['hello', ' world']
 *      R.splitAt(-1, 'foobar');          //=> ['fooba', 'r']
 */
var splitAt =
/*#__PURE__*/
(0, _curry.default)(function splitAt(index, array) {
  return [(0, _slice.default)(0, index, array), (0, _slice.default)(index, (0, _length.default)(array), array)];
});
var _default = splitAt;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./length.js":"node_modules/ramda/es/length.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/splitEvery.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a collection into slices of the specified length.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @sig Number -> String -> [String]
 * @param {Number} n
 * @param {Array} list
 * @return {Array}
 * @example
 *
 *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
 *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
 */
var splitEvery =
/*#__PURE__*/
(0, _curry.default)(function splitEvery(n, list) {
  if (n <= 0) {
    throw new Error('First argument to splitEvery must be a positive integer');
  }

  var result = [];
  var idx = 0;

  while (idx < list.length) {
    result.push((0, _slice.default)(idx, idx += n, list));
  }

  return result;
});
var _default = splitEvery;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/splitWhen.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a list and a predicate and returns a pair of lists with the following properties:
 *
 *  - the result of concatenating the two output lists is equivalent to the input list;
 *  - none of the elements of the first output list satisfies the predicate; and
 *  - if the second output list is non-empty, its first element satisfies the predicate.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [[a], [a]]
 * @param {Function} pred The predicate that determines where the array is split.
 * @param {Array} list The array to be split.
 * @return {Array}
 * @example
 *
 *      R.splitWhen(R.equals(2), [1, 2, 3, 1, 2, 3]);   //=> [[1], [2, 3, 1, 2, 3]]
 */
var splitWhen =
/*#__PURE__*/
(0, _curry.default)(function splitWhen(pred, list) {
  var idx = 0;
  var len = list.length;
  var prefix = [];

  while (idx < len && !pred(list[idx])) {
    prefix.push(list[idx]);
    idx += 1;
  }

  return [prefix, Array.prototype.slice.call(list, idx)];
});
var _default = splitWhen;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/startsWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

var _take = _interopRequireDefault(require("./take.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if a list starts with the provided sublist.
 *
 * Similarly, checks if a string starts with the provided substring.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category List
 * @sig [a] -> [a] -> Boolean
 * @sig String -> String -> Boolean
 * @param {*} prefix
 * @param {*} list
 * @return {Boolean}
 * @see R.endsWith
 * @example
 *
 *      R.startsWith('a', 'abc')                //=> true
 *      R.startsWith('b', 'abc')                //=> false
 *      R.startsWith(['a'], ['a', 'b', 'c'])    //=> true
 *      R.startsWith(['b'], ['a', 'b', 'c'])    //=> false
 */
var startsWith =
/*#__PURE__*/
(0, _curry.default)(function (prefix, list) {
  return (0, _equals.default)((0, _take.default)(prefix.length, list), prefix);
});
var _default = startsWith;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./equals.js":"node_modules/ramda/es/equals.js","./take.js":"node_modules/ramda/es/take.js"}],"node_modules/ramda/es/subtract.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Subtracts its second argument from its first argument.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a - b`.
 * @see R.add
 * @example
 *
 *      R.subtract(10, 8); //=> 2
 *
 *      const minus5 = R.subtract(R.__, 5);
 *      minus5(17); //=> 12
 *
 *      const complementaryAngle = R.subtract(90);
 *      complementaryAngle(30); //=> 60
 *      complementaryAngle(72); //=> 18
 */
var subtract =
/*#__PURE__*/
(0, _curry.default)(function subtract(a, b) {
  return Number(a) - Number(b);
});
var _default = subtract;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/symmetricDifference.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _concat = _interopRequireDefault(require("./concat.js"));

var _difference = _interopRequireDefault(require("./difference.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds the set (i.e. no duplicates) of all elements contained in the first or
 * second list, but not both.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` or `list2`, but not both.
 * @see R.symmetricDifferenceWith, R.difference, R.differenceWith
 * @example
 *
 *      R.symmetricDifference([1,2,3,4], [7,6,5,4,3]); //=> [1,2,7,6,5]
 *      R.symmetricDifference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5,1,2]
 */
var symmetricDifference =
/*#__PURE__*/
(0, _curry.default)(function symmetricDifference(list1, list2) {
  return (0, _concat.default)((0, _difference.default)(list1, list2), (0, _difference.default)(list2, list1));
});
var _default = symmetricDifference;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./concat.js":"node_modules/ramda/es/concat.js","./difference.js":"node_modules/ramda/es/difference.js"}],"node_modules/ramda/es/symmetricDifferenceWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _concat = _interopRequireDefault(require("./concat.js"));

var _differenceWith = _interopRequireDefault(require("./differenceWith.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds the set (i.e. no duplicates) of all elements contained in the first or
 * second list, but not both. Duplication is determined according to the value
 * returned by applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` or `list2`, but not both.
 * @see R.symmetricDifference, R.difference, R.differenceWith
 * @example
 *
 *      const eqA = R.eqBy(R.prop('a'));
 *      const l1 = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];
 *      const l2 = [{a: 3}, {a: 4}, {a: 5}, {a: 6}];
 *      R.symmetricDifferenceWith(eqA, l1, l2); //=> [{a: 1}, {a: 2}, {a: 5}, {a: 6}]
 */
var symmetricDifferenceWith =
/*#__PURE__*/
(0, _curry.default)(function symmetricDifferenceWith(pred, list1, list2) {
  return (0, _concat.default)((0, _differenceWith.default)(pred, list1, list2), (0, _differenceWith.default)(pred, list2, list1));
});
var _default = symmetricDifferenceWith;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./concat.js":"node_modules/ramda/es/concat.js","./differenceWith.js":"node_modules/ramda/es/differenceWith.js"}],"node_modules/ramda/es/takeLastWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing the last `n` elements of a given list, passing
 * each value to the supplied predicate function, and terminating when the
 * predicate function returns `false`. Excludes the element that caused the
 * predicate function to fail. The predicate function is passed one argument:
 * *(value)*.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.dropLastWhile, R.addIndex
 * @example
 *
 *      const isNotOne = x => x !== 1;
 *
 *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
 *
 *      R.takeLastWhile(x => x !== 'R' , 'Ramda'); //=> 'amda'
 */
var takeLastWhile =
/*#__PURE__*/
(0, _curry.default)(function takeLastWhile(fn, xs) {
  var idx = xs.length - 1;

  while (idx >= 0 && fn(xs[idx])) {
    idx -= 1;
  }

  return (0, _slice.default)(idx + 1, Infinity, xs);
});
var _default = takeLastWhile;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/internal/_xtakeWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _reduced2 = _interopRequireDefault(require("./_reduced.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XTakeWhile =
/*#__PURE__*/
function () {
  function XTakeWhile(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XTakeWhile.prototype['@@transducer/init'] = _xfBase2.default.init;
  XTakeWhile.prototype['@@transducer/result'] = _xfBase2.default.result;

  XTakeWhile.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : (0, _reduced2.default)(result);
  };

  return XTakeWhile;
}();

var _xtakeWhile =
/*#__PURE__*/
(0, _curry.default)(function _xtakeWhile(f, xf) {
  return new XTakeWhile(f, xf);
});

var _default = _xtakeWhile;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_reduced.js":"node_modules/ramda/es/internal/_reduced.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/takeWhile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xtakeWhile2 = _interopRequireDefault(require("./internal/_xtakeWhile.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing the first `n` elements of a given list,
 * passing each value to the supplied predicate function, and terminating when
 * the predicate function returns `false`. Excludes the element that caused the
 * predicate function to fail. The predicate function is passed one argument:
 * *(value)*.
 *
 * Dispatches to the `takeWhile` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.dropWhile, R.transduce, R.addIndex
 * @example
 *
 *      const isNotFour = x => x !== 4;
 *
 *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
 *
 *      R.takeWhile(x => x !== 'd' , 'Ramda'); //=> 'Ram'
 */
var takeWhile =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)(['takeWhile'], _xtakeWhile2.default, function takeWhile(fn, xs) {
  var idx = 0;
  var len = xs.length;

  while (idx < len && fn(xs[idx])) {
    idx += 1;
  }

  return (0, _slice.default)(0, idx, xs);
}));
var _default = takeWhile;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xtakeWhile.js":"node_modules/ramda/es/internal/_xtakeWhile.js","./slice.js":"node_modules/ramda/es/slice.js"}],"node_modules/ramda/es/internal/_xtap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./_curry2.js"));

var _xfBase2 = _interopRequireDefault(require("./_xfBase.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XTap =
/*#__PURE__*/
function () {
  function XTap(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XTap.prototype['@@transducer/init'] = _xfBase2.default.init;
  XTap.prototype['@@transducer/result'] = _xfBase2.default.result;

  XTap.prototype['@@transducer/step'] = function (result, input) {
    this.f(input);
    return this.xf['@@transducer/step'](result, input);
  };

  return XTap;
}();

var _xtap =
/*#__PURE__*/
(0, _curry.default)(function _xtap(f, xf) {
  return new XTap(f, xf);
});

var _default = _xtap;
exports.default = _default;
},{"./_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./_xfBase.js":"node_modules/ramda/es/internal/_xfBase.js"}],"node_modules/ramda/es/tap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _dispatchable2 = _interopRequireDefault(require("./internal/_dispatchable.js"));

var _xtap2 = _interopRequireDefault(require("./internal/_xtap.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Runs the given function with the supplied object, then returns the object.
 *
 * Acts as a transducer if a transformer is given as second parameter.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (a -> *) -> a -> a
 * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
 * @param {*} x
 * @return {*} `x`.
 * @example
 *
 *      const sayX = x => console.log('x is ' + x);
 *      R.tap(sayX, 100); //=> 100
 *      // logs 'x is 100'
 * @symb R.tap(f, a) = a
 */
var tap =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _dispatchable2.default)([], _xtap2.default, function tap(fn, x) {
  fn(x);
  return x;
}));
var _default = tap;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_dispatchable.js":"node_modules/ramda/es/internal/_dispatchable.js","./internal/_xtap.js":"node_modules/ramda/es/internal/_xtap.js"}],"node_modules/ramda/es/internal/_isRegExp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _isRegExp;

function _isRegExp(x) {
  return Object.prototype.toString.call(x) === '[object RegExp]';
}
},{}],"node_modules/ramda/es/test.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cloneRegExp2 = _interopRequireDefault(require("./internal/_cloneRegExp.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _isRegExp2 = _interopRequireDefault(require("./internal/_isRegExp.js"));

var _toString = _interopRequireDefault(require("./toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Determines whether a given string matches a given regular expression.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category String
 * @sig RegExp -> String -> Boolean
 * @param {RegExp} pattern
 * @param {String} str
 * @return {Boolean}
 * @see R.match
 * @example
 *
 *      R.test(/^x/, 'xyz'); //=> true
 *      R.test(/^y/, 'xyz'); //=> false
 */
var test =
/*#__PURE__*/
(0, _curry.default)(function test(pattern, str) {
  if (!(0, _isRegExp2.default)(pattern)) {
    throw new TypeError('‘test’ requires a value of type RegExp as its first argument; received ' + (0, _toString.default)(pattern));
  }

  return (0, _cloneRegExp2.default)(pattern).test(str);
});
var _default = test;
exports.default = _default;
},{"./internal/_cloneRegExp.js":"node_modules/ramda/es/internal/_cloneRegExp.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_isRegExp.js":"node_modules/ramda/es/internal/_isRegExp.js","./toString.js":"node_modules/ramda/es/toString.js"}],"node_modules/ramda/es/then.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _assertPromise2 = _interopRequireDefault(require("./internal/_assertPromise.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the result of applying the onSuccess function to the value inside
 * a successfully resolved promise. This is useful for working with promises
 * inside function compositions.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig (a -> b) -> (Promise e a) -> (Promise e b)
 * @sig (a -> (Promise e b)) -> (Promise e a) -> (Promise e b)
 * @param {Function} onSuccess The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @return {Promise} The result of calling `p.then(onSuccess)`
 * @see R.otherwise
 * @example
 *
 *      var makeQuery = (email) => ({ query: { email }});
 *
 *      //getMemberName :: String -> Promise ({firstName, lastName})
 *      var getMemberName = R.pipe(
 *        makeQuery,
 *        fetchMember,
 *        R.then(R.pick(['firstName', 'lastName']))
 *      );
 */
var then =
/*#__PURE__*/
(0, _curry.default)(function then(f, p) {
  (0, _assertPromise2.default)('then', p);
  return p.then(f);
});
var _default = then;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_assertPromise.js":"node_modules/ramda/es/internal/_assertPromise.js"}],"node_modules/ramda/es/toLower.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _invoker = _interopRequireDefault(require("./invoker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The lower case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to lower case.
 * @return {String} The lower case version of `str`.
 * @see R.toUpper
 * @example
 *
 *      R.toLower('XYZ'); //=> 'xyz'
 */
var toLower =
/*#__PURE__*/
(0, _invoker.default)(0, 'toLowerCase');
var _default = toLower;
exports.default = _default;
},{"./invoker.js":"node_modules/ramda/es/invoker.js"}],"node_modules/ramda/es/toPairs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Converts an object into an array of key, value arrays. Only the object's
 * own properties are used.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Object
 * @sig {String: *} -> [[String,*]]
 * @param {Object} obj The object to extract from
 * @return {Array} An array of key, value arrays from the object's own properties.
 * @see R.fromPairs
 * @example
 *
 *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
 */
var toPairs =
/*#__PURE__*/
(0, _curry.default)(function toPairs(obj) {
  var pairs = [];

  for (var prop in obj) {
    if ((0, _has2.default)(prop, obj)) {
      pairs[pairs.length] = [prop, obj[prop]];
    }
  }

  return pairs;
});
var _default = toPairs;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/toPairsIn.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Converts an object into an array of key, value arrays. The object's own
 * properties and prototype properties are used. Note that the order of the
 * output array is not guaranteed to be consistent across different JS
 * platforms.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Object
 * @sig {String: *} -> [[String,*]]
 * @param {Object} obj The object to extract from
 * @return {Array} An array of key, value arrays from the object's own
 *         and prototype properties.
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
 */
var toPairsIn =
/*#__PURE__*/
(0, _curry.default)(function toPairsIn(obj) {
  var pairs = [];

  for (var prop in obj) {
    pairs[pairs.length] = [prop, obj[prop]];
  }

  return pairs;
});
var _default = toPairsIn;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/toUpper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _invoker = _interopRequireDefault(require("./invoker.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The upper case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to upper case.
 * @return {String} The upper case version of `str`.
 * @see R.toLower
 * @example
 *
 *      R.toUpper('abc'); //=> 'ABC'
 */
var toUpper =
/*#__PURE__*/
(0, _invoker.default)(0, 'toUpperCase');
var _default = toUpper;
exports.default = _default;
},{"./invoker.js":"node_modules/ramda/es/invoker.js"}],"node_modules/ramda/es/transduce.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reduce2 = _interopRequireDefault(require("./internal/_reduce.js"));

var _xwrap2 = _interopRequireDefault(require("./internal/_xwrap.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initializes a transducer using supplied iterator function. Returns a single
 * item by iterating through the list, successively calling the transformed
 * iterator function and passing it an accumulator value and the current value
 * from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It will be
 * wrapped as a transformer to initialize the transducer. A transformer can be
 * passed directly in place of an iterator function. In both cases, iteration
 * may be stopped early with the [`R.reduced`](#reduced) function.
 *
 * A transducer is a function that accepts a transformer and returns a
 * transformer and can be composed directly.
 *
 * A transformer is an an object that provides a 2-arity reducing iterator
 * function, step, 0-arity initial value function, init, and 1-arity result
 * extraction function, result. The step function is used as the iterator
 * function in reduce. The result function is used to convert the final
 * accumulator into the return type and in most cases is
 * [`R.identity`](#identity). The init function can be used to provide an
 * initial accumulator, but is ignored by transduce.
 *
 * The iteration is performed with [`R.reduce`](#reduce) after initializing the transducer.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig (c -> c) -> ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array. Wrapped as transformer, if necessary, and used to
 *        initialize the transducer
 * @param {*} acc The initial accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.reduced, R.into
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
 *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
 *
 *      const isOdd = (x) => x % 2 === 1;
 *      const firstOddTransducer = R.compose(R.filter(isOdd), R.take(1));
 *      R.transduce(firstOddTransducer, R.flip(R.append), [], R.range(0, 100)); //=> [1]
 */
var transduce =
/*#__PURE__*/
(0, _curryN.default)(4, function transduce(xf, fn, acc, list) {
  return (0, _reduce2.default)(xf(typeof fn === 'function' ? (0, _xwrap2.default)(fn) : fn), acc, list);
});
var _default = transduce;
exports.default = _default;
},{"./internal/_reduce.js":"node_modules/ramda/es/internal/_reduce.js","./internal/_xwrap.js":"node_modules/ramda/es/internal/_xwrap.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/transpose.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transposes the rows and columns of a 2D list.
 * When passed a list of `n` lists of length `x`,
 * returns a list of `x` lists of length `n`.
 *
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig [[a]] -> [[a]]
 * @param {Array} list A 2D list
 * @return {Array} A 2D list
 * @example
 *
 *      R.transpose([[1, 'a'], [2, 'b'], [3, 'c']]) //=> [[1, 2, 3], ['a', 'b', 'c']]
 *      R.transpose([[1, 2, 3], ['a', 'b', 'c']]) //=> [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 *      // If some of the rows are shorter than the following rows, their elements are skipped:
 *      R.transpose([[10, 11], [20], [], [30, 31, 32]]) //=> [[10, 20, 30], [11, 31], [32]]
 * @symb R.transpose([[a], [b], [c]]) = [a, b, c]
 * @symb R.transpose([[a, b], [c, d]]) = [[a, c], [b, d]]
 * @symb R.transpose([[a, b], [c]]) = [[a, c], [b]]
 */
var transpose =
/*#__PURE__*/
(0, _curry.default)(function transpose(outerlist) {
  var i = 0;
  var result = [];

  while (i < outerlist.length) {
    var innerlist = outerlist[i];
    var j = 0;

    while (j < innerlist.length) {
      if (typeof result[j] === 'undefined') {
        result[j] = [];
      }

      result[j].push(innerlist[j]);
      j += 1;
    }

    i += 1;
  }

  return result;
});
var _default = transpose;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/traverse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _sequence = _interopRequireDefault(require("./sequence.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
 * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
 * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
 * into an Applicative of Traversable.
 *
 * Dispatches to the `traverse` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (Applicative f, Traversable t) => (a -> f a) -> (a -> f b) -> t a -> f (t b)
 * @param {Function} of
 * @param {Function} f
 * @param {*} traversable
 * @return {*}
 * @see R.sequence
 * @example
 *
 *      // Returns `Maybe.Nothing` if the given divisor is `0`
 *      const safeDiv = n => d => d === 0 ? Maybe.Nothing() : Maybe.Just(n / d)
 *
 *      R.traverse(Maybe.of, safeDiv(10), [2, 4, 5]); //=> Maybe.Just([5, 2.5, 2])
 *      R.traverse(Maybe.of, safeDiv(10), [2, 0, 5]); //=> Maybe.Nothing
 */
var traverse =
/*#__PURE__*/
(0, _curry.default)(function traverse(of, f, traversable) {
  return typeof traversable['fantasy-land/traverse'] === 'function' ? traversable['fantasy-land/traverse'](f, of) : (0, _sequence.default)(of, (0, _map.default)(f, traversable));
});
var _default = traverse;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./map.js":"node_modules/ramda/es/map.js","./sequence.js":"node_modules/ramda/es/sequence.js"}],"node_modules/ramda/es/trim.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
var zeroWidth = '\u200b';
var hasProtoTrim = typeof String.prototype.trim === 'function';
/**
 * Removes (strips) whitespace from both ends of the string.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to trim.
 * @return {String} Trimmed version of `str`.
 * @example
 *
 *      R.trim('   xyz  '); //=> 'xyz'
 *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
 */

var trim = !hasProtoTrim ||
/*#__PURE__*/
ws.trim() || !
/*#__PURE__*/
zeroWidth.trim() ?
/*#__PURE__*/
(0, _curry.default)(function trim(str) {
  var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
  var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
  return str.replace(beginRx, '').replace(endRx, '');
}) :
/*#__PURE__*/
(0, _curry.default)(function trim(str) {
  return str.trim();
});
var _default = trim;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/tryCatch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _arity2 = _interopRequireDefault(require("./internal/_arity.js"));

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
 * function evaluates the `tryer`; if it does not throw, it simply returns the
 * result. If the `tryer` *does* throw, the returned function evaluates the
 * `catcher` function and returns its result. Note that for effective
 * composition with this function, both the `tryer` and `catcher` functions
 * must return the same type of results.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Function
 * @sig (...x -> a) -> ((e, ...x) -> a) -> (...x -> a)
 * @param {Function} tryer The function that may throw.
 * @param {Function} catcher The function that will be evaluated if `tryer` throws.
 * @return {Function} A new function that will catch exceptions and send then to the catcher.
 * @example
 *
 *      R.tryCatch(R.prop('x'), R.F)({x: true}); //=> true
 *      R.tryCatch(() => { throw 'foo'}, R.always('catched'))('bar') // => 'catched'
 *      R.tryCatch(R.times(R.identity), R.always([]))('s') // => []
 `` */
var tryCatch =
/*#__PURE__*/
(0, _curry.default)(function _tryCatch(tryer, catcher) {
  return (0, _arity2.default)(tryer.length, function () {
    try {
      return tryer.apply(this, arguments);
    } catch (e) {
      return catcher.apply(this, (0, _concat2.default)([e], arguments));
    }
  });
});
var _default = tryCatch;
exports.default = _default;
},{"./internal/_arity.js":"node_modules/ramda/es/internal/_arity.js","./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/unapply.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a function `fn`, which takes a single array argument, and returns a
 * function which:
 *
 *   - takes any number of positional arguments;
 *   - passes these arguments to `fn` as an array; and
 *   - returns the result.
 *
 * In other words, `R.unapply` derives a variadic function from a function which
 * takes an array. `R.unapply` is the inverse of [`R.apply`](#apply).
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Function
 * @sig ([*...] -> a) -> (*... -> a)
 * @param {Function} fn
 * @return {Function}
 * @see R.apply
 * @example
 *
 *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
 * @symb R.unapply(f)(a, b) = f([a, b])
 */
var unapply =
/*#__PURE__*/
(0, _curry.default)(function unapply(fn) {
  return function () {
    return fn(Array.prototype.slice.call(arguments, 0));
  };
});
var _default = unapply;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/unary.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

var _nAry = _interopRequireDefault(require("./nAry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 1 parameter. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Function
 * @sig (* -> b) -> (a -> b)
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity 1.
 * @see R.binary, R.nAry
 * @example
 *
 *      const takesTwoArgs = function(a, b) {
 *        return [a, b];
 *      };
 *      takesTwoArgs.length; //=> 2
 *      takesTwoArgs(1, 2); //=> [1, 2]
 *
 *      const takesOneArg = R.unary(takesTwoArgs);
 *      takesOneArg.length; //=> 1
 *      // Only 1 argument is passed to the wrapped function
 *      takesOneArg(1, 2); //=> [1, undefined]
 * @symb R.unary(f)(a, b, c) = f(a)
 */
var unary =
/*#__PURE__*/
(0, _curry.default)(function unary(fn) {
  return (0, _nAry.default)(1, fn);
});
var _default = unary;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js","./nAry.js":"node_modules/ramda/es/nAry.js"}],"node_modules/ramda/es/uncurryN.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function of arity `n` from a (manually) curried function.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Function
 * @sig Number -> (a -> b) -> (a -> c)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to uncurry.
 * @return {Function} A new function.
 * @see R.curry
 * @example
 *
 *      const addFour = a => b => c => d => a + b + c + d;
 *
 *      const uncurriedAddFour = R.uncurryN(4, addFour);
 *      uncurriedAddFour(1, 2, 3, 4); //=> 10
 */
var uncurryN =
/*#__PURE__*/
(0, _curry.default)(function uncurryN(depth, fn) {
  return (0, _curryN.default)(depth, function () {
    var currentDepth = 1;
    var value = fn;
    var idx = 0;
    var endIdx;

    while (currentDepth <= depth && typeof value === 'function') {
      endIdx = currentDepth === depth ? arguments.length : idx + value.length;
      value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
      currentDepth += 1;
      idx = endIdx;
    }

    return value;
  });
});
var _default = uncurryN;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./curryN.js":"node_modules/ramda/es/curryN.js"}],"node_modules/ramda/es/unfold.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Builds a list from a seed value. Accepts an iterator function, which returns
 * either false to stop iteration or an array of length 2 containing the value
 * to add to the resulting list and the seed to be used in the next call to the
 * iterator function.
 *
 * The iterator function receives one argument: *(seed)*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig (a -> [b]) -> * -> [b]
 * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
 *        either false to quit iteration or an array of length two to proceed. The element
 *        at index 0 of this array will be added to the resulting array, and the element
 *        at index 1 will be passed to the next call to `fn`.
 * @param {*} seed The seed value.
 * @return {Array} The final list.
 * @example
 *
 *      const f = n => n > 50 ? false : [-n, n + 10];
 *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
 * @symb R.unfold(f, x) = [f(x)[0], f(f(x)[1])[0], f(f(f(x)[1])[1])[0], ...]
 */
var unfold =
/*#__PURE__*/
(0, _curry.default)(function unfold(fn, seed) {
  var pair = fn(seed);
  var result = [];

  while (pair && pair.length) {
    result[result.length] = pair[0];
    pair = fn(pair[1]);
  }

  return result;
});
var _default = unfold;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/union.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _compose = _interopRequireDefault(require("./compose.js"));

var _uniq = _interopRequireDefault(require("./uniq.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Combines two lists into a set (i.e. no duplicates) composed of the elements
 * of each list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} as The first list.
 * @param {Array} bs The second list.
 * @return {Array} The first and second lists concatenated, with
 *         duplicates removed.
 * @example
 *
 *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
 */
var union =
/*#__PURE__*/
(0, _curry.default)(
/*#__PURE__*/
(0, _compose.default)(_uniq.default, _concat2.default));
var _default = union;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./compose.js":"node_modules/ramda/es/compose.js","./uniq.js":"node_modules/ramda/es/uniq.js"}],"node_modules/ramda/es/uniqWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includesWith2 = _interopRequireDefault(require("./internal/_includesWith.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied predicate to
 * two list elements. Prefers the first item if two items compare equal based
 * on the predicate.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category List
 * @sig ((a, a) -> Boolean) -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      const strEq = R.eqBy(String);
 *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
 *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
 *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
 *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
 */
var uniqWith =
/*#__PURE__*/
(0, _curry.default)(function uniqWith(pred, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  var item;

  while (idx < len) {
    item = list[idx];

    if (!(0, _includesWith2.default)(pred, item, result)) {
      result[result.length] = item;
    }

    idx += 1;
  }

  return result;
});
var _default = uniqWith;
exports.default = _default;
},{"./internal/_includesWith.js":"node_modules/ramda/es/internal/_includesWith.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/unionWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _concat2 = _interopRequireDefault(require("./internal/_concat.js"));

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

var _uniqWith = _interopRequireDefault(require("./uniqWith.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Combines two lists into a set (i.e. no duplicates) composed of the elements
 * of each list. Duplication is determined according to the value returned by
 * applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [*] -> [*] -> [*]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The first and second lists concatenated, with
 *         duplicates removed.
 * @see R.union
 * @example
 *
 *      const l1 = [{a: 1}, {a: 2}];
 *      const l2 = [{a: 1}, {a: 4}];
 *      R.unionWith(R.eqBy(R.prop('a')), l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
 */
var unionWith =
/*#__PURE__*/
(0, _curry.default)(function unionWith(pred, list1, list2) {
  return (0, _uniqWith.default)(pred, (0, _concat2.default)(list1, list2));
});
var _default = unionWith;
exports.default = _default;
},{"./internal/_concat.js":"node_modules/ramda/es/internal/_concat.js","./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js","./uniqWith.js":"node_modules/ramda/es/uniqWith.js"}],"node_modules/ramda/es/unless.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Tests the final argument by passing it to the given predicate function. If
 * the predicate is not satisfied, the function will return the result of
 * calling the `whenFalseFn` function with the same argument. If the predicate
 * is satisfied, the argument is returned as is.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred        A predicate function
 * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
 *                               to a falsy value.
 * @param {*}        x           An object to test with the `pred` function and
 *                               pass to `whenFalseFn` if necessary.
 * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
 * @see R.ifElse, R.when, R.cond
 * @example
 *
 *      let safeInc = R.unless(R.isNil, R.inc);
 *      safeInc(null); //=> null
 *      safeInc(1); //=> 2
 */
var unless =
/*#__PURE__*/
(0, _curry.default)(function unless(pred, whenFalseFn, x) {
  return pred(x) ? x : whenFalseFn(x);
});
var _default = unless;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/unnest.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _identity2 = _interopRequireDefault(require("./internal/_identity.js"));

var _chain = _interopRequireDefault(require("./chain.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
 * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain c => c (c a) -> c a
 * @param {*} list
 * @return {*}
 * @see R.flatten, R.chain
 * @example
 *
 *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
 *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
 */
var unnest =
/*#__PURE__*/
(0, _chain.default)(_identity2.default);
var _default = unnest;
exports.default = _default;
},{"./internal/_identity.js":"node_modules/ramda/es/internal/_identity.js","./chain.js":"node_modules/ramda/es/chain.js"}],"node_modules/ramda/es/until.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a predicate, a transformation function, and an initial value,
 * and returns a value of the same type as the initial value.
 * It does so by applying the transformation until the predicate is satisfied,
 * at which point it returns the satisfactory value.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred A predicate function
 * @param {Function} fn The iterator function
 * @param {*} init Initial value
 * @return {*} Final value that satisfies predicate
 * @example
 *
 *      R.until(R.gt(R.__, 100), R.multiply(2))(1) // => 128
 */
var until =
/*#__PURE__*/
(0, _curry.default)(function until(pred, fn, init) {
  var val = init;

  while (!pred(val)) {
    val = fn(val);
  }

  return val;
});
var _default = until;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/valuesIn.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a list of all the properties, including prototype properties, of the
 * supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own and prototype properties.
 * @see R.values, R.keysIn
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.valuesIn(f); //=> ['X', 'Y']
 */
var valuesIn =
/*#__PURE__*/
(0, _curry.default)(function valuesIn(obj) {
  var prop;
  var vs = [];

  for (prop in obj) {
    vs[vs.length] = obj[prop];
  }

  return vs;
});
var _default = valuesIn;
exports.default = _default;
},{"./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/view.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// `Const` is a functor that effectively ignores the function given to `map`.
var Const = function (x) {
  return {
    value: x,
    'fantasy-land/map': function () {
      return this;
    }
  };
};
/**
 * Returns a "view" of the given data structure, determined by the given lens.
 * The lens's focus determines which portion of the data structure is visible.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> s -> a
 * @param {Lens} lens
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.view(xLens, {x: 1, y: 2});  //=> 1
 *      R.view(xLens, {x: 4, y: 2});  //=> 4
 */


var view =
/*#__PURE__*/
(0, _curry.default)(function view(lens, x) {
  // Using `Const` effectively ignores the setter function of the `lens`,
  // leaving the value returned by the getter function unmodified.
  return lens(Const)(x).value;
});
var _default = view;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/when.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Tests the final argument by passing it to the given predicate function. If
 * the predicate is satisfied, the function will return the result of calling
 * the `whenTrueFn` function with the same argument. If the predicate is not
 * satisfied, the argument is returned as is.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred       A predicate function
 * @param {Function} whenTrueFn A function to invoke when the `condition`
 *                              evaluates to a truthy value.
 * @param {*}        x          An object to test with the `pred` function and
 *                              pass to `whenTrueFn` if necessary.
 * @return {*} Either `x` or the result of applying `x` to `whenTrueFn`.
 * @see R.ifElse, R.unless, R.cond
 * @example
 *
 *      // truncate :: String -> String
 *      const truncate = R.when(
 *        R.propSatisfies(R.gt(R.__, 10), 'length'),
 *        R.pipe(R.take(10), R.append('…'), R.join(''))
 *      );
 *      truncate('12345');         //=> '12345'
 *      truncate('0123456789ABC'); //=> '0123456789…'
 */
var when =
/*#__PURE__*/
(0, _curry.default)(function when(pred, whenTrueFn, x) {
  return pred(x) ? whenTrueFn(x) : x;
});
var _default = when;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/where.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _has2 = _interopRequireDefault(require("./internal/_has.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a spec object and a test object; returns true if the test satisfies
 * the spec. Each of the spec's own properties must be a predicate function.
 * Each predicate is applied to the value of the corresponding property of the
 * test object. `where` returns true if all the predicates return true, false
 * otherwise.
 *
 * `where` is well suited to declaratively expressing constraints for other
 * functions such as [`filter`](#filter) and [`find`](#find).
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category Object
 * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
 * @param {Object} spec
 * @param {Object} testObj
 * @return {Boolean}
 * @see R.propSatisfies, R.whereEq
 * @example
 *
 *      // pred :: Object -> Boolean
 *      const pred = R.where({
 *        a: R.equals('foo'),
 *        b: R.complement(R.equals('bar')),
 *        x: R.gt(R.__, 10),
 *        y: R.lt(R.__, 20)
 *      });
 *
 *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
 *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
 *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
 *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
 *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
 */
var where =
/*#__PURE__*/
(0, _curry.default)(function where(spec, testObj) {
  for (var prop in spec) {
    if ((0, _has2.default)(prop, spec) && !spec[prop](testObj[prop])) {
      return false;
    }
  }

  return true;
});
var _default = where;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./internal/_has.js":"node_modules/ramda/es/internal/_has.js"}],"node_modules/ramda/es/whereEq.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _where = _interopRequireDefault(require("./where.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a spec object and a test object; returns true if the test satisfies
 * the spec, false otherwise. An object satisfies the spec if, for each of the
 * spec's own properties, accessing that property of the object gives the same
 * value (in [`R.equals`](#equals) terms) as accessing that property of the
 * spec.
 *
 * `whereEq` is a specialization of [`where`](#where).
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @sig {String: *} -> {String: *} -> Boolean
 * @param {Object} spec
 * @param {Object} testObj
 * @return {Boolean}
 * @see R.propEq, R.where
 * @example
 *
 *      // pred :: Object -> Boolean
 *      const pred = R.whereEq({a: 1, b: 2});
 *
 *      pred({a: 1});              //=> false
 *      pred({a: 1, b: 2});        //=> true
 *      pred({a: 1, b: 2, c: 3});  //=> true
 *      pred({a: 1, b: 1});        //=> false
 */
var whereEq =
/*#__PURE__*/
(0, _curry.default)(function whereEq(spec, testObj) {
  return (0, _where.default)((0, _map.default)(_equals.default, spec), testObj);
});
var _default = whereEq;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./equals.js":"node_modules/ramda/es/equals.js","./map.js":"node_modules/ramda/es/map.js","./where.js":"node_modules/ramda/es/where.js"}],"node_modules/ramda/es/without.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes2 = _interopRequireDefault(require("./internal/_includes.js"));

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

var _flip = _interopRequireDefault(require("./flip.js"));

var _reject = _interopRequireDefault(require("./reject.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a new list without values in the first argument.
 * [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig [a] -> [a] -> [a]
 * @param {Array} list1 The values to be removed from `list2`.
 * @param {Array} list2 The array to remove values from.
 * @return {Array} The new array without values in `list1`.
 * @see R.transduce, R.difference, R.remove
 * @example
 *
 *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
 */
var without =
/*#__PURE__*/
(0, _curry.default)(function (xs, list) {
  return (0, _reject.default)((0, _flip.default)(_includes2.default)(xs), list);
});
var _default = without;
exports.default = _default;
},{"./internal/_includes.js":"node_modules/ramda/es/internal/_includes.js","./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js","./flip.js":"node_modules/ramda/es/flip.js","./reject.js":"node_modules/ramda/es/reject.js"}],"node_modules/ramda/es/xprod.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new list out of the two supplied by creating each possible pair
 * from the lists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b] -> [[a,b]]
 * @param {Array} as The first list.
 * @param {Array} bs The second list.
 * @return {Array} The list made by combining each possible pair from
 *         `as` and `bs` into pairs (`[a, b]`).
 * @example
 *
 *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * @symb R.xprod([a, b], [c, d]) = [[a, c], [a, d], [b, c], [b, d]]
 */
var xprod =
/*#__PURE__*/
(0, _curry.default)(function xprod(a, b) {
  // = xprodWith(prepend); (takes about 3 times as long...)
  var idx = 0;
  var ilen = a.length;
  var j;
  var jlen = b.length;
  var result = [];

  while (idx < ilen) {
    j = 0;

    while (j < jlen) {
      result[result.length] = [a[idx], b[j]];
      j += 1;
    }

    idx += 1;
  }

  return result;
});
var _default = xprod;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/zip.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new list out of the two supplied by pairing up equally-positioned
 * items from both lists. The returned list is truncated to the length of the
 * shorter of the two input lists.
 * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b] -> [[a,b]]
 * @param {Array} list1 The first array to consider.
 * @param {Array} list2 The second array to consider.
 * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
 * @example
 *
 *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
 * @symb R.zip([a, b, c], [d, e, f]) = [[a, d], [b, e], [c, f]]
 */
var zip =
/*#__PURE__*/
(0, _curry.default)(function zip(a, b) {
  var rv = [];
  var idx = 0;
  var len = Math.min(a.length, b.length);

  while (idx < len) {
    rv[idx] = [a[idx], b[idx]];
    idx += 1;
  }

  return rv;
});
var _default = zip;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/zipObj.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new object out of a list of keys and a list of values.
 * Key/value pairing is truncated to the length of the shorter of the two lists.
 * Note: `zipObj` is equivalent to `pipe(zip, fromPairs)`.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [String] -> [*] -> {String: *}
 * @param {Array} keys The array that will be properties on the output object.
 * @param {Array} values The list of values on the output object.
 * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
 * @example
 *
 *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
 */
var zipObj =
/*#__PURE__*/
(0, _curry.default)(function zipObj(keys, values) {
  var idx = 0;
  var len = Math.min(keys.length, values.length);
  var out = {};

  while (idx < len) {
    out[keys[idx]] = values[idx];
    idx += 1;
  }

  return out;
});
var _default = zipObj;
exports.default = _default;
},{"./internal/_curry2.js":"node_modules/ramda/es/internal/_curry2.js"}],"node_modules/ramda/es/zipWith.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curry = _interopRequireDefault(require("./internal/_curry3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new list out of the two supplied by applying the function to each
 * equally-positioned pair in the lists. The returned list is truncated to the
 * length of the shorter of the two input lists.
 *
 * @function
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> c) -> [a] -> [b] -> [c]
 * @param {Function} fn The function used to combine the two elements into one value.
 * @param {Array} list1 The first array to consider.
 * @param {Array} list2 The second array to consider.
 * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
 *         using `fn`.
 * @example
 *
 *      const f = (x, y) => {
 *        // ...
 *      };
 *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
 *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
 * @symb R.zipWith(fn, [a, b, c], [d, e, f]) = [fn(a, d), fn(b, e), fn(c, f)]
 */
var zipWith =
/*#__PURE__*/
(0, _curry.default)(function zipWith(fn, a, b) {
  var rv = [];
  var idx = 0;
  var len = Math.min(a.length, b.length);

  while (idx < len) {
    rv[idx] = fn(a[idx], b[idx]);
    idx += 1;
  }

  return rv;
});
var _default = zipWith;
exports.default = _default;
},{"./internal/_curry3.js":"node_modules/ramda/es/internal/_curry3.js"}],"node_modules/ramda/es/thunkify.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _curry = _interopRequireDefault(require("./internal/_curry1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a thunk out of a function. A thunk delays a calculation until
 * its result is needed, providing lazy evaluation of arguments.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((a, b, ..., j) -> k) -> (a, b, ..., j) -> (() -> k)
 * @param {Function} fn A function to wrap in a thunk
 * @return {Function} Expects arguments for `fn` and returns a new function
 *  that, when called, applies those arguments to `fn`.
 * @see R.partial, R.partialRight
 * @example
 *
 *      R.thunkify(R.identity)(42)(); //=> 42
 *      R.thunkify((a, b) => a + b)(25, 17)(); //=> 42
 */
var thunkify =
/*#__PURE__*/
(0, _curry.default)(function thunkify(fn) {
  return (0, _curryN.default)(fn.length, function createThunk() {
    var fnArgs = arguments;
    return function invokeThunk() {
      return fn.apply(this, fnArgs);
    };
  });
});
var _default = thunkify;
exports.default = _default;
},{"./curryN.js":"node_modules/ramda/es/curryN.js","./internal/_curry1.js":"node_modules/ramda/es/internal/_curry1.js"}],"node_modules/ramda/es/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "F", {
  enumerable: true,
  get: function () {
    return _F.default;
  }
});
Object.defineProperty(exports, "T", {
  enumerable: true,
  get: function () {
    return _T.default;
  }
});
Object.defineProperty(exports, "__", {
  enumerable: true,
  get: function () {
    return _.default;
  }
});
Object.defineProperty(exports, "add", {
  enumerable: true,
  get: function () {
    return _add.default;
  }
});
Object.defineProperty(exports, "addIndex", {
  enumerable: true,
  get: function () {
    return _addIndex.default;
  }
});
Object.defineProperty(exports, "adjust", {
  enumerable: true,
  get: function () {
    return _adjust.default;
  }
});
Object.defineProperty(exports, "all", {
  enumerable: true,
  get: function () {
    return _all.default;
  }
});
Object.defineProperty(exports, "allPass", {
  enumerable: true,
  get: function () {
    return _allPass.default;
  }
});
Object.defineProperty(exports, "always", {
  enumerable: true,
  get: function () {
    return _always.default;
  }
});
Object.defineProperty(exports, "and", {
  enumerable: true,
  get: function () {
    return _and.default;
  }
});
Object.defineProperty(exports, "any", {
  enumerable: true,
  get: function () {
    return _any.default;
  }
});
Object.defineProperty(exports, "anyPass", {
  enumerable: true,
  get: function () {
    return _anyPass.default;
  }
});
Object.defineProperty(exports, "ap", {
  enumerable: true,
  get: function () {
    return _ap.default;
  }
});
Object.defineProperty(exports, "aperture", {
  enumerable: true,
  get: function () {
    return _aperture.default;
  }
});
Object.defineProperty(exports, "append", {
  enumerable: true,
  get: function () {
    return _append.default;
  }
});
Object.defineProperty(exports, "apply", {
  enumerable: true,
  get: function () {
    return _apply.default;
  }
});
Object.defineProperty(exports, "applySpec", {
  enumerable: true,
  get: function () {
    return _applySpec.default;
  }
});
Object.defineProperty(exports, "applyTo", {
  enumerable: true,
  get: function () {
    return _applyTo.default;
  }
});
Object.defineProperty(exports, "ascend", {
  enumerable: true,
  get: function () {
    return _ascend.default;
  }
});
Object.defineProperty(exports, "assoc", {
  enumerable: true,
  get: function () {
    return _assoc.default;
  }
});
Object.defineProperty(exports, "assocPath", {
  enumerable: true,
  get: function () {
    return _assocPath.default;
  }
});
Object.defineProperty(exports, "binary", {
  enumerable: true,
  get: function () {
    return _binary.default;
  }
});
Object.defineProperty(exports, "bind", {
  enumerable: true,
  get: function () {
    return _bind.default;
  }
});
Object.defineProperty(exports, "both", {
  enumerable: true,
  get: function () {
    return _both.default;
  }
});
Object.defineProperty(exports, "call", {
  enumerable: true,
  get: function () {
    return _call.default;
  }
});
Object.defineProperty(exports, "chain", {
  enumerable: true,
  get: function () {
    return _chain.default;
  }
});
Object.defineProperty(exports, "clamp", {
  enumerable: true,
  get: function () {
    return _clamp.default;
  }
});
Object.defineProperty(exports, "clone", {
  enumerable: true,
  get: function () {
    return _clone.default;
  }
});
Object.defineProperty(exports, "comparator", {
  enumerable: true,
  get: function () {
    return _comparator.default;
  }
});
Object.defineProperty(exports, "complement", {
  enumerable: true,
  get: function () {
    return _complement.default;
  }
});
Object.defineProperty(exports, "compose", {
  enumerable: true,
  get: function () {
    return _compose.default;
  }
});
Object.defineProperty(exports, "composeK", {
  enumerable: true,
  get: function () {
    return _composeK.default;
  }
});
Object.defineProperty(exports, "composeP", {
  enumerable: true,
  get: function () {
    return _composeP.default;
  }
});
Object.defineProperty(exports, "composeWith", {
  enumerable: true,
  get: function () {
    return _composeWith.default;
  }
});
Object.defineProperty(exports, "concat", {
  enumerable: true,
  get: function () {
    return _concat.default;
  }
});
Object.defineProperty(exports, "cond", {
  enumerable: true,
  get: function () {
    return _cond.default;
  }
});
Object.defineProperty(exports, "construct", {
  enumerable: true,
  get: function () {
    return _construct.default;
  }
});
Object.defineProperty(exports, "constructN", {
  enumerable: true,
  get: function () {
    return _constructN.default;
  }
});
Object.defineProperty(exports, "contains", {
  enumerable: true,
  get: function () {
    return _contains.default;
  }
});
Object.defineProperty(exports, "converge", {
  enumerable: true,
  get: function () {
    return _converge.default;
  }
});
Object.defineProperty(exports, "countBy", {
  enumerable: true,
  get: function () {
    return _countBy.default;
  }
});
Object.defineProperty(exports, "curry", {
  enumerable: true,
  get: function () {
    return _curry.default;
  }
});
Object.defineProperty(exports, "curryN", {
  enumerable: true,
  get: function () {
    return _curryN.default;
  }
});
Object.defineProperty(exports, "dec", {
  enumerable: true,
  get: function () {
    return _dec.default;
  }
});
Object.defineProperty(exports, "defaultTo", {
  enumerable: true,
  get: function () {
    return _defaultTo.default;
  }
});
Object.defineProperty(exports, "descend", {
  enumerable: true,
  get: function () {
    return _descend.default;
  }
});
Object.defineProperty(exports, "difference", {
  enumerable: true,
  get: function () {
    return _difference.default;
  }
});
Object.defineProperty(exports, "differenceWith", {
  enumerable: true,
  get: function () {
    return _differenceWith.default;
  }
});
Object.defineProperty(exports, "dissoc", {
  enumerable: true,
  get: function () {
    return _dissoc.default;
  }
});
Object.defineProperty(exports, "dissocPath", {
  enumerable: true,
  get: function () {
    return _dissocPath.default;
  }
});
Object.defineProperty(exports, "divide", {
  enumerable: true,
  get: function () {
    return _divide.default;
  }
});
Object.defineProperty(exports, "drop", {
  enumerable: true,
  get: function () {
    return _drop.default;
  }
});
Object.defineProperty(exports, "dropLast", {
  enumerable: true,
  get: function () {
    return _dropLast.default;
  }
});
Object.defineProperty(exports, "dropLastWhile", {
  enumerable: true,
  get: function () {
    return _dropLastWhile.default;
  }
});
Object.defineProperty(exports, "dropRepeats", {
  enumerable: true,
  get: function () {
    return _dropRepeats.default;
  }
});
Object.defineProperty(exports, "dropRepeatsWith", {
  enumerable: true,
  get: function () {
    return _dropRepeatsWith.default;
  }
});
Object.defineProperty(exports, "dropWhile", {
  enumerable: true,
  get: function () {
    return _dropWhile.default;
  }
});
Object.defineProperty(exports, "either", {
  enumerable: true,
  get: function () {
    return _either.default;
  }
});
Object.defineProperty(exports, "empty", {
  enumerable: true,
  get: function () {
    return _empty.default;
  }
});
Object.defineProperty(exports, "endsWith", {
  enumerable: true,
  get: function () {
    return _endsWith.default;
  }
});
Object.defineProperty(exports, "eqBy", {
  enumerable: true,
  get: function () {
    return _eqBy.default;
  }
});
Object.defineProperty(exports, "eqProps", {
  enumerable: true,
  get: function () {
    return _eqProps.default;
  }
});
Object.defineProperty(exports, "equals", {
  enumerable: true,
  get: function () {
    return _equals.default;
  }
});
Object.defineProperty(exports, "evolve", {
  enumerable: true,
  get: function () {
    return _evolve.default;
  }
});
Object.defineProperty(exports, "filter", {
  enumerable: true,
  get: function () {
    return _filter.default;
  }
});
Object.defineProperty(exports, "find", {
  enumerable: true,
  get: function () {
    return _find.default;
  }
});
Object.defineProperty(exports, "findIndex", {
  enumerable: true,
  get: function () {
    return _findIndex.default;
  }
});
Object.defineProperty(exports, "findLast", {
  enumerable: true,
  get: function () {
    return _findLast.default;
  }
});
Object.defineProperty(exports, "findLastIndex", {
  enumerable: true,
  get: function () {
    return _findLastIndex.default;
  }
});
Object.defineProperty(exports, "flatten", {
  enumerable: true,
  get: function () {
    return _flatten.default;
  }
});
Object.defineProperty(exports, "flip", {
  enumerable: true,
  get: function () {
    return _flip.default;
  }
});
Object.defineProperty(exports, "forEach", {
  enumerable: true,
  get: function () {
    return _forEach.default;
  }
});
Object.defineProperty(exports, "forEachObjIndexed", {
  enumerable: true,
  get: function () {
    return _forEachObjIndexed.default;
  }
});
Object.defineProperty(exports, "fromPairs", {
  enumerable: true,
  get: function () {
    return _fromPairs.default;
  }
});
Object.defineProperty(exports, "groupBy", {
  enumerable: true,
  get: function () {
    return _groupBy.default;
  }
});
Object.defineProperty(exports, "groupWith", {
  enumerable: true,
  get: function () {
    return _groupWith.default;
  }
});
Object.defineProperty(exports, "gt", {
  enumerable: true,
  get: function () {
    return _gt.default;
  }
});
Object.defineProperty(exports, "gte", {
  enumerable: true,
  get: function () {
    return _gte.default;
  }
});
Object.defineProperty(exports, "has", {
  enumerable: true,
  get: function () {
    return _has.default;
  }
});
Object.defineProperty(exports, "hasIn", {
  enumerable: true,
  get: function () {
    return _hasIn.default;
  }
});
Object.defineProperty(exports, "hasPath", {
  enumerable: true,
  get: function () {
    return _hasPath.default;
  }
});
Object.defineProperty(exports, "head", {
  enumerable: true,
  get: function () {
    return _head.default;
  }
});
Object.defineProperty(exports, "identical", {
  enumerable: true,
  get: function () {
    return _identical.default;
  }
});
Object.defineProperty(exports, "identity", {
  enumerable: true,
  get: function () {
    return _identity.default;
  }
});
Object.defineProperty(exports, "ifElse", {
  enumerable: true,
  get: function () {
    return _ifElse.default;
  }
});
Object.defineProperty(exports, "inc", {
  enumerable: true,
  get: function () {
    return _inc.default;
  }
});
Object.defineProperty(exports, "includes", {
  enumerable: true,
  get: function () {
    return _includes.default;
  }
});
Object.defineProperty(exports, "indexBy", {
  enumerable: true,
  get: function () {
    return _indexBy.default;
  }
});
Object.defineProperty(exports, "indexOf", {
  enumerable: true,
  get: function () {
    return _indexOf.default;
  }
});
Object.defineProperty(exports, "init", {
  enumerable: true,
  get: function () {
    return _init.default;
  }
});
Object.defineProperty(exports, "innerJoin", {
  enumerable: true,
  get: function () {
    return _innerJoin.default;
  }
});
Object.defineProperty(exports, "insert", {
  enumerable: true,
  get: function () {
    return _insert.default;
  }
});
Object.defineProperty(exports, "insertAll", {
  enumerable: true,
  get: function () {
    return _insertAll.default;
  }
});
Object.defineProperty(exports, "intersection", {
  enumerable: true,
  get: function () {
    return _intersection.default;
  }
});
Object.defineProperty(exports, "intersperse", {
  enumerable: true,
  get: function () {
    return _intersperse.default;
  }
});
Object.defineProperty(exports, "into", {
  enumerable: true,
  get: function () {
    return _into.default;
  }
});
Object.defineProperty(exports, "invert", {
  enumerable: true,
  get: function () {
    return _invert.default;
  }
});
Object.defineProperty(exports, "invertObj", {
  enumerable: true,
  get: function () {
    return _invertObj.default;
  }
});
Object.defineProperty(exports, "invoker", {
  enumerable: true,
  get: function () {
    return _invoker.default;
  }
});
Object.defineProperty(exports, "is", {
  enumerable: true,
  get: function () {
    return _is.default;
  }
});
Object.defineProperty(exports, "isEmpty", {
  enumerable: true,
  get: function () {
    return _isEmpty.default;
  }
});
Object.defineProperty(exports, "isNil", {
  enumerable: true,
  get: function () {
    return _isNil.default;
  }
});
Object.defineProperty(exports, "join", {
  enumerable: true,
  get: function () {
    return _join.default;
  }
});
Object.defineProperty(exports, "juxt", {
  enumerable: true,
  get: function () {
    return _juxt.default;
  }
});
Object.defineProperty(exports, "keys", {
  enumerable: true,
  get: function () {
    return _keys.default;
  }
});
Object.defineProperty(exports, "keysIn", {
  enumerable: true,
  get: function () {
    return _keysIn.default;
  }
});
Object.defineProperty(exports, "last", {
  enumerable: true,
  get: function () {
    return _last.default;
  }
});
Object.defineProperty(exports, "lastIndexOf", {
  enumerable: true,
  get: function () {
    return _lastIndexOf.default;
  }
});
Object.defineProperty(exports, "length", {
  enumerable: true,
  get: function () {
    return _length.default;
  }
});
Object.defineProperty(exports, "lens", {
  enumerable: true,
  get: function () {
    return _lens.default;
  }
});
Object.defineProperty(exports, "lensIndex", {
  enumerable: true,
  get: function () {
    return _lensIndex.default;
  }
});
Object.defineProperty(exports, "lensPath", {
  enumerable: true,
  get: function () {
    return _lensPath.default;
  }
});
Object.defineProperty(exports, "lensProp", {
  enumerable: true,
  get: function () {
    return _lensProp.default;
  }
});
Object.defineProperty(exports, "lift", {
  enumerable: true,
  get: function () {
    return _lift.default;
  }
});
Object.defineProperty(exports, "liftN", {
  enumerable: true,
  get: function () {
    return _liftN.default;
  }
});
Object.defineProperty(exports, "lt", {
  enumerable: true,
  get: function () {
    return _lt.default;
  }
});
Object.defineProperty(exports, "lte", {
  enumerable: true,
  get: function () {
    return _lte.default;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function () {
    return _map.default;
  }
});
Object.defineProperty(exports, "mapAccum", {
  enumerable: true,
  get: function () {
    return _mapAccum.default;
  }
});
Object.defineProperty(exports, "mapAccumRight", {
  enumerable: true,
  get: function () {
    return _mapAccumRight.default;
  }
});
Object.defineProperty(exports, "mapObjIndexed", {
  enumerable: true,
  get: function () {
    return _mapObjIndexed.default;
  }
});
Object.defineProperty(exports, "match", {
  enumerable: true,
  get: function () {
    return _match.default;
  }
});
Object.defineProperty(exports, "mathMod", {
  enumerable: true,
  get: function () {
    return _mathMod.default;
  }
});
Object.defineProperty(exports, "max", {
  enumerable: true,
  get: function () {
    return _max.default;
  }
});
Object.defineProperty(exports, "maxBy", {
  enumerable: true,
  get: function () {
    return _maxBy.default;
  }
});
Object.defineProperty(exports, "mean", {
  enumerable: true,
  get: function () {
    return _mean.default;
  }
});
Object.defineProperty(exports, "median", {
  enumerable: true,
  get: function () {
    return _median.default;
  }
});
Object.defineProperty(exports, "memoizeWith", {
  enumerable: true,
  get: function () {
    return _memoizeWith.default;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _merge.default;
  }
});
Object.defineProperty(exports, "mergeAll", {
  enumerable: true,
  get: function () {
    return _mergeAll.default;
  }
});
Object.defineProperty(exports, "mergeDeepLeft", {
  enumerable: true,
  get: function () {
    return _mergeDeepLeft.default;
  }
});
Object.defineProperty(exports, "mergeDeepRight", {
  enumerable: true,
  get: function () {
    return _mergeDeepRight.default;
  }
});
Object.defineProperty(exports, "mergeDeepWith", {
  enumerable: true,
  get: function () {
    return _mergeDeepWith.default;
  }
});
Object.defineProperty(exports, "mergeDeepWithKey", {
  enumerable: true,
  get: function () {
    return _mergeDeepWithKey.default;
  }
});
Object.defineProperty(exports, "mergeLeft", {
  enumerable: true,
  get: function () {
    return _mergeLeft.default;
  }
});
Object.defineProperty(exports, "mergeRight", {
  enumerable: true,
  get: function () {
    return _mergeRight.default;
  }
});
Object.defineProperty(exports, "mergeWith", {
  enumerable: true,
  get: function () {
    return _mergeWith.default;
  }
});
Object.defineProperty(exports, "mergeWithKey", {
  enumerable: true,
  get: function () {
    return _mergeWithKey.default;
  }
});
Object.defineProperty(exports, "min", {
  enumerable: true,
  get: function () {
    return _min.default;
  }
});
Object.defineProperty(exports, "minBy", {
  enumerable: true,
  get: function () {
    return _minBy.default;
  }
});
Object.defineProperty(exports, "modulo", {
  enumerable: true,
  get: function () {
    return _modulo.default;
  }
});
Object.defineProperty(exports, "move", {
  enumerable: true,
  get: function () {
    return _move.default;
  }
});
Object.defineProperty(exports, "multiply", {
  enumerable: true,
  get: function () {
    return _multiply.default;
  }
});
Object.defineProperty(exports, "nAry", {
  enumerable: true,
  get: function () {
    return _nAry.default;
  }
});
Object.defineProperty(exports, "negate", {
  enumerable: true,
  get: function () {
    return _negate.default;
  }
});
Object.defineProperty(exports, "none", {
  enumerable: true,
  get: function () {
    return _none.default;
  }
});
Object.defineProperty(exports, "not", {
  enumerable: true,
  get: function () {
    return _not.default;
  }
});
Object.defineProperty(exports, "nth", {
  enumerable: true,
  get: function () {
    return _nth.default;
  }
});
Object.defineProperty(exports, "nthArg", {
  enumerable: true,
  get: function () {
    return _nthArg.default;
  }
});
Object.defineProperty(exports, "o", {
  enumerable: true,
  get: function () {
    return _o.default;
  }
});
Object.defineProperty(exports, "objOf", {
  enumerable: true,
  get: function () {
    return _objOf.default;
  }
});
Object.defineProperty(exports, "of", {
  enumerable: true,
  get: function () {
    return _of.default;
  }
});
Object.defineProperty(exports, "omit", {
  enumerable: true,
  get: function () {
    return _omit.default;
  }
});
Object.defineProperty(exports, "once", {
  enumerable: true,
  get: function () {
    return _once.default;
  }
});
Object.defineProperty(exports, "or", {
  enumerable: true,
  get: function () {
    return _or.default;
  }
});
Object.defineProperty(exports, "otherwise", {
  enumerable: true,
  get: function () {
    return _otherwise.default;
  }
});
Object.defineProperty(exports, "over", {
  enumerable: true,
  get: function () {
    return _over.default;
  }
});
Object.defineProperty(exports, "pair", {
  enumerable: true,
  get: function () {
    return _pair.default;
  }
});
Object.defineProperty(exports, "partial", {
  enumerable: true,
  get: function () {
    return _partial.default;
  }
});
Object.defineProperty(exports, "partialRight", {
  enumerable: true,
  get: function () {
    return _partialRight.default;
  }
});
Object.defineProperty(exports, "partition", {
  enumerable: true,
  get: function () {
    return _partition.default;
  }
});
Object.defineProperty(exports, "path", {
  enumerable: true,
  get: function () {
    return _path.default;
  }
});
Object.defineProperty(exports, "pathEq", {
  enumerable: true,
  get: function () {
    return _pathEq.default;
  }
});
Object.defineProperty(exports, "pathOr", {
  enumerable: true,
  get: function () {
    return _pathOr.default;
  }
});
Object.defineProperty(exports, "pathSatisfies", {
  enumerable: true,
  get: function () {
    return _pathSatisfies.default;
  }
});
Object.defineProperty(exports, "pick", {
  enumerable: true,
  get: function () {
    return _pick.default;
  }
});
Object.defineProperty(exports, "pickAll", {
  enumerable: true,
  get: function () {
    return _pickAll.default;
  }
});
Object.defineProperty(exports, "pickBy", {
  enumerable: true,
  get: function () {
    return _pickBy.default;
  }
});
Object.defineProperty(exports, "pipe", {
  enumerable: true,
  get: function () {
    return _pipe.default;
  }
});
Object.defineProperty(exports, "pipeK", {
  enumerable: true,
  get: function () {
    return _pipeK.default;
  }
});
Object.defineProperty(exports, "pipeP", {
  enumerable: true,
  get: function () {
    return _pipeP.default;
  }
});
Object.defineProperty(exports, "pipeWith", {
  enumerable: true,
  get: function () {
    return _pipeWith.default;
  }
});
Object.defineProperty(exports, "pluck", {
  enumerable: true,
  get: function () {
    return _pluck.default;
  }
});
Object.defineProperty(exports, "prepend", {
  enumerable: true,
  get: function () {
    return _prepend.default;
  }
});
Object.defineProperty(exports, "product", {
  enumerable: true,
  get: function () {
    return _product.default;
  }
});
Object.defineProperty(exports, "project", {
  enumerable: true,
  get: function () {
    return _project.default;
  }
});
Object.defineProperty(exports, "prop", {
  enumerable: true,
  get: function () {
    return _prop.default;
  }
});
Object.defineProperty(exports, "propEq", {
  enumerable: true,
  get: function () {
    return _propEq.default;
  }
});
Object.defineProperty(exports, "propIs", {
  enumerable: true,
  get: function () {
    return _propIs.default;
  }
});
Object.defineProperty(exports, "propOr", {
  enumerable: true,
  get: function () {
    return _propOr.default;
  }
});
Object.defineProperty(exports, "propSatisfies", {
  enumerable: true,
  get: function () {
    return _propSatisfies.default;
  }
});
Object.defineProperty(exports, "props", {
  enumerable: true,
  get: function () {
    return _props.default;
  }
});
Object.defineProperty(exports, "range", {
  enumerable: true,
  get: function () {
    return _range.default;
  }
});
Object.defineProperty(exports, "reduce", {
  enumerable: true,
  get: function () {
    return _reduce.default;
  }
});
Object.defineProperty(exports, "reduceBy", {
  enumerable: true,
  get: function () {
    return _reduceBy.default;
  }
});
Object.defineProperty(exports, "reduceRight", {
  enumerable: true,
  get: function () {
    return _reduceRight.default;
  }
});
Object.defineProperty(exports, "reduceWhile", {
  enumerable: true,
  get: function () {
    return _reduceWhile.default;
  }
});
Object.defineProperty(exports, "reduced", {
  enumerable: true,
  get: function () {
    return _reduced.default;
  }
});
Object.defineProperty(exports, "reject", {
  enumerable: true,
  get: function () {
    return _reject.default;
  }
});
Object.defineProperty(exports, "remove", {
  enumerable: true,
  get: function () {
    return _remove.default;
  }
});
Object.defineProperty(exports, "repeat", {
  enumerable: true,
  get: function () {
    return _repeat.default;
  }
});
Object.defineProperty(exports, "replace", {
  enumerable: true,
  get: function () {
    return _replace.default;
  }
});
Object.defineProperty(exports, "reverse", {
  enumerable: true,
  get: function () {
    return _reverse.default;
  }
});
Object.defineProperty(exports, "scan", {
  enumerable: true,
  get: function () {
    return _scan.default;
  }
});
Object.defineProperty(exports, "sequence", {
  enumerable: true,
  get: function () {
    return _sequence.default;
  }
});
Object.defineProperty(exports, "set", {
  enumerable: true,
  get: function () {
    return _set.default;
  }
});
Object.defineProperty(exports, "slice", {
  enumerable: true,
  get: function () {
    return _slice.default;
  }
});
Object.defineProperty(exports, "sort", {
  enumerable: true,
  get: function () {
    return _sort.default;
  }
});
Object.defineProperty(exports, "sortBy", {
  enumerable: true,
  get: function () {
    return _sortBy.default;
  }
});
Object.defineProperty(exports, "sortWith", {
  enumerable: true,
  get: function () {
    return _sortWith.default;
  }
});
Object.defineProperty(exports, "split", {
  enumerable: true,
  get: function () {
    return _split.default;
  }
});
Object.defineProperty(exports, "splitAt", {
  enumerable: true,
  get: function () {
    return _splitAt.default;
  }
});
Object.defineProperty(exports, "splitEvery", {
  enumerable: true,
  get: function () {
    return _splitEvery.default;
  }
});
Object.defineProperty(exports, "splitWhen", {
  enumerable: true,
  get: function () {
    return _splitWhen.default;
  }
});
Object.defineProperty(exports, "startsWith", {
  enumerable: true,
  get: function () {
    return _startsWith.default;
  }
});
Object.defineProperty(exports, "subtract", {
  enumerable: true,
  get: function () {
    return _subtract.default;
  }
});
Object.defineProperty(exports, "sum", {
  enumerable: true,
  get: function () {
    return _sum.default;
  }
});
Object.defineProperty(exports, "symmetricDifference", {
  enumerable: true,
  get: function () {
    return _symmetricDifference.default;
  }
});
Object.defineProperty(exports, "symmetricDifferenceWith", {
  enumerable: true,
  get: function () {
    return _symmetricDifferenceWith.default;
  }
});
Object.defineProperty(exports, "tail", {
  enumerable: true,
  get: function () {
    return _tail.default;
  }
});
Object.defineProperty(exports, "take", {
  enumerable: true,
  get: function () {
    return _take.default;
  }
});
Object.defineProperty(exports, "takeLast", {
  enumerable: true,
  get: function () {
    return _takeLast.default;
  }
});
Object.defineProperty(exports, "takeLastWhile", {
  enumerable: true,
  get: function () {
    return _takeLastWhile.default;
  }
});
Object.defineProperty(exports, "takeWhile", {
  enumerable: true,
  get: function () {
    return _takeWhile.default;
  }
});
Object.defineProperty(exports, "tap", {
  enumerable: true,
  get: function () {
    return _tap.default;
  }
});
Object.defineProperty(exports, "test", {
  enumerable: true,
  get: function () {
    return _test.default;
  }
});
Object.defineProperty(exports, "then", {
  enumerable: true,
  get: function () {
    return _then.default;
  }
});
Object.defineProperty(exports, "times", {
  enumerable: true,
  get: function () {
    return _times.default;
  }
});
Object.defineProperty(exports, "toLower", {
  enumerable: true,
  get: function () {
    return _toLower.default;
  }
});
Object.defineProperty(exports, "toPairs", {
  enumerable: true,
  get: function () {
    return _toPairs.default;
  }
});
Object.defineProperty(exports, "toPairsIn", {
  enumerable: true,
  get: function () {
    return _toPairsIn.default;
  }
});
Object.defineProperty(exports, "toString", {
  enumerable: true,
  get: function () {
    return _toString.default;
  }
});
Object.defineProperty(exports, "toUpper", {
  enumerable: true,
  get: function () {
    return _toUpper.default;
  }
});
Object.defineProperty(exports, "transduce", {
  enumerable: true,
  get: function () {
    return _transduce.default;
  }
});
Object.defineProperty(exports, "transpose", {
  enumerable: true,
  get: function () {
    return _transpose.default;
  }
});
Object.defineProperty(exports, "traverse", {
  enumerable: true,
  get: function () {
    return _traverse.default;
  }
});
Object.defineProperty(exports, "trim", {
  enumerable: true,
  get: function () {
    return _trim.default;
  }
});
Object.defineProperty(exports, "tryCatch", {
  enumerable: true,
  get: function () {
    return _tryCatch.default;
  }
});
Object.defineProperty(exports, "type", {
  enumerable: true,
  get: function () {
    return _type.default;
  }
});
Object.defineProperty(exports, "unapply", {
  enumerable: true,
  get: function () {
    return _unapply.default;
  }
});
Object.defineProperty(exports, "unary", {
  enumerable: true,
  get: function () {
    return _unary.default;
  }
});
Object.defineProperty(exports, "uncurryN", {
  enumerable: true,
  get: function () {
    return _uncurryN.default;
  }
});
Object.defineProperty(exports, "unfold", {
  enumerable: true,
  get: function () {
    return _unfold.default;
  }
});
Object.defineProperty(exports, "union", {
  enumerable: true,
  get: function () {
    return _union.default;
  }
});
Object.defineProperty(exports, "unionWith", {
  enumerable: true,
  get: function () {
    return _unionWith.default;
  }
});
Object.defineProperty(exports, "uniq", {
  enumerable: true,
  get: function () {
    return _uniq.default;
  }
});
Object.defineProperty(exports, "uniqBy", {
  enumerable: true,
  get: function () {
    return _uniqBy.default;
  }
});
Object.defineProperty(exports, "uniqWith", {
  enumerable: true,
  get: function () {
    return _uniqWith.default;
  }
});
Object.defineProperty(exports, "unless", {
  enumerable: true,
  get: function () {
    return _unless.default;
  }
});
Object.defineProperty(exports, "unnest", {
  enumerable: true,
  get: function () {
    return _unnest.default;
  }
});
Object.defineProperty(exports, "until", {
  enumerable: true,
  get: function () {
    return _until.default;
  }
});
Object.defineProperty(exports, "update", {
  enumerable: true,
  get: function () {
    return _update.default;
  }
});
Object.defineProperty(exports, "useWith", {
  enumerable: true,
  get: function () {
    return _useWith.default;
  }
});
Object.defineProperty(exports, "values", {
  enumerable: true,
  get: function () {
    return _values.default;
  }
});
Object.defineProperty(exports, "valuesIn", {
  enumerable: true,
  get: function () {
    return _valuesIn.default;
  }
});
Object.defineProperty(exports, "view", {
  enumerable: true,
  get: function () {
    return _view.default;
  }
});
Object.defineProperty(exports, "when", {
  enumerable: true,
  get: function () {
    return _when.default;
  }
});
Object.defineProperty(exports, "where", {
  enumerable: true,
  get: function () {
    return _where.default;
  }
});
Object.defineProperty(exports, "whereEq", {
  enumerable: true,
  get: function () {
    return _whereEq.default;
  }
});
Object.defineProperty(exports, "without", {
  enumerable: true,
  get: function () {
    return _without.default;
  }
});
Object.defineProperty(exports, "xprod", {
  enumerable: true,
  get: function () {
    return _xprod.default;
  }
});
Object.defineProperty(exports, "zip", {
  enumerable: true,
  get: function () {
    return _zip.default;
  }
});
Object.defineProperty(exports, "zipObj", {
  enumerable: true,
  get: function () {
    return _zipObj.default;
  }
});
Object.defineProperty(exports, "zipWith", {
  enumerable: true,
  get: function () {
    return _zipWith.default;
  }
});
Object.defineProperty(exports, "thunkify", {
  enumerable: true,
  get: function () {
    return _thunkify.default;
  }
});

var _F = _interopRequireDefault(require("./F.js"));

var _T = _interopRequireDefault(require("./T.js"));

var _ = _interopRequireDefault(require("./__.js"));

var _add = _interopRequireDefault(require("./add.js"));

var _addIndex = _interopRequireDefault(require("./addIndex.js"));

var _adjust = _interopRequireDefault(require("./adjust.js"));

var _all = _interopRequireDefault(require("./all.js"));

var _allPass = _interopRequireDefault(require("./allPass.js"));

var _always = _interopRequireDefault(require("./always.js"));

var _and = _interopRequireDefault(require("./and.js"));

var _any = _interopRequireDefault(require("./any.js"));

var _anyPass = _interopRequireDefault(require("./anyPass.js"));

var _ap = _interopRequireDefault(require("./ap.js"));

var _aperture = _interopRequireDefault(require("./aperture.js"));

var _append = _interopRequireDefault(require("./append.js"));

var _apply = _interopRequireDefault(require("./apply.js"));

var _applySpec = _interopRequireDefault(require("./applySpec.js"));

var _applyTo = _interopRequireDefault(require("./applyTo.js"));

var _ascend = _interopRequireDefault(require("./ascend.js"));

var _assoc = _interopRequireDefault(require("./assoc.js"));

var _assocPath = _interopRequireDefault(require("./assocPath.js"));

var _binary = _interopRequireDefault(require("./binary.js"));

var _bind = _interopRequireDefault(require("./bind.js"));

var _both = _interopRequireDefault(require("./both.js"));

var _call = _interopRequireDefault(require("./call.js"));

var _chain = _interopRequireDefault(require("./chain.js"));

var _clamp = _interopRequireDefault(require("./clamp.js"));

var _clone = _interopRequireDefault(require("./clone.js"));

var _comparator = _interopRequireDefault(require("./comparator.js"));

var _complement = _interopRequireDefault(require("./complement.js"));

var _compose = _interopRequireDefault(require("./compose.js"));

var _composeK = _interopRequireDefault(require("./composeK.js"));

var _composeP = _interopRequireDefault(require("./composeP.js"));

var _composeWith = _interopRequireDefault(require("./composeWith.js"));

var _concat = _interopRequireDefault(require("./concat.js"));

var _cond = _interopRequireDefault(require("./cond.js"));

var _construct = _interopRequireDefault(require("./construct.js"));

var _constructN = _interopRequireDefault(require("./constructN.js"));

var _contains = _interopRequireDefault(require("./contains.js"));

var _converge = _interopRequireDefault(require("./converge.js"));

var _countBy = _interopRequireDefault(require("./countBy.js"));

var _curry = _interopRequireDefault(require("./curry.js"));

var _curryN = _interopRequireDefault(require("./curryN.js"));

var _dec = _interopRequireDefault(require("./dec.js"));

var _defaultTo = _interopRequireDefault(require("./defaultTo.js"));

var _descend = _interopRequireDefault(require("./descend.js"));

var _difference = _interopRequireDefault(require("./difference.js"));

var _differenceWith = _interopRequireDefault(require("./differenceWith.js"));

var _dissoc = _interopRequireDefault(require("./dissoc.js"));

var _dissocPath = _interopRequireDefault(require("./dissocPath.js"));

var _divide = _interopRequireDefault(require("./divide.js"));

var _drop = _interopRequireDefault(require("./drop.js"));

var _dropLast = _interopRequireDefault(require("./dropLast.js"));

var _dropLastWhile = _interopRequireDefault(require("./dropLastWhile.js"));

var _dropRepeats = _interopRequireDefault(require("./dropRepeats.js"));

var _dropRepeatsWith = _interopRequireDefault(require("./dropRepeatsWith.js"));

var _dropWhile = _interopRequireDefault(require("./dropWhile.js"));

var _either = _interopRequireDefault(require("./either.js"));

var _empty = _interopRequireDefault(require("./empty.js"));

var _endsWith = _interopRequireDefault(require("./endsWith.js"));

var _eqBy = _interopRequireDefault(require("./eqBy.js"));

var _eqProps = _interopRequireDefault(require("./eqProps.js"));

var _equals = _interopRequireDefault(require("./equals.js"));

var _evolve = _interopRequireDefault(require("./evolve.js"));

var _filter = _interopRequireDefault(require("./filter.js"));

var _find = _interopRequireDefault(require("./find.js"));

var _findIndex = _interopRequireDefault(require("./findIndex.js"));

var _findLast = _interopRequireDefault(require("./findLast.js"));

var _findLastIndex = _interopRequireDefault(require("./findLastIndex.js"));

var _flatten = _interopRequireDefault(require("./flatten.js"));

var _flip = _interopRequireDefault(require("./flip.js"));

var _forEach = _interopRequireDefault(require("./forEach.js"));

var _forEachObjIndexed = _interopRequireDefault(require("./forEachObjIndexed.js"));

var _fromPairs = _interopRequireDefault(require("./fromPairs.js"));

var _groupBy = _interopRequireDefault(require("./groupBy.js"));

var _groupWith = _interopRequireDefault(require("./groupWith.js"));

var _gt = _interopRequireDefault(require("./gt.js"));

var _gte = _interopRequireDefault(require("./gte.js"));

var _has = _interopRequireDefault(require("./has.js"));

var _hasIn = _interopRequireDefault(require("./hasIn.js"));

var _hasPath = _interopRequireDefault(require("./hasPath.js"));

var _head = _interopRequireDefault(require("./head.js"));

var _identical = _interopRequireDefault(require("./identical.js"));

var _identity = _interopRequireDefault(require("./identity.js"));

var _ifElse = _interopRequireDefault(require("./ifElse.js"));

var _inc = _interopRequireDefault(require("./inc.js"));

var _includes = _interopRequireDefault(require("./includes.js"));

var _indexBy = _interopRequireDefault(require("./indexBy.js"));

var _indexOf = _interopRequireDefault(require("./indexOf.js"));

var _init = _interopRequireDefault(require("./init.js"));

var _innerJoin = _interopRequireDefault(require("./innerJoin.js"));

var _insert = _interopRequireDefault(require("./insert.js"));

var _insertAll = _interopRequireDefault(require("./insertAll.js"));

var _intersection = _interopRequireDefault(require("./intersection.js"));

var _intersperse = _interopRequireDefault(require("./intersperse.js"));

var _into = _interopRequireDefault(require("./into.js"));

var _invert = _interopRequireDefault(require("./invert.js"));

var _invertObj = _interopRequireDefault(require("./invertObj.js"));

var _invoker = _interopRequireDefault(require("./invoker.js"));

var _is = _interopRequireDefault(require("./is.js"));

var _isEmpty = _interopRequireDefault(require("./isEmpty.js"));

var _isNil = _interopRequireDefault(require("./isNil.js"));

var _join = _interopRequireDefault(require("./join.js"));

var _juxt = _interopRequireDefault(require("./juxt.js"));

var _keys = _interopRequireDefault(require("./keys.js"));

var _keysIn = _interopRequireDefault(require("./keysIn.js"));

var _last = _interopRequireDefault(require("./last.js"));

var _lastIndexOf = _interopRequireDefault(require("./lastIndexOf.js"));

var _length = _interopRequireDefault(require("./length.js"));

var _lens = _interopRequireDefault(require("./lens.js"));

var _lensIndex = _interopRequireDefault(require("./lensIndex.js"));

var _lensPath = _interopRequireDefault(require("./lensPath.js"));

var _lensProp = _interopRequireDefault(require("./lensProp.js"));

var _lift = _interopRequireDefault(require("./lift.js"));

var _liftN = _interopRequireDefault(require("./liftN.js"));

var _lt = _interopRequireDefault(require("./lt.js"));

var _lte = _interopRequireDefault(require("./lte.js"));

var _map = _interopRequireDefault(require("./map.js"));

var _mapAccum = _interopRequireDefault(require("./mapAccum.js"));

var _mapAccumRight = _interopRequireDefault(require("./mapAccumRight.js"));

var _mapObjIndexed = _interopRequireDefault(require("./mapObjIndexed.js"));

var _match = _interopRequireDefault(require("./match.js"));

var _mathMod = _interopRequireDefault(require("./mathMod.js"));

var _max = _interopRequireDefault(require("./max.js"));

var _maxBy = _interopRequireDefault(require("./maxBy.js"));

var _mean = _interopRequireDefault(require("./mean.js"));

var _median = _interopRequireDefault(require("./median.js"));

var _memoizeWith = _interopRequireDefault(require("./memoizeWith.js"));

var _merge = _interopRequireDefault(require("./merge.js"));

var _mergeAll = _interopRequireDefault(require("./mergeAll.js"));

var _mergeDeepLeft = _interopRequireDefault(require("./mergeDeepLeft.js"));

var _mergeDeepRight = _interopRequireDefault(require("./mergeDeepRight.js"));

var _mergeDeepWith = _interopRequireDefault(require("./mergeDeepWith.js"));

var _mergeDeepWithKey = _interopRequireDefault(require("./mergeDeepWithKey.js"));

var _mergeLeft = _interopRequireDefault(require("./mergeLeft.js"));

var _mergeRight = _interopRequireDefault(require("./mergeRight.js"));

var _mergeWith = _interopRequireDefault(require("./mergeWith.js"));

var _mergeWithKey = _interopRequireDefault(require("./mergeWithKey.js"));

var _min = _interopRequireDefault(require("./min.js"));

var _minBy = _interopRequireDefault(require("./minBy.js"));

var _modulo = _interopRequireDefault(require("./modulo.js"));

var _move = _interopRequireDefault(require("./move.js"));

var _multiply = _interopRequireDefault(require("./multiply.js"));

var _nAry = _interopRequireDefault(require("./nAry.js"));

var _negate = _interopRequireDefault(require("./negate.js"));

var _none = _interopRequireDefault(require("./none.js"));

var _not = _interopRequireDefault(require("./not.js"));

var _nth = _interopRequireDefault(require("./nth.js"));

var _nthArg = _interopRequireDefault(require("./nthArg.js"));

var _o = _interopRequireDefault(require("./o.js"));

var _objOf = _interopRequireDefault(require("./objOf.js"));

var _of = _interopRequireDefault(require("./of.js"));

var _omit = _interopRequireDefault(require("./omit.js"));

var _once = _interopRequireDefault(require("./once.js"));

var _or = _interopRequireDefault(require("./or.js"));

var _otherwise = _interopRequireDefault(require("./otherwise.js"));

var _over = _interopRequireDefault(require("./over.js"));

var _pair = _interopRequireDefault(require("./pair.js"));

var _partial = _interopRequireDefault(require("./partial.js"));

var _partialRight = _interopRequireDefault(require("./partialRight.js"));

var _partition = _interopRequireDefault(require("./partition.js"));

var _path = _interopRequireDefault(require("./path.js"));

var _pathEq = _interopRequireDefault(require("./pathEq.js"));

var _pathOr = _interopRequireDefault(require("./pathOr.js"));

var _pathSatisfies = _interopRequireDefault(require("./pathSatisfies.js"));

var _pick = _interopRequireDefault(require("./pick.js"));

var _pickAll = _interopRequireDefault(require("./pickAll.js"));

var _pickBy = _interopRequireDefault(require("./pickBy.js"));

var _pipe = _interopRequireDefault(require("./pipe.js"));

var _pipeK = _interopRequireDefault(require("./pipeK.js"));

var _pipeP = _interopRequireDefault(require("./pipeP.js"));

var _pipeWith = _interopRequireDefault(require("./pipeWith.js"));

var _pluck = _interopRequireDefault(require("./pluck.js"));

var _prepend = _interopRequireDefault(require("./prepend.js"));

var _product = _interopRequireDefault(require("./product.js"));

var _project = _interopRequireDefault(require("./project.js"));

var _prop = _interopRequireDefault(require("./prop.js"));

var _propEq = _interopRequireDefault(require("./propEq.js"));

var _propIs = _interopRequireDefault(require("./propIs.js"));

var _propOr = _interopRequireDefault(require("./propOr.js"));

var _propSatisfies = _interopRequireDefault(require("./propSatisfies.js"));

var _props = _interopRequireDefault(require("./props.js"));

var _range = _interopRequireDefault(require("./range.js"));

var _reduce = _interopRequireDefault(require("./reduce.js"));

var _reduceBy = _interopRequireDefault(require("./reduceBy.js"));

var _reduceRight = _interopRequireDefault(require("./reduceRight.js"));

var _reduceWhile = _interopRequireDefault(require("./reduceWhile.js"));

var _reduced = _interopRequireDefault(require("./reduced.js"));

var _reject = _interopRequireDefault(require("./reject.js"));

var _remove = _interopRequireDefault(require("./remove.js"));

var _repeat = _interopRequireDefault(require("./repeat.js"));

var _replace = _interopRequireDefault(require("./replace.js"));

var _reverse = _interopRequireDefault(require("./reverse.js"));

var _scan = _interopRequireDefault(require("./scan.js"));

var _sequence = _interopRequireDefault(require("./sequence.js"));

var _set = _interopRequireDefault(require("./set.js"));

var _slice = _interopRequireDefault(require("./slice.js"));

var _sort = _interopRequireDefault(require("./sort.js"));

var _sortBy = _interopRequireDefault(require("./sortBy.js"));

var _sortWith = _interopRequireDefault(require("./sortWith.js"));

var _split = _interopRequireDefault(require("./split.js"));

var _splitAt = _interopRequireDefault(require("./splitAt.js"));

var _splitEvery = _interopRequireDefault(require("./splitEvery.js"));

var _splitWhen = _interopRequireDefault(require("./splitWhen.js"));

var _startsWith = _interopRequireDefault(require("./startsWith.js"));

var _subtract = _interopRequireDefault(require("./subtract.js"));

var _sum = _interopRequireDefault(require("./sum.js"));

var _symmetricDifference = _interopRequireDefault(require("./symmetricDifference.js"));

var _symmetricDifferenceWith = _interopRequireDefault(require("./symmetricDifferenceWith.js"));

var _tail = _interopRequireDefault(require("./tail.js"));

var _take = _interopRequireDefault(require("./take.js"));

var _takeLast = _interopRequireDefault(require("./takeLast.js"));

var _takeLastWhile = _interopRequireDefault(require("./takeLastWhile.js"));

var _takeWhile = _interopRequireDefault(require("./takeWhile.js"));

var _tap = _interopRequireDefault(require("./tap.js"));

var _test = _interopRequireDefault(require("./test.js"));

var _then = _interopRequireDefault(require("./then.js"));

var _times = _interopRequireDefault(require("./times.js"));

var _toLower = _interopRequireDefault(require("./toLower.js"));

var _toPairs = _interopRequireDefault(require("./toPairs.js"));

var _toPairsIn = _interopRequireDefault(require("./toPairsIn.js"));

var _toString = _interopRequireDefault(require("./toString.js"));

var _toUpper = _interopRequireDefault(require("./toUpper.js"));

var _transduce = _interopRequireDefault(require("./transduce.js"));

var _transpose = _interopRequireDefault(require("./transpose.js"));

var _traverse = _interopRequireDefault(require("./traverse.js"));

var _trim = _interopRequireDefault(require("./trim.js"));

var _tryCatch = _interopRequireDefault(require("./tryCatch.js"));

var _type = _interopRequireDefault(require("./type.js"));

var _unapply = _interopRequireDefault(require("./unapply.js"));

var _unary = _interopRequireDefault(require("./unary.js"));

var _uncurryN = _interopRequireDefault(require("./uncurryN.js"));

var _unfold = _interopRequireDefault(require("./unfold.js"));

var _union = _interopRequireDefault(require("./union.js"));

var _unionWith = _interopRequireDefault(require("./unionWith.js"));

var _uniq = _interopRequireDefault(require("./uniq.js"));

var _uniqBy = _interopRequireDefault(require("./uniqBy.js"));

var _uniqWith = _interopRequireDefault(require("./uniqWith.js"));

var _unless = _interopRequireDefault(require("./unless.js"));

var _unnest = _interopRequireDefault(require("./unnest.js"));

var _until = _interopRequireDefault(require("./until.js"));

var _update = _interopRequireDefault(require("./update.js"));

var _useWith = _interopRequireDefault(require("./useWith.js"));

var _values = _interopRequireDefault(require("./values.js"));

var _valuesIn = _interopRequireDefault(require("./valuesIn.js"));

var _view = _interopRequireDefault(require("./view.js"));

var _when = _interopRequireDefault(require("./when.js"));

var _where = _interopRequireDefault(require("./where.js"));

var _whereEq = _interopRequireDefault(require("./whereEq.js"));

var _without = _interopRequireDefault(require("./without.js"));

var _xprod = _interopRequireDefault(require("./xprod.js"));

var _zip = _interopRequireDefault(require("./zip.js"));

var _zipObj = _interopRequireDefault(require("./zipObj.js"));

var _zipWith = _interopRequireDefault(require("./zipWith.js"));

var _thunkify = _interopRequireDefault(require("./thunkify.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./F.js":"node_modules/ramda/es/F.js","./T.js":"node_modules/ramda/es/T.js","./__.js":"node_modules/ramda/es/__.js","./add.js":"node_modules/ramda/es/add.js","./addIndex.js":"node_modules/ramda/es/addIndex.js","./adjust.js":"node_modules/ramda/es/adjust.js","./all.js":"node_modules/ramda/es/all.js","./allPass.js":"node_modules/ramda/es/allPass.js","./always.js":"node_modules/ramda/es/always.js","./and.js":"node_modules/ramda/es/and.js","./any.js":"node_modules/ramda/es/any.js","./anyPass.js":"node_modules/ramda/es/anyPass.js","./ap.js":"node_modules/ramda/es/ap.js","./aperture.js":"node_modules/ramda/es/aperture.js","./append.js":"node_modules/ramda/es/append.js","./apply.js":"node_modules/ramda/es/apply.js","./applySpec.js":"node_modules/ramda/es/applySpec.js","./applyTo.js":"node_modules/ramda/es/applyTo.js","./ascend.js":"node_modules/ramda/es/ascend.js","./assoc.js":"node_modules/ramda/es/assoc.js","./assocPath.js":"node_modules/ramda/es/assocPath.js","./binary.js":"node_modules/ramda/es/binary.js","./bind.js":"node_modules/ramda/es/bind.js","./both.js":"node_modules/ramda/es/both.js","./call.js":"node_modules/ramda/es/call.js","./chain.js":"node_modules/ramda/es/chain.js","./clamp.js":"node_modules/ramda/es/clamp.js","./clone.js":"node_modules/ramda/es/clone.js","./comparator.js":"node_modules/ramda/es/comparator.js","./complement.js":"node_modules/ramda/es/complement.js","./compose.js":"node_modules/ramda/es/compose.js","./composeK.js":"node_modules/ramda/es/composeK.js","./composeP.js":"node_modules/ramda/es/composeP.js","./composeWith.js":"node_modules/ramda/es/composeWith.js","./concat.js":"node_modules/ramda/es/concat.js","./cond.js":"node_modules/ramda/es/cond.js","./construct.js":"node_modules/ramda/es/construct.js","./constructN.js":"node_modules/ramda/es/constructN.js","./contains.js":"node_modules/ramda/es/contains.js","./converge.js":"node_modules/ramda/es/converge.js","./countBy.js":"node_modules/ramda/es/countBy.js","./curry.js":"node_modules/ramda/es/curry.js","./curryN.js":"node_modules/ramda/es/curryN.js","./dec.js":"node_modules/ramda/es/dec.js","./defaultTo.js":"node_modules/ramda/es/defaultTo.js","./descend.js":"node_modules/ramda/es/descend.js","./difference.js":"node_modules/ramda/es/difference.js","./differenceWith.js":"node_modules/ramda/es/differenceWith.js","./dissoc.js":"node_modules/ramda/es/dissoc.js","./dissocPath.js":"node_modules/ramda/es/dissocPath.js","./divide.js":"node_modules/ramda/es/divide.js","./drop.js":"node_modules/ramda/es/drop.js","./dropLast.js":"node_modules/ramda/es/dropLast.js","./dropLastWhile.js":"node_modules/ramda/es/dropLastWhile.js","./dropRepeats.js":"node_modules/ramda/es/dropRepeats.js","./dropRepeatsWith.js":"node_modules/ramda/es/dropRepeatsWith.js","./dropWhile.js":"node_modules/ramda/es/dropWhile.js","./either.js":"node_modules/ramda/es/either.js","./empty.js":"node_modules/ramda/es/empty.js","./endsWith.js":"node_modules/ramda/es/endsWith.js","./eqBy.js":"node_modules/ramda/es/eqBy.js","./eqProps.js":"node_modules/ramda/es/eqProps.js","./equals.js":"node_modules/ramda/es/equals.js","./evolve.js":"node_modules/ramda/es/evolve.js","./filter.js":"node_modules/ramda/es/filter.js","./find.js":"node_modules/ramda/es/find.js","./findIndex.js":"node_modules/ramda/es/findIndex.js","./findLast.js":"node_modules/ramda/es/findLast.js","./findLastIndex.js":"node_modules/ramda/es/findLastIndex.js","./flatten.js":"node_modules/ramda/es/flatten.js","./flip.js":"node_modules/ramda/es/flip.js","./forEach.js":"node_modules/ramda/es/forEach.js","./forEachObjIndexed.js":"node_modules/ramda/es/forEachObjIndexed.js","./fromPairs.js":"node_modules/ramda/es/fromPairs.js","./groupBy.js":"node_modules/ramda/es/groupBy.js","./groupWith.js":"node_modules/ramda/es/groupWith.js","./gt.js":"node_modules/ramda/es/gt.js","./gte.js":"node_modules/ramda/es/gte.js","./has.js":"node_modules/ramda/es/has.js","./hasIn.js":"node_modules/ramda/es/hasIn.js","./hasPath.js":"node_modules/ramda/es/hasPath.js","./head.js":"node_modules/ramda/es/head.js","./identical.js":"node_modules/ramda/es/identical.js","./identity.js":"node_modules/ramda/es/identity.js","./ifElse.js":"node_modules/ramda/es/ifElse.js","./inc.js":"node_modules/ramda/es/inc.js","./includes.js":"node_modules/ramda/es/includes.js","./indexBy.js":"node_modules/ramda/es/indexBy.js","./indexOf.js":"node_modules/ramda/es/indexOf.js","./init.js":"node_modules/ramda/es/init.js","./innerJoin.js":"node_modules/ramda/es/innerJoin.js","./insert.js":"node_modules/ramda/es/insert.js","./insertAll.js":"node_modules/ramda/es/insertAll.js","./intersection.js":"node_modules/ramda/es/intersection.js","./intersperse.js":"node_modules/ramda/es/intersperse.js","./into.js":"node_modules/ramda/es/into.js","./invert.js":"node_modules/ramda/es/invert.js","./invertObj.js":"node_modules/ramda/es/invertObj.js","./invoker.js":"node_modules/ramda/es/invoker.js","./is.js":"node_modules/ramda/es/is.js","./isEmpty.js":"node_modules/ramda/es/isEmpty.js","./isNil.js":"node_modules/ramda/es/isNil.js","./join.js":"node_modules/ramda/es/join.js","./juxt.js":"node_modules/ramda/es/juxt.js","./keys.js":"node_modules/ramda/es/keys.js","./keysIn.js":"node_modules/ramda/es/keysIn.js","./last.js":"node_modules/ramda/es/last.js","./lastIndexOf.js":"node_modules/ramda/es/lastIndexOf.js","./length.js":"node_modules/ramda/es/length.js","./lens.js":"node_modules/ramda/es/lens.js","./lensIndex.js":"node_modules/ramda/es/lensIndex.js","./lensPath.js":"node_modules/ramda/es/lensPath.js","./lensProp.js":"node_modules/ramda/es/lensProp.js","./lift.js":"node_modules/ramda/es/lift.js","./liftN.js":"node_modules/ramda/es/liftN.js","./lt.js":"node_modules/ramda/es/lt.js","./lte.js":"node_modules/ramda/es/lte.js","./map.js":"node_modules/ramda/es/map.js","./mapAccum.js":"node_modules/ramda/es/mapAccum.js","./mapAccumRight.js":"node_modules/ramda/es/mapAccumRight.js","./mapObjIndexed.js":"node_modules/ramda/es/mapObjIndexed.js","./match.js":"node_modules/ramda/es/match.js","./mathMod.js":"node_modules/ramda/es/mathMod.js","./max.js":"node_modules/ramda/es/max.js","./maxBy.js":"node_modules/ramda/es/maxBy.js","./mean.js":"node_modules/ramda/es/mean.js","./median.js":"node_modules/ramda/es/median.js","./memoizeWith.js":"node_modules/ramda/es/memoizeWith.js","./merge.js":"node_modules/ramda/es/merge.js","./mergeAll.js":"node_modules/ramda/es/mergeAll.js","./mergeDeepLeft.js":"node_modules/ramda/es/mergeDeepLeft.js","./mergeDeepRight.js":"node_modules/ramda/es/mergeDeepRight.js","./mergeDeepWith.js":"node_modules/ramda/es/mergeDeepWith.js","./mergeDeepWithKey.js":"node_modules/ramda/es/mergeDeepWithKey.js","./mergeLeft.js":"node_modules/ramda/es/mergeLeft.js","./mergeRight.js":"node_modules/ramda/es/mergeRight.js","./mergeWith.js":"node_modules/ramda/es/mergeWith.js","./mergeWithKey.js":"node_modules/ramda/es/mergeWithKey.js","./min.js":"node_modules/ramda/es/min.js","./minBy.js":"node_modules/ramda/es/minBy.js","./modulo.js":"node_modules/ramda/es/modulo.js","./move.js":"node_modules/ramda/es/move.js","./multiply.js":"node_modules/ramda/es/multiply.js","./nAry.js":"node_modules/ramda/es/nAry.js","./negate.js":"node_modules/ramda/es/negate.js","./none.js":"node_modules/ramda/es/none.js","./not.js":"node_modules/ramda/es/not.js","./nth.js":"node_modules/ramda/es/nth.js","./nthArg.js":"node_modules/ramda/es/nthArg.js","./o.js":"node_modules/ramda/es/o.js","./objOf.js":"node_modules/ramda/es/objOf.js","./of.js":"node_modules/ramda/es/of.js","./omit.js":"node_modules/ramda/es/omit.js","./once.js":"node_modules/ramda/es/once.js","./or.js":"node_modules/ramda/es/or.js","./otherwise.js":"node_modules/ramda/es/otherwise.js","./over.js":"node_modules/ramda/es/over.js","./pair.js":"node_modules/ramda/es/pair.js","./partial.js":"node_modules/ramda/es/partial.js","./partialRight.js":"node_modules/ramda/es/partialRight.js","./partition.js":"node_modules/ramda/es/partition.js","./path.js":"node_modules/ramda/es/path.js","./pathEq.js":"node_modules/ramda/es/pathEq.js","./pathOr.js":"node_modules/ramda/es/pathOr.js","./pathSatisfies.js":"node_modules/ramda/es/pathSatisfies.js","./pick.js":"node_modules/ramda/es/pick.js","./pickAll.js":"node_modules/ramda/es/pickAll.js","./pickBy.js":"node_modules/ramda/es/pickBy.js","./pipe.js":"node_modules/ramda/es/pipe.js","./pipeK.js":"node_modules/ramda/es/pipeK.js","./pipeP.js":"node_modules/ramda/es/pipeP.js","./pipeWith.js":"node_modules/ramda/es/pipeWith.js","./pluck.js":"node_modules/ramda/es/pluck.js","./prepend.js":"node_modules/ramda/es/prepend.js","./product.js":"node_modules/ramda/es/product.js","./project.js":"node_modules/ramda/es/project.js","./prop.js":"node_modules/ramda/es/prop.js","./propEq.js":"node_modules/ramda/es/propEq.js","./propIs.js":"node_modules/ramda/es/propIs.js","./propOr.js":"node_modules/ramda/es/propOr.js","./propSatisfies.js":"node_modules/ramda/es/propSatisfies.js","./props.js":"node_modules/ramda/es/props.js","./range.js":"node_modules/ramda/es/range.js","./reduce.js":"node_modules/ramda/es/reduce.js","./reduceBy.js":"node_modules/ramda/es/reduceBy.js","./reduceRight.js":"node_modules/ramda/es/reduceRight.js","./reduceWhile.js":"node_modules/ramda/es/reduceWhile.js","./reduced.js":"node_modules/ramda/es/reduced.js","./reject.js":"node_modules/ramda/es/reject.js","./remove.js":"node_modules/ramda/es/remove.js","./repeat.js":"node_modules/ramda/es/repeat.js","./replace.js":"node_modules/ramda/es/replace.js","./reverse.js":"node_modules/ramda/es/reverse.js","./scan.js":"node_modules/ramda/es/scan.js","./sequence.js":"node_modules/ramda/es/sequence.js","./set.js":"node_modules/ramda/es/set.js","./slice.js":"node_modules/ramda/es/slice.js","./sort.js":"node_modules/ramda/es/sort.js","./sortBy.js":"node_modules/ramda/es/sortBy.js","./sortWith.js":"node_modules/ramda/es/sortWith.js","./split.js":"node_modules/ramda/es/split.js","./splitAt.js":"node_modules/ramda/es/splitAt.js","./splitEvery.js":"node_modules/ramda/es/splitEvery.js","./splitWhen.js":"node_modules/ramda/es/splitWhen.js","./startsWith.js":"node_modules/ramda/es/startsWith.js","./subtract.js":"node_modules/ramda/es/subtract.js","./sum.js":"node_modules/ramda/es/sum.js","./symmetricDifference.js":"node_modules/ramda/es/symmetricDifference.js","./symmetricDifferenceWith.js":"node_modules/ramda/es/symmetricDifferenceWith.js","./tail.js":"node_modules/ramda/es/tail.js","./take.js":"node_modules/ramda/es/take.js","./takeLast.js":"node_modules/ramda/es/takeLast.js","./takeLastWhile.js":"node_modules/ramda/es/takeLastWhile.js","./takeWhile.js":"node_modules/ramda/es/takeWhile.js","./tap.js":"node_modules/ramda/es/tap.js","./test.js":"node_modules/ramda/es/test.js","./then.js":"node_modules/ramda/es/then.js","./times.js":"node_modules/ramda/es/times.js","./toLower.js":"node_modules/ramda/es/toLower.js","./toPairs.js":"node_modules/ramda/es/toPairs.js","./toPairsIn.js":"node_modules/ramda/es/toPairsIn.js","./toString.js":"node_modules/ramda/es/toString.js","./toUpper.js":"node_modules/ramda/es/toUpper.js","./transduce.js":"node_modules/ramda/es/transduce.js","./transpose.js":"node_modules/ramda/es/transpose.js","./traverse.js":"node_modules/ramda/es/traverse.js","./trim.js":"node_modules/ramda/es/trim.js","./tryCatch.js":"node_modules/ramda/es/tryCatch.js","./type.js":"node_modules/ramda/es/type.js","./unapply.js":"node_modules/ramda/es/unapply.js","./unary.js":"node_modules/ramda/es/unary.js","./uncurryN.js":"node_modules/ramda/es/uncurryN.js","./unfold.js":"node_modules/ramda/es/unfold.js","./union.js":"node_modules/ramda/es/union.js","./unionWith.js":"node_modules/ramda/es/unionWith.js","./uniq.js":"node_modules/ramda/es/uniq.js","./uniqBy.js":"node_modules/ramda/es/uniqBy.js","./uniqWith.js":"node_modules/ramda/es/uniqWith.js","./unless.js":"node_modules/ramda/es/unless.js","./unnest.js":"node_modules/ramda/es/unnest.js","./until.js":"node_modules/ramda/es/until.js","./update.js":"node_modules/ramda/es/update.js","./useWith.js":"node_modules/ramda/es/useWith.js","./values.js":"node_modules/ramda/es/values.js","./valuesIn.js":"node_modules/ramda/es/valuesIn.js","./view.js":"node_modules/ramda/es/view.js","./when.js":"node_modules/ramda/es/when.js","./where.js":"node_modules/ramda/es/where.js","./whereEq.js":"node_modules/ramda/es/whereEq.js","./without.js":"node_modules/ramda/es/without.js","./xprod.js":"node_modules/ramda/es/xprod.js","./zip.js":"node_modules/ramda/es/zip.js","./zipObj.js":"node_modules/ramda/es/zipObj.js","./zipWith.js":"node_modules/ramda/es/zipWith.js","./thunkify.js":"node_modules/ramda/es/thunkify.js"}],"src/model.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _mithrilStream = _interopRequireDefault(require("mithril-stream"));

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = function log(m) {
  return function (v) {
    console.log(m, v);
    return v;
  };
};

var url = function url() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return "https://api.punkapi.com/v2/beers/".concat(id);
};

var beerProps = [{
  color: "#1abc9c",
  key: "pH",
  value: "ph"
}, {
  color: "#3498db",
  key: "Alcohol By Vol",
  value: "abv"
}, {
  color: "#9b59b6",
  key: "Int. Bitterness Levels",
  value: "ibu"
}, {
  color: "#34495e",
  key: "Standard Reference Method",
  value: "srm"
}, {
  color: "#f1c40f",
  key: "Target Final Gravity",
  value: "target_fg"
}, {
  color: "##2ecc71",
  key: "Target Original Gravity",
  value: "target_og"
}, {
  color: "#c0392b",
  key: "European Brewery Convention",
  value: "ebc"
}, {
  color: "#7f8c8d",
  key: "Attenuation Level",
  value: "attenuation_level"
}];

var onError = function onError(mdl, page) {
  return function (_ref) {
    var response = _ref.response;
    mdl.state.errors = (0, _ramda.map)((0, _ramda.props)(["param", "msg"]), response.data);
    mdl.state.data[page] = undefined;
  };
};

var onSuccess = function onSuccess(mdl, page) {
  return function (data) {
    mdl.state.errors = undefined;
    mdl.state.data[page] = data;
  };
};

var pagination = {
  page: 1,
  per_page: 30
};
var comparison = {
  beerList: {},
  selections: false,
  sortBy: "abv",
  modal: undefined
};
var state = {
  profile: "",
  isLoading: false,
  loadingProgress: {
    max: 0,
    value: 0
  },
  data: {},
  errors: undefined,
  view: "cards",
  current: {
    beer: undefined,
    id: undefined
  }
};

function onProgress(e) {
  if (e.lengthComputable) {
    model.state.loadingProgress.max = e.total;
    model.state.loadingProgress.value = e.loaded;

    _mithril.default.redraw();
  }
}

function onLoad() {
  return false;
}

function onLoadStart() {
  model.state.isLoading = true;
  return false;
}

function onLoadEnd() {
  model.state.isLoading = false;
  model.state.loadingProgress.max = 0;
  model.state.loadingProgress.value = 0;
  return false;
}

var xhrProgress = {
  config: function config(xhr) {
    console.log(xhr);
    xhr.onprogress = onProgress;
    xhr.onload = onLoad;
    xhr.onloadstart = onLoadStart;
    xhr.onloadend = onLoadEnd;
  }
};

var http = function http(url, params) {
  return _mithril.default.request(Object.assign(_objectSpread({
    url: url,
    params: params
  }, {
    xhrProgress: xhrProgress
  })));
};

var Model = {
  http: http,
  log: log,
  url: url,
  state: state,
  pagination: pagination,
  comparison: comparison,
  props: beerProps,
  onSuccess: onSuccess,
  onError: onError
};
var _default = Model;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","mithril-stream":"node_modules/mithril-stream/stream.mjs","ramda":"node_modules/ramda/es/index.js"}],"src/Components/Pagination/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pagination = function Pagination(_ref) {
  var _ref$attrs = _ref.attrs,
      mdl = _ref$attrs.mdl,
      load = _ref$attrs.load;

  var format = function format(state) {
    if (state.per_page <= 0) return state.per_page = 1;
    if (state.per_page >= 81) return state.per_page = 80;
  };

  var pageBack = function pageBack(mdl) {
    mdl.pagination.page == 1 ? mdl.pagination.page : mdl.pagination.page--;
    load();
  };

  var pageForward = function pageForward(mdl) {
    mdl.state.data.length == 0 ? mdl.pagination.page : mdl.pagination.page++;
    load();
  };

  return {
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return (0, _mithril.default)(".pagination", [(0, _mithril.default)("button.btn", {
        disabled: mdl.pagination.page == 1,
        onclick: function onclick() {
          return pageBack(mdl);
        }
      }, "Prev"), (0, _mithril.default)("input.input[type=number]", {
        value: mdl.pagination.per_page,
        min: 1,
        max: 80,
        onblur: function onblur() {
          return format(mdl.pagination);
        },
        onchange: function onchange(e) {
          mdl.pagination.per_page = e.target.value;
          format(mdl.pagination);
          load();
        }
      }), (0, _mithril.default)("button.btn", {
        disabled: mdl.state.data.length == 0,
        onclick: function onclick() {
          return pageForward(mdl);
        }
      }, "Next")]);
    }
  };
};

var _default = Pagination;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js"}],"src/Components/Actions.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _index = _interopRequireDefault(require("./Pagination/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Actions = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        mdl = _ref$attrs.mdl,
        load = _ref$attrs.load;
    return !mdl.comparison.selections && !mdl.state.current.beer && (0, _mithril.default)("header.container.actions", // mdl.comparison.selections || mdl.state.current.beer
    //   ? m(
    //       "button.btn",
    //       {
    //         onclick: () => {
    //           mdl.comparison.beerList = {}
    //           mdl.comparison.selections = false
    //         }
    //       },
    //       "Back to List"
    //     )
    // :
    [mdl.state.view == "cards" && [(0, _mithril.default)("button.btn", {
      disabled: !Object.values(mdl.comparison.beerList).includes(true),
      onclick: function onclick() {
        return mdl.comparison.selections = true;
      }
    }, "Compare Selected"), (0, _mithril.default)("select.select", {
      onchange: function onchange(e) {
        return mdl.comparison.sortBy = e.target.value;
      },
      value: mdl.comparison.sortBy
    }, mdl.props.map(function (prop, key) {
      return (0, _mithril.default)("option", {
        key: key,
        value: prop.value
      }, prop.key);
    }))], (0, _mithril.default)(_index.default, {
      mdl: mdl,
      load: load
    }), (0, _mithril.default)("select.select", {
      onchange: function onchange(e) {
        return mdl.state.view = e.target.value;
      },
      value: mdl.state.view
    }, [(0, _mithril.default)("option.option", {
      value: "cards"
    }, "Card View"), (0, _mithril.default)("option.option", {
      value: "charts"
    }, "Charts View")]), mdl.state.view == "charts" && [(0, _mithril.default)("ul.action-radios", mdl.props.map(function (prop, key) {
      return (0, _mithril.default)(".", [(0, _mithril.default)("input[type=radio].charts-radio", {
        key: key,
        name: prop.value,
        value: prop.value,
        id: prop.value,
        checked: prop.checked,
        onclick: function onclick() {
          return prop.checked = !prop.checked;
        }
      }), (0, _mithril.default)("label.radio-label", {
        key: key,
        for: prop.value
      }, prop.key)]);
    }))]]);
  }
};
var _default = Actions;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","./Pagination/index.js":"src/Components/Pagination/index.js"}],"src/Pages/Beers/Charts.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toLineTrace = function toLineTrace(prop, data) {
  return {
    x: data.map((0, _ramda.view)((0, _ramda.lensIndex)(1))),
    y: data.map((0, _ramda.view)((0, _ramda.lensIndex)(0))),
    mode: "lines+markers",
    name: prop[2],
    line: {
      color: prop[1],
      width: 2
    },
    marker: {
      color: prop[1],
      size: 12
    }
  };
};

var getTraceProps = (0, _ramda.compose)((0, _ramda.map)((0, _ramda.props)(["value", "color", "key"])), (0, _ramda.filter)((0, _ramda.propEq)("checked", true)));

var getData = function getData(prop, data) {
  return (0, _ramda.map)((0, _ramda.props)([prop[0], "name"]), data);
};

var makeData = function makeData(data, props) {
  return props.map(function (prop) {
    return toLineTrace(prop, getData(prop, data));
  });
};

var Charts = function Charts() {
  var toPlot = function toPlot(dom, data, props) {
    dom.style.width = window.innerWidth * 0.8;
    return Plotly.newPlot(dom, makeData(data, getTraceProps(props)), {
      title: "Brew Dog"
    });
  };

  return {
    oncreate: function oncreate(_ref) {
      var dom = _ref.dom,
          _ref$attrs = _ref.attrs,
          mdl = _ref$attrs.mdl,
          data = _ref$attrs.data;
      return toPlot(dom, data, mdl.props);
    },
    onupdate: function onupdate(_ref2) {
      var dom = _ref2.dom,
          _ref2$attrs = _ref2.attrs,
          mdl = _ref2$attrs.mdl,
          data = _ref2$attrs.data;
      return toPlot(dom, data, mdl.props);
    },
    view: function view(_ref3) {
      var mdl = _ref3.attrs.mdl;
      return [(0, _mithril.default)(".chart", {
        id: "chart"
      })];
    }
  };
};

var _default = Charts;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","ramda":"node_modules/ramda/es/index.js"}],"src/Components/BeerProfile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BeerProfile = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bar = function bar() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          label = _ref$attrs.label,
          value = _ref$attrs.value;
      return (0, _mithril.default)(".barchart-container", (0, _mithril.default)(".barchart-data", {
        style: {
          width: "".concat(value, "%")
        }
      }, (0, _mithril.default)("label.barchart-label", label)));
    }
  };
};

var BeerProfile = {
  view: function view(_ref2) {
    var beer = _ref2.attrs.beer;
    return (0, _mithril.default)(".beer-profile", [(0, _mithril.default)(".cell.row", [(0, _mithril.default)("img.img", {
      id: 1,
      src: beer.image_url
    }), (0, _mithril.default)(".cell.col", [(0, _mithril.default)(bar, {
      label: "ABV:",
      value: beer.abv
    }), (0, _mithril.default)(bar, {
      label: "IBU:",
      value: beer.ibu
    }), (0, _mithril.default)(bar, {
      label: "pH:",
      value: beer.ph
    }), (0, _mithril.default)(bar, {
      label: "SRM:",
      value: beer.srm
    })])]), (0, _mithril.default)(".cell", (0, _mithril.default)("span.name", beer.name)), (0, _mithril.default)(".cell.tagline", beer.tagline)]);
  }
};
exports.BeerProfile = BeerProfile;
var _default = BeerProfile;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js"}],"src/Pages/Beers/BeerCard.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dasher = function dasher(str) {
  return str.replace(/\s/g, "");
};

var BeerCard = function BeerCard() {
  var showInfo = false;
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          name = _ref$attrs.name,
          mdl = _ref$attrs.mdl,
          abv = _ref$attrs.abv,
          ibu = _ref$attrs.ibu,
          ph = _ref$attrs.ph,
          srm = _ref$attrs.srm,
          img = _ref$attrs.img,
          key = _ref$attrs.key;
      return (0, _mithril.default)(".beer-card", {
        onmouseover: function onmouseover(e) {
          return showInfo = true;
        },
        onmouseout: function onmouseout(e) {
          return showInfo = false;
        }
      }, [[(0, _mithril.default)("input[type=checkbox]", {
        id: "checkbox-".concat(key),
        name: "checkbox-".concat(key),
        onclick: function onclick() {
          return mdl.comparison.beerList[key] = !mdl.comparison.beerList[key];
        },
        checked: mdl.comparison.beerList[key]
      }), (0, _mithril.default)("label.label", {
        for: "checkbox-".concat(key)
      }, (0, _mithril.default)("img.img", {
        src: img
      })), (0, _mithril.default)(".beercard-footer", (0, _mithril.default)(".row", [(0, _mithril.default)(_mithril.default.route.Link, {
        class: "link",
        href: "/beer/".concat(dasher(name)),
        onclick: function onclick() {
          return mdl.state.current.id = key;
        }
      }, (0, _mithril.default)(".info.name", name))]), showInfo && [(0, _mithril.default)("cell.row", {
        onmousedown: function onmousedown() {
          return mdl.comparison.modal = key;
        },
        onmouseup: function onmouseup() {
          return mdl.comparison.modal = undefined;
        }
      }, [(0, _mithril.default)("code.cell.info", "ABV: ", abv, "%"), (0, _mithril.default)("code.cell.info", "IBU: ", ibu)]), (0, _mithril.default)("cell.row", [(0, _mithril.default)("code.cell.info", "pH: ", ph), (0, _mithril.default)("code.cell.info", "SRM: ", srm)])])],,]);
    }
  };
};

var _default = BeerCard;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js"}],"src/Pages/Beers/Cards.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _BeerProfile = _interopRequireDefault(require("../../Components/BeerProfile.js"));

var _BeerCard = _interopRequireDefault(require("./BeerCard.js"));

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseIds = function parseIds(ids) {
  return Object.keys(ids).map(function (id) {
    return parseInt(id);
  });
};

var byComparison = function byComparison(ids) {
  return function (beer) {
    return parseIds(ids).includes(beer.id);
  };
};

var CompareBeers = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        mdl = _ref$attrs.mdl,
        beers = _ref$attrs.beers;
    return (0, _mithril.default)(".container.compare-beers", beers.map(function (beer) {
      return (0, _mithril.default)(_BeerProfile.default, {
        mdl: mdl,
        beer: beer,
        key: beer.id
      });
    }));
  }
};
var BeerList = {
  view: function view(_ref2) {
    var _ref2$attrs = _ref2.attrs,
        mdl = _ref2$attrs.mdl,
        beers = _ref2$attrs.beers;
    return (0, _mithril.default)(".cards.container", beers.map(function (_ref3) {
      var name = _ref3.name,
          abv = _ref3.abv,
          ibu = _ref3.ibu,
          ph = _ref3.ph,
          srm = _ref3.srm,
          image_url = _ref3.image_url,
          id = _ref3.id;
      return (0, _mithril.default)(_BeerCard.default, {
        mdl: mdl,
        name: name,
        abv: abv,
        ibu: ibu,
        ph: ph,
        srm: srm,
        img: image_url,
        key: id
      });
    }));
  }
};

var Cards = function Cards(_ref4) {
  var mdl = _ref4.attrs.mdl;
  return {
    view: function view(_ref5) {
      var _ref5$attrs = _ref5.attrs,
          mdl = _ref5$attrs.mdl,
          sortedByProp = _ref5$attrs.sortedByProp;
      return [[mdl.comparison.modal && (0, _mithril.default)(".compare-beers.modal", (0, _mithril.default)(_BeerProfile.default, {
        beer: (0, _ramda.head)(mdl.state.data.beers.filter((0, _ramda.propEq)("id", mdl.comparison.modal)))
      }))], mdl.comparison.selections ? (0, _mithril.default)(CompareBeers, {
        mdl: mdl,
        beers: mdl.state.data.beers.filter(byComparison(mdl.comparison.beerList))
      }) : (0, _mithril.default)(BeerList, {
        mdl: mdl,
        beers: sortedByProp(mdl.state.data.beers)
      })];
    }
  };
};

var _default = Cards;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","../../Components/BeerProfile.js":"src/Components/BeerProfile.js","./BeerCard.js":"src/Pages/Beers/BeerCard.js","ramda":"node_modules/ramda/es/index.js"}],"src/Pages/Beers/model.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBeers = void 0;

var _ramda = require("ramda");

var getBeers = function getBeers(mdl) {
  return function (params) {
    return mdl.http(mdl.url(), params);
  };
};

exports.getBeers = getBeers;
var srmScale = {
  2: "",
  3: "",
  4: "",
  6: "",
  9: "",
  12: "",
  15: "",
  18: "",
  20: "",
  24: "",
  30: "",
  40: ""
};
},{"ramda":"node_modules/ramda/es/index.js"}],"src/Pages/Beers/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _Actions = _interopRequireDefault(require("../../Components/Actions.js"));

var _Charts = _interopRequireDefault(require("./Charts.js"));

var _Cards = _interopRequireDefault(require("./Cards.js"));

var _model = require("./model.js");

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Beers = function Beers(_ref) {
  var mdl = _ref.attrs.mdl;

  var load = function load() {
    return (0, _model.getBeers)(mdl)(mdl.pagination).then(mdl.onSuccess(mdl, "beers"), mdl.onError(mdl, "beers"));
  };

  return {
    oninit: load,
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;

      if (mdl.state.data.beers) {
        var sortedByProp = (0, _ramda.sortBy)((0, _ramda.prop)(mdl.comparison.sortBy));
        return [(0, _mithril.default)(_Actions.default, {
          mdl: mdl,
          load: load
        }), mdl.state.view == "cards" ? (0, _mithril.default)(_Cards.default, {
          mdl: mdl,
          sortedByProp: sortedByProp
        }) : (0, _mithril.default)(_Charts.default, {
          mdl: mdl,
          data: mdl.state.data.beers
        })];
      }
    }
  };
};

var _default = Beers;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","../../Components/Actions.js":"src/Components/Actions.js","./Charts.js":"src/Pages/Beers/Charts.js","./Cards.js":"src/Pages/Beers/Cards.js","./model.js":"src/Pages/Beers/model.js","ramda":"node_modules/ramda/es/index.js"}],"src/Pages/Beer/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _BeerProfile = _interopRequireDefault(require("../../Components/BeerProfile.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Beer = function Beer(_ref) {
  var mdl = _ref.attrs.mdl;

  var load = function load() {
    return mdl.http(mdl.url(mdl.state.current.id)).then(function (data) {
      mdl.onSuccess(mdl, "beer")(data);
      console.log(mdl.state.data.beer[0]);
    }, mdl.onError(mdl, "beer"));
  };

  return {
    oninit: load,
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return mdl.state.data.beer && (0, _mithril.default)(".beer-container", [(0, _mithril.default)(_BeerProfile.default, {
        mdl: mdl,
        beer: mdl.state.data.beer[0],
        key: mdl.state.current.id
      })]);
    },
    onremove: function onremove() {
      mdl.state.current.beer = undefined;
      mdl.state.data.beer = undefined;
      mdl.state.current.id = undefined;
    }
  };
};

var _default = Beer;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","../../Components/BeerProfile.js":"src/Components/BeerProfile.js"}],"src/App.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _index = _interopRequireDefault(require("./Pages/Beers/index.js"));

var _index2 = _interopRequireDefault(require("./Pages/Beer/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Errors = function Errors(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view() {
      return mdl.state.errors.map(function (err, key) {
        return (0, _mithril.default)("code.error", {
          key: key
        }, err);
      });
    }
  };
};

var Header = {
  view: function view(_ref2) {
    var mdl = _ref2.attrs.mdl;
    return (mdl.comparison.selections || mdl.state.current.beer) && (0, _mithril.default)("header.container.actions", [(0, _mithril.default)("button.btn", {
      onclick: function onclick() {
        mdl.comparison.beerList = {};
        mdl.comparison.selections = false;

        _mithril.default.route.set("/beers");
      }
    }, "Back to List")]);
  }
};
var Body = {
  view: function view(_ref3) {
    var mdl = _ref3.attrs.mdl,
        children = _ref3.children;
    return [children, mdl.state.errors && (0, _mithril.default)(Errors, {
      mdl: mdl
    })];
  }
};
var Layout = {
  view: function view(_ref4) {
    var children = _ref4.children,
        mdl = _ref4.attrs.mdl;
    return (0, _mithril.default)(".app", [(0, _mithril.default)(Header, {
      mdl: mdl
    }), (0, _mithril.default)(Body, {
      mdl: mdl
    }, children)]);
  }
};

var App = function App(mdl) {
  return {
    "/beers": {
      render: function render() {
        return (0, _mithril.default)(Layout, {
          mdl: mdl
        }, (0, _mithril.default)(_index.default, {
          mdl: mdl
        }));
      }
    },
    "/beer/:name": {
      onmatch: function onmatch(_ref5) {
        var name = _ref5.name;
        mdl.state.current.id ? mdl.state.current.beer = name : _mithril.default.route.set("/beers");
      },
      render: function render() {
        return (0, _mithril.default)(Layout, {
          mdl: mdl
        }, (0, _mithril.default)(_index2.default, {
          mdl: mdl
        }));
      }
    }
  };
};

var _default = App;
exports.default = _default;
},{"mithril":"node_modules/mithril/index.js","./Pages/Beers/index.js":"src/Pages/Beers/index.js","./Pages/Beer/index.js":"src/Pages/Beer/index.js"}],"../../../../.config/yarn/global/node_modules/parcel/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../../../../.config/yarn/global/node_modules/parcel/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"../../../../.config/yarn/global/node_modules/parcel/src/builtins/bundle-url.js"}],"index.scss":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"../../../../.config/yarn/global/node_modules/parcel/src/builtins/css-loader.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _model = _interopRequireDefault(require("./src/model.js"));

var _App = _interopRequireDefault(require("./src/App.js"));

require("./index.scss");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (module.hot) {
  module.hot.accept();
}

if ("development" !== "production") {
  console.log("Looks like we are in development mode!");
}

function getProfile(w) {
  if (w < 668) return "phone";
  if (w < 920) return "tablet";
  return "desktop";
} // Styles


var winW = window.innerWidth;
_model.default.state.profile = getProfile(winW);

function checkWidth() {
  var w = window.innerWidth;

  if (winW !== w) {
    winW = w;
    var lastProfile = _model.default.state.profile;
    _model.default.state.profile = getProfile(w);
    if (lastProfile != _model.default.state.profile) _mithril.default.redraw();
  }

  requestAnimationFrame(checkWidth);
}

checkWidth();
var root = document.body;

_mithril.default.route(root, "/beers", (0, _App.default)(_model.default));
},{"mithril":"node_modules/mithril/index.js","./src/model.js":"src/model.js","./src/App.js":"src/App.js","./index.scss":"index.scss"}],"../../../../.config/yarn/global/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53266" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../.config/yarn/global/node_modules/parcel/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/brew-dog.e31bb0bc.js.map