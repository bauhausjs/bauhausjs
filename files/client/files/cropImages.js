/* pica 1.0.7 nodeca/pica */
!function(r){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=r();else if("function"==typeof define&&define.amd)define([],r);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.pica=r()}}(function(){return function r(t,e,n){function o(a,u){if(!e[a]){if(!t[a]){var f="function"==typeof require&&require;if(!u&&f)return f(a,!0);if(i)return i(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var h=e[a]={exports:{}};t[a][0].call(h.exports,function(r){var e=t[a][1][r];return o(e?e:r)},h,h.exports,r,t,e,n)}return e[a].exports}for(var i="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({"./":[function(r,t,e){"use strict";function n(r){return Object.prototype.toString.call(r)}function o(r){return"[object Function]"===n(r)}function i(t,n){var o,i={src:t.src,dest:null,width:0|t.width,height:0|t.height,toWidth:0|t.toWidth,toHeight:0|t.toHeight,quality:t.quality,alpha:t.alpha,unsharpAmount:t.unsharpAmount,unsharpThreshold:t.unsharpThreshold};return u&&e.WW?(o=r("webworkify")(l),o.onmessage=function(r){var e,i,a=t.dest,u=r.data.output;if(a)if(a.set)a.set(u);else for(e=0,i=u.length;i>e;e++)a[e]=u[e];n(r.data.err,u),o.terminate()},t.transferable?o.postMessage(i,[t.src.buffer]):o.postMessage(i),o):(i.dest=t.dest,void h(i,n))}function a(r,t,e,n){var a=r.width,u=r.height,f=t.width,s=t.height;o(e)&&(n=e,e={}),isNaN(e)||(e={quality:e,alpha:!1});var h=t.getContext("2d"),l=h.getImageData(0,0,f,s),c={src:r.getContext("2d").getImageData(0,0,a,u).data,dest:l.data,width:r.width,height:r.height,toWidth:t.width,toHeight:t.height,quality:e.quality,alpha:e.alpha,unsharpAmount:e.unsharpAmount,unsharpThreshold:e.unsharpThreshold,transferable:!0};return i(c,function(r){return r?void n(r):(h.putImageData(l,0,0),void n())})}var u="undefined"!=typeof window&&"Worker"in window;if(u)try{var f=r("webworkify")(function(){});f.terminate()}catch(s){u=!1}var h=r("./lib/resize"),l=r("./lib/resize_worker");e.resizeBuffer=i,e.resizeCanvas=a,e.WW=u},{"./lib/resize":4,"./lib/resize_worker":5,webworkify:6}],1:[function(r,t){"use strict";function e(r,t,e,n,i){var f,s,h,l,c,d,p,v=0,g=o,w=a;if(d=0,p=0,t>=w&&e>=w&&n>t+w&&i>e+w){for(s=0;3>s;s++)for(f=0;3>f;f++)h=t+f-w,l=e+s-w,p+=r[h+l*n]*g[v++];return(p-p%u)/u}for(s=0;3>s;s++)for(f=0;3>f;f++)h=t+f-w,l=e+s-w,h>=0&&n>h&&l>=0&&i>l&&(c=g[v],d+=c,p+=r[h+l*n]*c),v++;return(p-p%d)/d|0}function n(r,t,n){var o,i,a=new Uint16Array(r.length);for(o=0;t>o;o++)for(i=0;n>i;i++)a[i*t+o]=e(r,o,i,t,n);return a}for(var o=new Uint8Array([1,2,1,2,4,2,1,2,1]),i=Math.floor(Math.sqrt(o.length)),a=Math.floor(i/2),u=0,f=0;f<o.length;f++)u+=o[f];t.exports=n},{}],2:[function(r,t){"use strict";function e(r){return 0>r?0:r>255?255:r}function n(r){return Math.floor(r*l)}function o(r,t,e){var o,i,a,u,f,s,h,l,d,p,v,g,w,y,M,m,b,x=c[r].filter,q=e/t,A=1/q,k=Math.min(1,q),z=c[r].win/k,W=Math.floor(2*(z+1)),U=new Int16Array((W+2)*e),j=0;for(o=0;e>o;o++){for(i=(o+.5)*A,a=Math.max(0,Math.floor(i-z)),u=Math.min(t-1,Math.ceil(i+z)),f=u-a+1,s=new Float32Array(f),h=new Int16Array(f),l=0,p=a,v=0;u>=p;p++,v++)g=x((p+.5-i)*k),l+=g,s[v]=g;for(d=0,v=0;v<s.length;v++)w=n(s[v]/l),d+=w,h[v]=w;for(h[e>>1]+=n(1)-d,y=0;y<h.length&&0===h[y];)y++;if(y<h.length){for(M=h.length-1;M>0&&0===h[M];)M--;m=a+y,b=M-y+1,U[j++]=m,U[j++]=b,U.set(h.subarray(y,M+1),j),j+=b}else U[j++]=0,U[j++]=0}return U}function i(r,t,n,o,i,a){var u,f,s,h,l,c,d,p,v,g,w,y=0,M=0;for(v=0;o>v;v++){for(l=0,g=0;i>g;g++){for(c=a[l++],d=a[l++],p=y+4*c|0,u=f=s=h=0;d>0;d--)w=a[l++],h=h+w*r[p+3]|0,s=s+w*r[p+2]|0,f=f+w*r[p+1]|0,u=u+w*r[p]|0,p=p+4|0;t[M+3]=e(h>>14),t[M+2]=e(s>>14),t[M+1]=e(f>>14),t[M]=e(u>>14),M=M+4*o|0}M=4*(v+1)|0,y=(v+1)*n*4|0}}function a(r,t,n,o,i,a){var u,f,s,h,l,c,d,p,v,g,w,y=0,M=0;for(v=0;o>v;v++){for(l=0,g=0;i>g;g++){for(c=a[l++],d=a[l++],p=y+4*c|0,u=f=s=h=0;d>0;d--)w=a[l++],h=h+w*r[p+3]|0,s=s+w*r[p+2]|0,f=f+w*r[p+1]|0,u=u+w*r[p]|0,p=p+4|0;t[M+3]=e(h>>14),t[M+2]=e(s>>14),t[M+1]=e(f>>14),t[M]=e(u>>14),M=M+4*o|0}M=4*(v+1)|0,y=(v+1)*n*4|0}}function u(r,t,e){for(var n=3,o=t*e*4|0;o>n;)r[n]=255,n=n+4|0}function f(r){var t=r.src,e=r.width,n=r.height,f=r.toWidth,h=r.toHeight,l=r.dest||new Uint8Array(f*h*4),c=void 0===r.quality?3:r.quality,d=r.alpha||!1,p=void 0===r.unsharpAmount?0:0|r.unsharpAmount,v=void 0===r.unsharpThreshold?0:0|r.unsharpThreshold;if(1>e||1>n||1>f||1>h)return[];var g=o(c,e,f),w=o(c,n,h),y=new Uint8Array(f*n*4);return i(t,y,e,n,f,g),a(y,l,n,f,h,w),d||u(l,f,h),p&&s(l,f,h,p,1,v),l}var s=r("./unsharp"),h=14,l=1<<h,c=[{win:.5,filter:function(r){return r>=-.5&&.5>r?1:0}},{win:1,filter:function(r){if(-1>=r||r>=1)return 0;if(r>-1.1920929e-7&&1.1920929e-7>r)return 1;var t=r*Math.PI;return Math.sin(t)/t*(.54+.46*Math.cos(t/1))}},{win:2,filter:function(r){if(-2>=r||r>=2)return 0;if(r>-1.1920929e-7&&1.1920929e-7>r)return 1;var t=r*Math.PI;return Math.sin(t)/t*Math.sin(t/2)/(t/2)}},{win:3,filter:function(r){if(-3>=r||r>=3)return 0;if(r>-1.1920929e-7&&1.1920929e-7>r)return 1;var t=r*Math.PI;return Math.sin(t)/t*Math.sin(t/3)/(t/3)}}];t.exports=f},{"./unsharp":3}],3:[function(r,t){"use strict";function e(r){return 0>r?0:r>255?255:r}function n(r,t,e){var n,o,i=t*e,a=new Uint16Array(i);for(n=0,o=0;i>n;n++)a[n]=7471*r[o+2]+38470*r[o+1]+19595*r[o]>>>8,o=o+4|0;return a}function o(r,t,o,a,u,f){var s,h,l,c,d,p=0,v=Math.floor(256*a/50),g=n(r,t,o),w=i(g,t,o,1),y=f<<8,M=0;for(h=0;o>h;h++)for(s=0;t>s;s++)p=g[M]-w[M],Math.abs(p)>y&&(c=65536+(p*v>>8),d=4*M,l=r[d],r[d++]=e(l*c>>16),l=r[d],r[d++]=e(l*c>>16),l=r[d],r[d]=e(l*c>>16)),M++}var i=r("./blur");t.exports=o},{"./blur":1}],4:[function(r,t){"use strict";var e=r("./pure/resize");t.exports=function(r,t){var n=e(r);t(null,n)}},{"./pure/resize":2}],5:[function(r,t){"use strict";t.exports=function(t){var e=r("./resize");t.onmessage=function(r){e(r.data,function(r,e){return r?void t.postMessage({err:r}):void t.postMessage({output:e},[e.buffer])})}}},{"./resize":4}],6:[function(r,t){var e=arguments[3],n=arguments[4],o=arguments[5],i=JSON.stringify;t.exports=function(r){for(var t,a=Object.keys(o),u=0,f=a.length;f>u;u++){var s=a[u];if(o[s].exports===r){t=s;break}}if(!t){t=Math.floor(Math.pow(16,8)*Math.random()).toString(16);for(var h={},u=0,f=a.length;f>u;u++){var s=a[u];h[s]=s}n[t]=[Function(["require","module","exports"],"("+r+")(self)"),h]}var l=Math.floor(Math.pow(16,8)*Math.random()).toString(16),c={};c[t]=t,n[l]=[Function(["require"],"require("+i(t)+")(self)"),c];var d="("+e+")({"+Object.keys(n).map(function(r){return i(r)+":["+n[r][0]+","+i(n[r][1])+"]"}).join(",")+"},{},["+i(l)+"])";return new Worker(window.URL.createObjectURL(new Blob([d],{type:"text/javascript"})))}},{}]},{},[])("./")});


function getHTTPObject() {
	if (window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP");
	else if (window.XMLHttpRequest) return new XMLHttpRequest();
	else {
		alert("Dein Browser unterstuetzt kein AJAX!");
		return null;
	}
}

var cropImages = function(params) {
	this.zIndex = 100;
	this.waitbegin = "...";
	this.waitupload = "Einen Moment bitte. Dein Bild wird hochgeladen!";
	this.textsubmit = "Hochladen";
	this.textcancel = "Abbrechen";
	this.textplus = "Vergr&ouml;&szlig;ern";
	this.textminus = "Verkleinern";
	this.textgood = "Erfolgreich Hochgeladen!";
	this.textbad = "Hochladen fehlgeschlagen!";
	this.textbadimg = "Dein Bild ist zu klein! Mindestaufloesung: ";
	//this.inputs = [];

	if (params) {
		for (var i in params) {
			this[i] = params[i];
		}
	}

	this.elem;
	this.file;
	var that = this;
	//this.img;
	this.data = {
		iw: 0,
		ih: 0,
		nw: 0,
		nh: 0,
		cw: 0,
		ch: 0,
		cl: 0,
		cr: 0,
		change: false
	};
	this.dragging = false;
	this.drag = {
		x: 0,
		y: 0,
		lx: 0,
		ly: 0
	};

	this.cropperStarted = false;

	this.callCache = {};

	this.events = {};

	this.listen = function(evt, callback) {
		if (!that.events[evt]) {
			that.events[evt] = [];
		}
		that.events[evt].push(callback);
	};

	this.trigger = function(evt, data) {
		if (that.events[evt]) {
			for (i in that.events[evt]) {
				if (that.events[evt][i]) {
					that.events[evt][i](data);
				}
			}
		}
	};

	this.stastoCache = {};
	this.sta = false;
	this.stopOverScrolling = function(bool) {
		if (bool) {
			if (this.sta === false) {
				this.stastoCache.height = document.body.style.height;
				this.stastoCache.width = document.body.style.width;
				this.stastoCache.overflow = document.body.style.overflow;
			}
			this.sta = true;
			document.body.style.height = "100%";
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.height = this.stastoCache.height;
			document.body.style.width = this.stastoCache.width;
			document.body.style.overflow = this.stastoCache.overflow;
			this.sta = false;
		}
	};

	this.addEventListeners = function() {
		var list = document.getElementsByClassName('cropImage');
		for (var i = 0; i < list.length; i++) {
			//var height = parseInt(list[i].getAttribute('cropHeight'));
			//var width = parseInt(list[i].getAttribute('cropWidth'));
			//list[i].addEventListener("change", this.imgChange);
			list[i].onchange = this.imgChange;
		}
	};

	this.imgChange = function(evt) {
		that.loadImageData(evt);
	};

	this.loadImageData = function(evt) {
		that.cropperStarted = false;
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var elem = evt.target;
			var files = elem.files;
			that.elem = elem;
			var result = '';
			if (files.length > 0) {
				var file = files[0];
				// if the file is not an image, continue
				that.crop(file, elem);
			} else {
				//console.error("lo");
			}
		} else {
			alert('Leider wird das Hochladen der Bilder in Ihrem Browser (Internet Explorer 7-9) nicht unterstützt. Bitte wechseln Sie auf einen anderen Browser.');
		}
	};

	this.crop = function(file, elem, cropping) {
		that.stopOverScrolling(true);
		that.file = file;
		that.choice(file);
		if (file.type.match('image.*')) {
			var div = that.makeBlackDiv(that.waitbegin);
			var height = parseInt(elem.getAttribute('cropHeight'));
			var width = parseInt(elem.getAttribute('cropWidth'));
			//var uploadURL = elem.getAttribute('uploadUrl');
			var max = elem.getAttribute('maxSize');
			var circle = elem.getAttribute('circle');

			if (typeof cropping === "object") {
				if (cropping.height != null) {
					height = cropping.height;
				}
				if (cropping.width != null) {
					width = cropping.width;
				}
				if (cropping.max != null) {
					max = cropping.max;
				}
				if (cropping.circle != null) {
					circle = cropping.circle;
				}
			}


			if (max && max != "false") {
				max = true;
			} else {
				max = false;
			}
			if (circle && circle != "false") {
				circle = true;
			} else {
				circle = false;
			}
			var oWidth = width;
			var oHeight = height;
			var winw = window.innerWidth;
			var winh = window.innerHeight;
			var scale = width / height;
			if (height > winh - 30) {
				height = winh - 30;
				width = height * scale;
			}
			if (width > winw - 30) {
				width = winw - 30;
				height = width / scale;
			}
			reader = new FileReader();
			reader.onload = (function(tFile) {
				return function(evt) {
					var dataURL = evt.target.result;
					that.callCache.dataURL = dataURL;
					that.callCache.width = width;
					that.callCache.height = height;
					//that.callCache.uploadURL = uploadURL;
					//that.callCache.div = div;
					that.callCache.oWidth = oWidth;
					that.callCache.oHeight = oHeight;
					that.callCache.max = max;
					that.callCache.circle = circle;
					that.displayCropper(dataURL, width, height, div, oWidth, oHeight, max, circle);
				};
			}(file));
			reader.readAsDataURL(file);
		} else {
			reader = new FileReader();
			reader.onload = (function(tFile) {
				return function(evt) {
					var dataURL = evt.target.result;
					that.export(dataURL, that.file);
				};
			}(file));
			reader.readAsDataURL(file);
			//console.error("loI");
		}
	};

	this.makeBlackDiv = function(text) {
		var div = document.createElement('div');
		div.id = "bauhausCropImageWrapper";
		var css = "-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; background: rgba(0, 0, 0, 0.79) !important; position: fixed !important; top: 0px !important; left: 0px !important; right: 0px !important; bottom: 0px !important; overflow: hidden !important; z-Index: " + that.zIndex + " !important";
		div.setAttribute('style', css);
		div.setAttribute('dragable', "false");

		var indiv = document.createElement('div');
		indiv.style.position = "absolute";
		indiv.style.top = "50%";
		indiv.style.width = "100%";
		indiv.style.textAlign = "center";
		indiv.style.color = "#ffffff";
		indiv.style.fontFamily = "Arial";
		indiv.style.fontSize = "18px";
		indiv.innerHTML = text;

		div.appendChild(indiv);
		//console.warn("MAKEDIV");
		document.body.appendChild(div);
		return div;
	};

	this.displayCropper = function(dataURL, width, height, div, oWidth, oHeight, max, circle) {
		that.cropperStarted = true;
		// BackgroundLeft
		var ileft = document.createElement('div');
		ileft.style.position = "absolute";
		ileft.style.top = "0px";
		ileft.style.left = "0px";
		ileft.style.bottom = "0px";
		ileft.style.right = "50%";
		ileft.style.marginRight = ((width / 2)) + "px";
		ileft.style.background = "rgba(0, 0, 0, 0.79)";
		ileft.style.zIndex = that.zIndex;

		// BackgroundTop
		var iTop = document.createElement('div');
		iTop.style.position = "absolute";
		iTop.style.top = "0px";
		iTop.style.left = "50%";
		iTop.style.bottom = "50%";
		iTop.style.right = "50%";
		iTop.style.marginBottom = ((height / 2)) + "px";
		iTop.style.marginLeft = (0 - (width / 2)) + "px";
		iTop.style.marginRight = (0 - (width / 2)) + "px";
		iTop.style.background = "rgba(0, 0, 0, 0.79)";
		iTop.style.zIndex = that.zIndex;

		// BackgroundRight
		var iRight = document.createElement('div');
		iRight.style.position = "absolute";
		iRight.style.top = "0px";
		iRight.style.left = "50%";
		iRight.style.bottom = "0px";
		iRight.style.right = "0px";
		iRight.style.marginLeft = ((width / 2)) + "px";
		iRight.style.background = "rgba(0, 0, 0, 0.79)";
		iRight.style.zIndex = that.zIndex;

		// BackgroundBottom
		var iBottom = document.createElement('div');
		iBottom.style.position = "absolute";
		iBottom.style.top = "50%";
		iBottom.style.left = "50%";
		iBottom.style.bottom = "0px";
		iBottom.style.right = "50%";
		iBottom.style.marginTop = ((height / 2)) + "px";
		iBottom.style.marginLeft = (0 - (width / 2)) + "px";
		iBottom.style.marginRight = (0 - (width / 2)) + "px";
		iBottom.style.background = "rgba(0, 0, 0, 0.79)";
		iBottom.style.zIndex = that.zIndex;


		var winw = window.innerWidth;
		var winh = window.innerHeight;
		if (circle) {
			var rad = Math.sqrt(winw * winw, winh * winh) - (height + width) / 2;
		} else {
			var rad = (winh - height) / 2;
			if ((winw - width) / 2 > rad) {
				rad = (winw - width) / 2;
			}
		}

		//console.log("RAD: " + rad);

		// iCropShow Overlay to view
		var iCropShow = document.createElement('div');
		iCropShow.style.position = "absolute";
		iCropShow.style.top = "50%";
		iCropShow.style.left = "50%";
		iCropShow.style.width = width + "px";
		iCropShow.style.height = height + "px";
		iCropShow.style.marginTop = (-((height / 2) + rad)) + "px";
		iCropShow.style.marginLeft = (-((width / 2) + rad)) + "px";
		iCropShow.style.background = "rgba(0, 0, 0, 0.0)";
		iCropShow.style.border = rad + "px solid rgba(0, 0, 0, 0.79)";
		if (circle) {
			iCropShow.style.borderRadius = "50%";
		}
		iCropShow.style.zIndex = that.zIndex;

		var overlay = document.createElement('div');
		overlay.style.position = "absolute";
		overlay.style.top = "0px";
		overlay.style.left = "0px";
		overlay.style.right = "0px";
		overlay.style.bottom = "0px";
		overlay.style.background = "transparent";
		overlay.style.zIndex = that.zIndex + 1;

		/*var submit = document.createElement('div');
		submit.style.position = "absolute";
		submit.style.padding = "9px";
		submit.style.borderRadius = "2px";
		submit.style.right = "10px";
		submit.style.bottom = "10px";
		submit.style.background = "rgba(10, 162, 0, 0.73)";
		submit.style.zIndex = that.zIndex + 2;
		submit.style.fontFamily = "Arial";
		submit.style.fontSize = "16px";
		submit.style.color = "#ffffff";
		submit.innerHTML = "Upload";
		submit.addEventListener('click', that.submit);*/

		var menubar = document.createElement('div');
		menubar.style.position = "absolute";
		//menubar.style.left = "5px";
		menubar.style.right = "5px";
		menubar.style.bottom = "14px";
		menubar.style.zIndex = that.zIndex + 2 + "";
		menubar.style.fontFamily = "Arial";
		menubar.style.fontSize = "16px";
		menubar.style.color = "#ffffff";
		menubar.style.textAlign = "right";


		var submit = document.createElement('span');
		submit.style.position = "relative";
		submit.style.padding = "9px";
		submit.style.borderRadius = "2px";
		submit.style.background = "rgba(10, 162, 0, 0.73)";
		submit.innerHTML = that.textsubmit;
		submit.style.cursor = "pointer";
		submit.style.color = "#ffffff";
		submit.addEventListener('click', that.submit);

		var cancel = document.createElement('span');
		cancel.style.position = "relative";
		cancel.style.padding = "9px";
		cancel.style.borderRadius = "2px";
		cancel.style.marginRight = "5px";
		cancel.style.background = "rgba(162, 0, 0, 0.73)";
		cancel.innerHTML = that.textcancel;
		cancel.style.cursor = "pointer";
		cancel.style.color = "#ffffff";
		cancel.addEventListener('click', that.cancel);

		var plus = document.createElement('span');
		plus.style.position = "relative";
		plus.style.padding = "9px";
		plus.style.borderRadius = "2px";
		plus.style.marginRight = "5px";
		plus.style.background = "rgba(104, 104, 104, 0.729412)";
		plus.innerHTML = that.textplus;
		plus.style.cursor = "pointer";
		plus.style.color = "#ffffff";
		plus.addEventListener('click', that.resizePlus);
		plus.addEventListener('dblclick', that.resizePlus2x);

		var minus = document.createElement('span');
		minus.style.position = "relative";
		minus.style.padding = "9px";
		minus.style.borderRadius = "2px";
		minus.style.marginRight = "5px";
		minus.style.background = "rgba(104, 104, 104, 0.729412)";
		minus.innerHTML = that.textminus;
		minus.style.cursor = "pointer";
		minus.style.color = "#ffffff";
		minus.addEventListener('click', that.resizeMinus);
		minus.addEventListener('dblclick', that.resizeMinus2x);


		menubar.appendChild(plus);
		menubar.appendChild(minus);
		menubar.appendChild(cancel);
		menubar.appendChild(submit);

		var img = new Image;

		img.onload = function() {

			var iw = img.width;
			var ih = img.height;

			if (iw < oWidth || ih < oHeight) {
				alert(that.textbadimg + oWidth + "x" + oHeight);
				that.cancel();
			}

			that.data = {
				iw: iw,
				ih: ih,
				nw: iw,
				nh: ih,
				cw: width,
				ch: height,
				ct: 0,
				cl: 0,
				kw: 0,
				kh: 0,
				ow: oWidth,
				oh: oHeight,
				max: max,
				circle: circle,
				change: false
			};

			if (height / width < ih / iw) {
				var ww = width; // width

				if (ww > 0) {
					var t = iw / ww;
				} else {
					alert("Bild fehlerhaft!");
				}
				iw = ww;
				ih = ih / t;
			} else {
				var ww = height; // width

				if (ww > 0) {
					var t = ih / ww;
				} else {
					alert("Bild fehlerhaft!");
				}
				ih = ww;
				iw = iw / t;
			}

			that.data.minw = iw;
			that.data.minh = ih;
			that.data.nw = iw;
			that.data.nh = ih;
			that.data.ct = 0 - ((ih / 2) - (height / 2));
			that.data.cl = 0 - ((iw / 2) - (width / 2));
			that.data.kw = that.data.iw / (that.data.nw / that.data.cw);
			that.data.kh = that.data.ih / (that.data.nh / that.data.ch);

			//INNER ELEM
			var size = document.createElement('div');
			size.id = "bauhausCropImageHolder";
			size.style.position = "absolute";
			size.style.top = "50%";
			size.style.left = "50%";
			size.style.margin = "0";
			size.style.marginLeft = (0 - (width / 2)) + "px";
			size.style.marginTop = (0 - (height / 2)) + "px";
			size.style.height = height + "px";
			size.style.width = width + "px";
			size.style.border = "0px solid #ff0000";
			size.style.zIndex = that.zIndex - 1 + "";
			size.style.padding = "0";
			size.innerHTML = '<img draggable="false" id="bauhausCropImage" src="' + dataURL + '" style="z-index:' + (that.zIndex - 1) + '; position: absolute; width: ' + iw + 'px; height: ' + ih + 'px; left: ' + that.data.cl + 'px; top: ' + that.data.ct + 'px; padding: 0; margin:0; border: 0px solid black; max-width: none;" />';

			/*var dbug = document.createElement('div');
			submit.style.position = "absolute";
			submit.style.width = "100px";
			submit.style.height = "100px";
			submit.style.right = "0px";
			submit.style.bottom = "0px";
			submit.style.background = "rgba(10, 162, 0, 0.73)";
			submit.style.zIndex = that.zIndex + 2;
			submit.addEventListener('click', that.submit);*/

			div.style.background = "rgba(255, 0, 0, 0)";
			div.addEventListener("mousedown", that.drag);
			div.addEventListener("mouseup", that.drop);
			div.addEventListener("mousemove", that.move);
			div.addEventListener("mousewheel", that.scroll);
			//div.addEventListener("DOMMouseScroll", that.scroll);
			div.addEventListener("wheel", that.scroll);
			div.addEventListener("mouseout", that.mouseout);
			div.appendChild(size);
			//div.appendChild(ileft);
			//div.appendChild(iTop);
			//div.appendChild(iRight);
			//div.appendChild(iBottom);
			div.appendChild(iCropShow);
			div.appendChild(overlay);
			div.appendChild(menubar);
		};
		img.src = dataURL;
	};

	this.scroll = function(evt) {
		if (evt.wheelDeltaY) {
			var move = evt.wheelDeltaY;
		}
		if (evt.deltaY) {
			var move = evt.deltaY;
		}
		if (move) {
			var add = 10;
			if (move > 0) {
				var newWidth = that.data.nw + move;
			}
			if (move < 0) {
				var newWidth = that.data.nw + move;
			}

			if (newWidth && newWidth > 0) {
				that.resize(newWidth, evt);
			}
		}
		return false;
	};

	this.resizePlus = function() {
		that.resizeButtons(1);
	};

	this.resizeMinus = function() {
		that.resizeButtons(-1);
	};

	this.resizePlus2x = function() {
		that.resizeButtons(5);
	};

	this.resizeMinus2x = function() {
		that.resizeButtons(-5);
	};

	this.resizeButtons = function(p) {
		var s = that.data.iw / 50;
		var newWidth = that.data.nw + (s * p);
		that.resize(newWidth);
	};

	this.resize = function(newWidth, evt) {
		var t = that.data.iw / newWidth;
		var oldw = that.data.nw;
		var oldh = that.data.nh;
		that.data.nw = newWidth;
		that.data.nh = that.data.ih / t;

		if (that.data.nw < that.data.minw || that.data.nh < that.data.minh) {
			that.data.nw = that.data.minw;
			that.data.nh = that.data.minh;
		}

		that.data.kw = that.data.iw / (that.data.nw / that.data.cw);
		that.data.kh = that.data.ih / (that.data.nh / that.data.ch);
		//console.log(that.data.kw);
		if (that.data.kw < that.data.ow || that.data.kh < that.data.oh) {
			that.data.nw = (that.data.cw * that.data.iw) / that.data.ow;
			that.data.nh = (that.data.ch * that.data.ih) / that.data.oh;
			that.data.kw = that.data.ow;
			that.data.kh = that.data.oh;
		}

		var t = oldw / that.data.nw;
		var elem = document.getElementById('bauhausCropImageHolder');
		if (evt) {
			var mx = evt.clientX - elem.offsetLeft;
			var my = evt.clientY - elem.offsetTop;
		} else {
			var mx = that.data.cw / 2;
			var my = that.data.ch / 2;
		}
		if (mx < 0) {
			mx = 0;
		}
		if (my < 0) {
			my = 0;
		}
		if (mx > that.data.cw) {
			mx = that.data.cw;
		}
		if (my > that.data.ch) {
			my = that.data.ch;
		}

		that.data.cl = mx - ((mx - that.data.cl) / t);
		that.data.ct = my - ((my - that.data.ct) / t);

		if (that.data.ct <= (that.data.ch - that.data.nh)) {
			that.data.ct = that.data.ch - that.data.nh;
		}
		if (that.data.cl <= (that.data.cw - that.data.nw)) {
			that.data.cl = that.data.cw - that.data.nw;
		}
		if (that.data.cl > 0) {
			that.data.cl = 0;
		}
		if (that.data.ct > 0) {
			that.data.ct = 0;
		}
		document.getElementById('bauhausCropImage').style.top = that.data.ct + "px";
		document.getElementById('bauhausCropImage').style.left = that.data.cl + "px";
		document.getElementById('bauhausCropImage').style.height = that.data.nh + "px";
		document.getElementById('bauhausCropImage').style.width = that.data.nw + "px";
	};

	this.move = function(evt) {
		if (that.dragging) {
			var x = evt.clientX - that.drag.x;
			var y = evt.clientY - that.drag.y;
			if (that.data.ct + y > 0) {
				y = -that.data.ct;
			}
			if (that.data.ct + y < (that.data.ch - that.data.nh)) {
				y = that.data.ch - that.data.nh - that.data.ct;
			}

			if (that.data.cl + x > 0) {
				x = -that.data.cl;
			}
			if (that.data.cl + x < (that.data.cw - that.data.nw)) {
				x = that.data.cw - that.data.nw - that.data.cl;
			}
			//if (that.data.ct + y <= 0 && true) {
			//that.data.ct = that.data.ct;

			that.drag.lx = that.data.cl + x;
			that.drag.ly = that.data.ct + y;
			that.data.change = true;
			document.getElementById('bauhausCropImage').style.top = that.data.ct + y + "px";
			document.getElementById('bauhausCropImage').style.left = that.data.cl + x + "px";
			//}

		}
	};

	this.drag = function(evt) {
		that.dragging = true;
		that.drag.x = evt.clientX;
		that.drag.y = evt.clientY;
		that.data.change = false;
		//console.log("DRAG");
	};

	this.drop = function(evt) {
		if (that.dragging) {
			that.dragging = false;
			/*var x = evt.clientX - that.drag.x;
			var y = evt.clientY - that.drag.y;
			if (that.data.ct <= (that.data.ch - that.data.nh)) {
			    that.data.ct = that.data.ch - that.data.nh;
			}
			if (that.data.cl <= (that.data.cw - that.data.nw)) {
			    that.data.cl = that.data.cw - that.data.nw;
			}
			if (that.data.cl > 0) {
			    that.data.cl = 0;
			}
			if (that.data.ct > 0) {
			    that.data.ct = 0;
			}
			that.data.ct = that.data.ct + y;
			that.data.cl = that.data.cl + x;
			document.getElementById('bauhausCropImage').style.top = that.data.ct + y + "px";
			document.getElementById('bauhausCropImage').style.left = that.data.cl + x + "px";*/
			if (that.data.change === true) {
				that.data.ct = that.drag.ly;
				that.data.cl = that.drag.lx;
			}
			//console.log("DROP");
		}
	};

	this.mouseout = function(evt) {
		//console.log("MOUSEOUT");
		that.drop();
	};

	this.submit = function(evt) {
		that.stopOverScrolling(false);
		//console.log("Please Wait!");
		var src = document.getElementById('bauhausCropImage').src;
		that.removeElementById('bauhausCropImageWrapper');
		var div = that.makeBlackDiv(that.waitupload);
		that.resizeAndReturn(src, that.data.kw, that.data.kh, that.data.ct, that.data.cl, that.data.nw, that.data.nh, that.data.max, that.data.circle);
		return false;
	};

	this.cancel = function(evt) {
		that.exit();
		var e = {};
		e.data = that.data;
		e.file = that.file;
		that.trigger('oncancel', e);
		return false;
	};

	this.choice = function(file) {
		that.trigger('choice', file);
		return false;
	};

	this.export = function(dataUrl, file, data) {
		var exp = {};
		exp.dataUrl = dataUrl;
		exp.file = file;

		if (data) {
			exp.data = data;
		}

		that.stopOverScrolling(false);
		if (that.cropperStarted) {
			that.removeElementById('bauhausCropImageWrapper');
		}
		that.trigger('export', exp);
	};

	this.exit = function(evt) {
		that.stopOverScrolling(false);
		if (that.cropperStarted) {
			that.removeElementById('bauhausCropImageWrapper');
		}
		that.trigger('onupload', evt);
	};

	this.resizeAndReturn = function(file, kw, kh, ct, cl, nw, nh, max, circle) {
		//var reader = new FileReader();
		//reader.onloadend = function () {

		var tempImg = new Image();
		tempImg.src = file;
		tempImg.onload = function() {
			var canvas = document.createElement('canvas');

			kw = Math.round(kw);
			kh = Math.round(kh);
			ct = Math.round(ct);
			cl = Math.round(cl);
			nw = Math.round(nw);
			nh = Math.round(nh);

			var srcCanvas = document.createElement('canvas');
			srcCanvas.width = kw;
			srcCanvas.height = kh;

			var ctx = srcCanvas.getContext("2d");

			var srct = that.data.kw / that.data.cw;
			srcnw = nw * srct;
			srcnh = nh * srct;
			srccl = cl * srct;
			srcct = ct * srct;

			ctx.drawImage(this, srccl, srcct, srcnw, srcnh);
			if (max) {
				canvas.width = kw;
				canvas.height = kh;
			} else {
				canvas.width = that.data.ow;
				canvas.height = that.data.oh;
			}

			pica.resizeCanvas(srcCanvas, canvas, {}, function(err) {
				var dataURL = canvas.toDataURL("image/jpeg", 0.85);

				var e = {};
				e.data = that.data;
				e.dataURL = dataURL;
				that.trigger('onimgset', e);

				that.export(dataURL, that.file, that.data);
			});
		}
	};

	this.uploadOLD = function(dataURL, uploadURL) {
		var xhr = new XMLHttpRequest();
		var first = 0;
		xhr.onreadystatechange = function(ev) {
			//console.log(ev);
			if (first == 0) {
				//console.log("ready");
				first++;
			}
		};

		xhr.open('POST', uploadURL, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var da = 'image=' + dataURL;
		xhr.send(da);
	};

	this.uploadReq;

	this.uploadERR = function() {
		alert(that.textbad);
		that.exit();
		//var div = that.makeBlackDiv(that.textbad);
	};

	this.uploadCB = function(evt) {
		if (that.uploadReq.readyState == 4) {
			if (that.uploadReq.status === 200) {
				alert(that.textgood);
				that.exit();
				//var div = that.makeBlackDiv(that.textgood);
			} else {
				that.uploadERR();
			}
			that.elem.value = '';
		}
	};

	this.upload = function(dataURL, uploadURL, data) {
		this.uploadReq = getHTTPObject();
		if (this.uploadReq != null) {
			this.uploadReq.onreadystatechange = this.uploadCB;
			try {
				this.uploadReq.onerror = this.uploadERR;
			} catch (e) {
				//console.log("IE");
			}
			//this.uploadReq.onprogress = that.processTest;
			this.uploadReq.open("POST", uploadURL, true);
			this.uploadReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			var dataN = encodeURIComponent(dataURL);
			this.uploadReq.send("data=" + JSON.stringify(data) + "&image=" + dataN);
		}
	};

	this.removeElementById = function(id) {
		return (elem = document.getElementById(id)).parentNode.removeChild(elem);
	};

	this.resizeTimer;
	this.windowResize = function() {
		if (that.sta) {
			if (that.resizeTimer) {
				clearTimeout(that.resizeTimer);
			}
			that.resizeTimer = setTimeout(that.updateResize, 250);
			//that.updateResize();
		}
	};

	this.updateResize = function() {
		if (that.sta) {
			that.exit();
			var div = that.makeBlackDiv(that.waitbegin);
			var width = that.data.ow;
			var height = that.data.oh;
			var winw = window.innerWidth;
			var winh = window.innerHeight;
			var scale = width / height;
			if (height > winh - 30) {
				height = winh - 30;
				width = height * scale;
			}
			if (width > winw - 30) {
				width = winw - 30;
				height = width / scale;
			}

			that.displayCropper(that.callCache.dataURL, width, height, div, that.data.ow, that.data.oh, that.callCache.max, that.callCache.circle);
		}
	}

	window.addEventListener('resize', this.windowResize);

	this.addEventListeners();
};

//var cropper = new cropImages();
