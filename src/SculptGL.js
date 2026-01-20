/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports["sculptgl"] = factory();
  else
    root["sculptgl"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/  var __webpack_modules__ = ({

/***/ "./lib/sketchfab-oauth2-1.2.0.js":
/*!***************************************!*\
  !*** ./lib/sketchfab-oauth2-1.2.0.js ***!
  \***************************************/
/***/ (module) {

eval("{!function(e,t){ true?module.exports=t():0}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p=\"\",t(0)}([function(e,t,n){function r(e){if(!e)throw new Error(\"SketchfabOAuth2 config is missing.\");if(e.hasOwnProperty(\"hostname\")||(e.hostname=\"sketchfab.com\"),!e.hasOwnProperty(\"client_id\"))throw new Error(\"client_id is missing. Please check the config of SketchfabOAuth2.\");if(!e.hasOwnProperty(\"redirect_uri\"))throw new Error(\"redirect_uri is missing. Please check the config of SketchfabOAuth2.\");this.config=e}n(5);var i=n(2),o=n(6),c=o.buildQueryString,u=o.parseQueryString;r.prototype.connect=function(e){return new i(function(t,n){if(!this.config.client_id)return void n(new Error(\"client_id is missing.\"));var r={response_type:\"token\",state:+new Date,client_id:this.config.client_id,redirect_uri:this.config.redirect_uri},i=Object.assign({},r,e),o=\"https://\"+this.config.hostname+\"/oauth2/authorize/?\"+c(i),a=window.open(o,\"loginWindow\",\"width=640,height=400\"),s=setInterval(function(){try{var e=a.location.href;if(void 0===e)return clearInterval(s),void n(new Error(\"Access denied (User closed popup)\"));if(e.indexOf(\"?error=access_denied\")!==-1)return clearInterval(s),void n(new Error(\"Access denied (User canceled)\"));if(e.indexOf(this.config.redirect_uri)!==-1){clearInterval(s);var r,i=a.location.hash,o=RegExp(\"access_token=([^&]+)\");return i.match(o)?(r=u(i.substring(1)),void t(r)):void n(new Error(\"Access denied (missing token)\"))}}catch(e){}}.bind(this),1e3)}.bind(this))},e.exports=r},function(e,t){function n(){throw new Error(\"setTimeout has not been defined\")}function r(){throw new Error(\"clearTimeout has not been defined\")}function i(e){if(f===setTimeout)return setTimeout(e,0);if((f===n||!f)&&setTimeout)return f=setTimeout,setTimeout(e,0);try{return f(e,0)}catch(t){try{return f.call(null,e,0)}catch(t){return f.call(this,e,0)}}}function o(e){if(l===clearTimeout)return clearTimeout(e);if((l===r||!l)&&clearTimeout)return l=clearTimeout,clearTimeout(e);try{return l(e)}catch(t){try{return l.call(null,e)}catch(t){return l.call(this,e)}}}function c(){m&&h&&(m=!1,h.length?p=h.concat(p):v=-1,p.length&&u())}function u(){if(!m){var e=i(c);m=!0;for(var t=p.length;t;){for(h=p,p=[];++v<t;)h&&h[v].run();v=-1,t=p.length}h=null,m=!1,o(e)}}function a(e,t){this.fun=e,this.array=t}function s(){}var f,l,d=e.exports={};!function(){try{f=\"function\"==typeof setTimeout?setTimeout:n}catch(e){f=n}try{l=\"function\"==typeof clearTimeout?clearTimeout:r}catch(e){l=r}}();var h,p=[],m=!1,v=-1;d.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];p.push(new a(e,t)),1!==p.length||m||i(u)},a.prototype.run=function(){this.fun.apply(null,this.array)},d.title=\"browser\",d.browser=!0,d.env={},d.argv=[],d.version=\"\",d.versions={},d.on=s,d.addListener=s,d.once=s,d.off=s,d.removeListener=s,d.removeAllListeners=s,d.emit=s,d.prependListener=s,d.prependOnceListener=s,d.listeners=function(e){return[]},d.binding=function(e){throw new Error(\"process.binding is not supported\")},d.cwd=function(){return\"/\"},d.chdir=function(e){throw new Error(\"process.chdir is not supported\")},d.umask=function(){return 0}},function(e,t,n){(function(t){\"use strict\";function n(){}function r(e,t){return function(){e.apply(t,arguments)}}function i(e){if(!(this instanceof i))throw new TypeError(\"Promises must be constructed via new\");if(\"function\"!=typeof e)throw new TypeError(\"not a function\");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(e,this)}function o(e,t){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(t):(e._handled=!0,void i._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null===n)return void(1===e._state?c:u)(t.promise,e._value);var r;try{r=n(e._value)}catch(e){return void u(t.promise,e)}c(t.promise,r)}))}function c(e,t){try{if(t===e)throw new TypeError(\"A promise cannot be resolved with itself.\");if(t&&(\"object\"==typeof t||\"function\"==typeof t)){var n=t.then;if(t instanceof i)return e._state=3,e._value=t,void a(e);if(\"function\"==typeof n)return void f(r(n,t),e)}e._state=1,e._value=t,a(e)}catch(t){u(e,t)}}function u(e,t){e._state=2,e._value=t,a(e)}function a(e){2===e._state&&0===e._deferreds.length&&i._immediateFn(function(){e._handled||i._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function s(e,t,n){this.onFulfilled=\"function\"==typeof e?e:null,this.onRejected=\"function\"==typeof t?t:null,this.promise=n}function f(e,t){var n=!1;try{e(function(e){n||(n=!0,c(t,e))},function(e){n||(n=!0,u(t,e))})}catch(e){if(n)return;n=!0,u(t,e)}}var l=setTimeout;i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){var r=new this.constructor(n);return o(this,new s(e,t,r)),r},i.prototype.finally=function(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})},i.all=function(e){return new i(function(t,n){function r(e,c){try{if(c&&(\"object\"==typeof c||\"function\"==typeof c)){var u=c.then;if(\"function\"==typeof u)return void u.call(c,function(t){r(e,t)},n)}i[e]=c,0===--o&&t(i)}catch(e){n(e)}}if(!e||\"undefined\"==typeof e.length)throw new TypeError(\"Promise.all accepts an array\");var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var o=i.length,c=0;c<i.length;c++)r(c,i[c])})},i.resolve=function(e){return e&&\"object\"==typeof e&&e.constructor===i?e:new i(function(t){t(e)})},i.reject=function(e){return new i(function(t,n){n(e)})},i.race=function(e){return new i(function(t,n){for(var r=0,i=e.length;r<i;r++)e[r].then(t,n)})},i._immediateFn=\"function\"==typeof t&&function(e){t(e)}||function(e){l(e,0)},i._unhandledRejectionFn=function(e){\"undefined\"!=typeof console&&console&&console.warn(\"Possible Unhandled Promise Rejection:\",e)},e.exports=i}).call(t,n(4).setImmediate)},function(e,t,n){(function(e,t){!function(e,n){\"use strict\";function r(e){\"function\"!=typeof e&&(e=new Function(\"\"+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var r={callback:e,args:t};return m[p]=r,h(p),p++}function i(e){delete m[e]}function o(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}function c(e){if(v)setTimeout(c,0,e);else{var t=m[e];if(t){v=!0;try{o(t)}finally{i(e),v=!1}}}}function u(){h=function(e){t.nextTick(function(){c(e)})}}function a(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage(\"\",\"*\"),e.onmessage=n,t}}function s(){var t=\"setImmediate$\"+Math.random()+\"$\",n=function(n){n.source===e&&\"string\"==typeof n.data&&0===n.data.indexOf(t)&&c(+n.data.slice(t.length))};e.addEventListener?e.addEventListener(\"message\",n,!1):e.attachEvent(\"onmessage\",n),h=function(n){e.postMessage(t+n,\"*\")}}function f(){var e=new MessageChannel;e.port1.onmessage=function(e){var t=e.data;c(t)},h=function(t){e.port2.postMessage(t)}}function l(){var e=y.documentElement;h=function(t){var n=y.createElement(\"script\");n.onreadystatechange=function(){c(t),n.onreadystatechange=null,e.removeChild(n),n=null},e.appendChild(n)}}function d(){h=function(e){setTimeout(c,0,e)}}if(!e.setImmediate){var h,p=1,m={},v=!1,y=e.document,g=Object.getPrototypeOf&&Object.getPrototypeOf(e);g=g&&g.setTimeout?g:e,\"[object process]\"==={}.toString.call(e.process)?u():a()?s():e.MessageChannel?f():y&&\"onreadystatechange\"in y.createElement(\"script\")?l():d(),g.setImmediate=r,g.clearImmediate=i}}(\"undefined\"==typeof self?\"undefined\"==typeof e?this:e:self)}).call(t,function(){return this}(),n(1))},function(e,t,n){(function(e){function r(e,t){this._id=e,this._clearFn=t}var i=Function.prototype.apply;t.setTimeout=function(){return new r(i.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new r(i.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},n(3),t.setImmediate=\"undefined\"!=typeof self&&self.setImmediate||\"undefined\"!=typeof e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate=\"undefined\"!=typeof self&&self.clearImmediate||\"undefined\"!=typeof e&&e.clearImmediate||this&&this.clearImmediate}).call(t,function(){return this}())},function(e,t){\"function\"!=typeof Object.assign&&Object.defineProperty(Object,\"assign\",{value:function(e,t){\"use strict\";if(null==e)throw new TypeError(\"Cannot convert undefined or null to object\");for(var n=Object(e),r=1;r<arguments.length;r++){var i=arguments[r];if(null!=i)for(var o in i)Object.prototype.hasOwnProperty.call(i,o)&&(n[o]=i[o])}return n},writable:!0,configurable:!0})},function(e,t){function n(e){var t={};return e.split(\"&\").forEach(function(e){var n=e.split(\"=\");t[n[0]]=decodeURIComponent(n[1])}),t}function r(e){for(var t=Object.keys(e),n=[],r=0,i=t.length;r<i;r++)n.push(t[r]+\"=\"+encodeURIComponent(e[t[r]]));return n.join(\"&\")}e.exports={parseQueryString:n,buildQueryString:r}}])});\n\n//# sourceURL=webpack://sculptgl/./lib/sketchfab-oauth2-1.2.0.js?\n}");
 ( p === RGB_ETC2_Format || p === RGBA_ETC2_EAC_Format ) {

		extension = extensions.get( 'WEBGL_compressed_texture_etc' );

		if ( extension !== null ) {

			if ( p === RGB_ETC2_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ETC2 : extension.COMPRESSED_RGB8_ETC2;
			if ( p === RGBA_ETC2_EAC_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : extension.COMPRESSED_RGBA8_ETC2_EAC;

		} else {

			return null;

		}

	}

	// ASTC

	if ( p === RGBA_ASTC_4x4_Format || p === RGBA_ASTC_5x4_Format || p === RGBA_ASTC_5x5_Format ||
		p === RGBA_ASTC_6x5_Format || p === RGBA_ASTC_6x6_Format || p === RGBA_ASTC_8x5_Format ||
		p === RGBA_ASTC_8x6_Format || p === RGBA_ASTC_8x8_Format || p === RGBA_ASTC_10x5_Format ||
		p === RGBA_ASTC_10x6_Format || p === RGBA_ASTC_10x8_Format || p === RGBA_ASTC_10x10_Format ||
		p === RGBA_ASTC_12x10_Format || p === RGBA_ASTC_12x12_Format ) {

		extension = extensions.get( 'WEBGL_compressed_texture_astc' );

		if ( extension !== null ) {

			if ( p === RGBA_ASTC_4x4_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
			if ( p === RGBA_ASTC_5x4_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : extension.COMPRESSED_RGBA_ASTC_5x4_KHR;
			if ( p === RGBA_ASTC_5x5_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : extension.COMPRESSED_RGBA_ASTC_5x5_KHR;
			if ( p === RGBA_ASTC_6x5_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : extension.COMPRESSED_RGBA_ASTC_6x5_KHR;
			if ( p === RGBA_ASTC_6x6_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : extension.COMPRESSED_RGBA_ASTC_6x6_KHR;
			if ( p === RGBA_ASTC_8x5_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : extension.COMPRESSED_RGBA_ASTC_8x5_KHR;
			if ( p === RGBA_ASTC_8x6_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : extension.COMPRESSED_RGBA_ASTC_8x6_KHR;
			if ( p === RGBA_ASTC_8x8_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : extension.COMPRESSED_RGBA_ASTC_8x8_KHR;
			if ( p === RGBA_ASTC_10x5_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : extension.COMPRESSED_RGBA_ASTC_10x5_KHR;
			if ( p === RGBA_ASTC_10x6_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : extension.COMPRESSED_RGBA_ASTC_10x6_KHR;
			if ( p === RGBA_ASTC_10x8_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : extension.COMPRESSED_RGBA_ASTC_10x8_KHR;
			if ( p === RGBA_ASTC_10x10_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : extension.COMPRESSED_RGBA_ASTC_10x10_KHR;
			if ( p === RGBA_ASTC_12x10_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : extension.COMPRESSED_RGBA_ASTC_12x10_KHR;
			if ( p === RGBA_ASTC_12x12_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : extension.COMPRESSED_RGBA_ASTC_12x12_KHR;

		} else {

			return null;

		}

	}

	// BPTC

	if ( p === RGBA_BPTC_Format || p === RGB_BPTC_SIGNED_Format || p === RGB_BPTC_UNSIGNED_Format ) {

		extension = extensions.get( 'EXT_texture_compression_bptc' );

		if ( extension !== null ) {

			if ( p === RGBA_BPTC_Format ) return ( transfer === SRGBTransfer ) ? extension.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
			if ( p === RGB_BPTC_SIGNED_Format ) return extension.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
			if ( p === RGB_BPTC_UNSIGNED_Format ) return extension.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;

		} else {

			return null;

		}

	}

	// RGTC

	if ( p === RED_RGTC1_Format || p === SIGNED_RED_RGTC1_Format || p === RED_GREEN_RGTC2_Format || p === SIGNED_RED_GREEN_RGTC2_Format ) {

		extension = extensions.get( 'EXT_texture_compression_rgtc' );

		if ( extension !== null ) {

			if ( p === RGBA_BPTC_Format ) return extension.COMPRESSED_RED_RGTC1_EXT;
			if ( p === SIGNED_RED_RGTC1_Format ) return extension.COMPRESSED_SIGNED_RED_RGTC1_EXT;
			if ( p === RED_GREEN_RGTC2_Format ) return extension.COMPRESSED_RED_GREEN_RGTC2_EXT;
			if ( p === SIGNED_RED_GREEN_RGTC2_Format ) return extension.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;

		} else {

			return null;

		}

	}

	//

	if ( p === UnsignedInt248Type ) {

		if ( isWebGL2 ) return gl.UNSIGNED_INT_24_8;

		extension = extensions.get( 'WEBGL_depth_texture' );

		if ( extension !== null ) {

			return extension.UNSIGNED_INT_24_8_WEBGL;

		} else {

			return null;

		}

	}

	// if "p" can't be resolved, assume the user defines a WebGL constant as a string (fallback/workaround for packed RGB formats)

	return ( gl[ p ] !== undefined ) ? gl[ p ] : null;

}

return { convert: convert };

}

class ArrayCamera extends PerspectiveCamera {

	constructor( array = [] ) {

		super();

		this.isArrayCamera = true;

		this.cameras = array;

	}

}

class Group extends Object3D {

	constructor() {

		super();

		this.isGroup = true;

		this.type = 'Group';

	}

}

const _moveEvent = { type: 'move' };

class WebXRController {

	constructor() {

		this._targetRay = null;
		this._grip = null;
		this._hand = null;

	}

	getHandSpace() {

		if ( this._hand === null ) {

			this._hand = new Group();
			this._hand.matrixAutoUpdate = false;
			this._hand.visible = false;

			this._hand.joints = {};
			this._hand.inputState = { pinching: false };

		}

		return this._hand;

	}

	getTargetRaySpace() {

		if ( this._targetRay === null ) {

			this._targetRay = new Group();
			this._targetRay.matrixAutoUpdate = false;
			this._targetRay.visible = false;
			this._targetRay.hasLinearVelocity = false;
			this._targetRay.linearVelocity = new Vector3();
			this._targetRay.hasAngularVelocity = false;
			this._targetRay.angularVelocity = new Vector3();

		}

		return this._targetRay;

	}
    !*** ./src/files/ExportMaterialise.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var zip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zip */ \"./lib/zip.js\");
/* harmony import */ var zip__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(zip__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var files_ExportSTL__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! files/ExportSTL */ \"./src/files/ExportSTL.js\");



var Export = {};

Export.exportMaterialise = function (main, statusWidget) {
  var xhr = new XMLHttpRequest();
  // xhr.open('POST', 'https://i.materialise.com/upload', true);
  // xhr.open('POST', 'uploadMaterialise.php', true);
  xhr.open('POST', 'https://i.materialise.com/web-api/tool/20cc0fd6-3cef-4111-a201-0b87026d892c/model', true);

  xhr.onprogress = function (event) {
    if (event.lengthComputable && event.total) {
      var val = Math.round(event.loaded * 100.0 / event.total);
      statusWidget.setMessage('Materialise upload: ' + val + '%');
    }
  };

  var hideStatus = function () {
    statusWidget.setMessage('');
  };
  xhr.onerror = hideStatus;
  xhr.onabort = hideStatus;

  xhr.onload = function () {
    hideStatus();

    if (xhr.status === 200) {
      var json = JSON.parse(xhr.responseText);
      window.open('https://i.materialise.com/en/3dprint#modelId=' + json.modelID, '_blank');
    }
  };

  var meshes = main.getMeshes();
  var box = main.computeBoundingBoxMeshes(meshes);
  var radius = main.computeRadiusFromBoundingBox(box);
  var data = files_ExportSTL__WEBPACK_IMPORTED_MODULE_1__["default"].exportBinarySTL(meshes, { colorMagic: true, swapXY: true });

  // var blob = new Blob([data], { type: 'application/octet-stream' });
  // Export.exportFileMaterialise(radius, xhr, domStatus, blob);

  statusWidget.setMessage('Creating zip...');
  zip__WEBPACK_IMPORTED_MODULE_0__.zip.useWebWorkers = true;
  zip__WEBPACK_IMPORTED_MODULE_0__.zip.workerScriptsPath = 'worker/';
  zip__WEBPACK_IMPORTED_MODULE_0__.zip.createWriter(new zip__WEBPACK_IMPORTED_MODULE_0__.zip.BlobWriter('application/zip'), function (zipWriter) {
    zipWriter.add('yourMesh.stl', new zip__WEBPACK_IMPORTED_MODULE_0__.zip.BlobReader(data), function () {
      zipWriter.close(Export.exportFileMaterialise.bind(this, radius, xhr, statusWidget));
    });
  }, onerror);

  return xhr;
};

Export.exportFileMaterialise = function (radius, xhr, statusWidget, blob) {
  if (xhr.isAborted) return;

  var fd = new FormData();
  fd.append('file', blob, 'yourMesh.zip');
  // fd.append('scale', 100 * 4.0 / radius);
  // fd.append('useAjax', 'true');
  // fd.append('plugin', '');
  // fd.append('forceEmbedding', false);

  statusWidget.setMessage('Materialise upload...');
  xhr.send(fd);
};
/***/ "./src/mesh/meshStatic/MeshStatic.js"
/*!*******************************************!*\
  !*** ./src/mesh/meshStatic/MeshStatic.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var mesh_Mesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mesh/Mesh */ \"./src/mesh/Mesh.js\");
/* harmony import */ var mesh_TransformData__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mesh/TransformData */ \"./src/mesh/TransformData.js\");
/* harmony import */ var mesh_MeshData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mesh/MeshData */ \"./src/mesh/MeshData.js\");
/* harmony import */ var mesh_RenderData__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mesh/RenderData */ \"./src/mesh/RenderData.js\");



class MeshStatic extends mesh_Mesh__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor(gl) {
    super();

    this._id = mesh_Mesh__WEBPACK_IMPORTED_MODULE_0__["default"].ID++; // useful id to retrieve a mesh (dynamic mesh, multires mesh, voxel mesh)

    if (gl) this._renderData = new mesh_RenderData__WEBPACK_IMPORTED_MODULE_3__["default"](gl, this);
    this._meshData = new mesh_MeshData__WEBPACK_IMPORTED_MODULE_2__["default"]();
    this._transformData = new mesh_TransformData__WEBPACK_IMPORTED_MODULE_1__["default"]();
  }
}




