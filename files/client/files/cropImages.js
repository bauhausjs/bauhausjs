function getHTTPObject() {
    if (window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP");
    else if (window.XMLHttpRequest) return new XMLHttpRequest();
    else {
        alert("Dein Browser unterstuetzt kein AJAX!");
        return null;
    }
}

var cropImages = function (params) {
    this.zIndex = 100;
    this.waitbegin = "einen Moment bitte";
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
        for (i in params) {
            this[i] = params[i];
        }
    }

    this.elem;
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
    this.onimgset = false;
    this.oncancel = false;

    this.callCache = {};

    this.stastoCache = {};
    this.sta = false;
    this.stopOverScrolling = function (bool) {
        if (bool) {
            if (this.sta === false) {
                this.sta = true;
                this.stastoCache.height = document.body.style.height;
                this.stastoCache.width = document.body.style.width;
                this.stastoCache.overflow = document.body.style.overflow;
            }
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

    this.addEventListeners = function () {
        var list = document.getElementsByClassName('cropImage');
        for (var i = 0; i < list.length; i++) {
            //var height = parseInt(list[i].getAttribute('cropHeight'));
            //var width = parseInt(list[i].getAttribute('cropWidth'));
            list[i].addEventListener("change", this.imgChange);
        }
    };

    this.imgChange = function (evt) {
        that.loadImageData(evt);
    };

    this.loadImageData = function (evt) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var elem = evt.target;
            var files = elem.files;
            that.elem = elem;
            var result = '';
            if (files.length > 0) {
                var file = files[0];
                // if the file is not an image, continue
                if (file.type.match('image.*')) {
                    var div = that.makeBlackDiv(that.waitbegin);
                    var height = parseInt(elem.getAttribute('cropHeight'));
                    var width = parseInt(elem.getAttribute('cropWidth'));
                    var uploadURL = elem.getAttribute('uploadUrl');
                    var max = elem.getAttribute('maxSize');
                    if (max && max != "false") {
                        max = true;
                    } else {
                        max = false;
                    }
                    that.onimgset = elem.getAttribute('onimgset');
                    that.oncancel = elem.getAttribute('oncancel');
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
                    reader.onload = (function (tFile) {
                        return function (evt) {
                            var dataURL = evt.target.result;
                            that.callCache.dataURL = dataURL;
                            that.callCache.width = width;
                            that.callCache.height = height;
                            that.callCache.uploadURL = uploadURL;
                            //that.callCache.div = div;
                            that.callCache.oWidth = oWidth;
                            that.callCache.oHeight = oHeight;
                            that.callCache.max = max;
                            that.displayCropper(dataURL, width, height, uploadURL, div, oWidth, oHeight, max);
                        };
                    }(file));
                    reader.readAsDataURL(file);
                } else {
                    console.error("loI");
                }
            } else {
                console.error("lo");
            }
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    };

    this.makeBlackDiv = function (text) {
        var div = document.createElement('div');
        div.id = "bauhausCropImageWrapper";
        div.setAttribute('style', "-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;");
        div.setAttribute('dragable', "false");
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.right = "0px";
        div.style.bottom = "0px";
        div.style.overflow = "hidden";
        div.style.background = "rgba(0, 0, 0, 0.79)";
        div.style.zIndex = that.zIndex;

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
        console.warn("MAKEDIV");
        document.body.appendChild(div);
        return div;
    };

    this.displayCropper = function (dataURL, width, height, uploadURL, div, oWidth, oHeight, max) {

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
        menubar.style.zIndex = that.zIndex + 2;
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
        submit.addEventListener('click', that.submit);

        var cancel = document.createElement('span');
        cancel.style.position = "relative";
        cancel.style.padding = "9px";
        cancel.style.borderRadius = "2px";
        cancel.style.marginRight = "5px";
        cancel.style.background = "rgba(162, 0, 0, 0.73)";
        cancel.innerHTML = that.textcancel;
        cancel.style.cursor = "pointer";
        cancel.addEventListener('click', that.cancel);

        var plus = document.createElement('span');
        plus.style.position = "relative";
        plus.style.padding = "9px";
        plus.style.borderRadius = "2px";
        plus.style.marginRight = "5px";
        plus.style.background = "rgba(104, 104, 104, 0.729412)";
        plus.innerHTML = that.textplus;
        plus.style.cursor = "pointer";
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
        minus.addEventListener('click', that.resizeMinus);
        minus.addEventListener('dblclick', that.resizeMinus2x);


        menubar.appendChild(plus);
        menubar.appendChild(minus);
        menubar.appendChild(cancel);
        menubar.appendChild(submit);

        var img = new Image;

        img.onload = function () {

            var iw = img.width;
            var ih = img.height;

            if (iw < oWidth || ih < oHeight) {
                alert(that.textbadimg + oWidth + "x" + oHeight);
                that.exit();
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
                uploadURL: uploadURL,
                max: max,
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
            size.style.zIndex = that.zIndex - 1;
            size.style.padding = "0";
            size.innerHTML = '<img draggable="false" id="bauhausCropImage" src="' + dataURL + '" style="z-index:' + (that.zIndex - 1) + '; position: absolute; width: ' + iw + 'px; height: ' + ih + 'px; left: ' + that.data.cl + 'px; top: ' + that.data.ct + 'px; padding: 0; margin:0 border: 0px solid black;" />';

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
            div.appendChild(ileft);
            div.appendChild(iTop);
            div.appendChild(iRight);
            div.appendChild(iBottom);
            div.appendChild(overlay);
            div.appendChild(menubar);

            that.stopOverScrolling(true);
        };
        img.src = dataURL;
    };

    this.scroll = function (evt) {
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

    this.resizePlus = function () {
        that.resizeButtons(1);
    };

    this.resizeMinus = function () {
        that.resizeButtons(-1);
    };

    this.resizePlus2x = function () {
        that.resizeButtons(5);
    };

    this.resizeMinus2x = function () {
        that.resizeButtons(-5);
    };

    this.resizeButtons = function (p) {
        var s = that.data.iw / 50;
        var newWidth = that.data.nw + (s * p);
        that.resize(newWidth);
    };

    this.resize = function (newWidth, evt) {
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

    this.move = function (evt) {
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

    this.drag = function (evt) {
        that.dragging = true;
        that.drag.x = evt.clientX;
        that.drag.y = evt.clientY;
        that.data.change = false;
        //console.log("DRAG");
    };

    this.drop = function (evt) {
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

    this.mouseout = function (evt) {
        //console.log("MOUSEOUT");
        that.drop();
    };

    this.submit = function (evt) {
        that.stopOverScrolling(false);
        //console.log("Please Wait!");
        var src = document.getElementById('bauhausCropImage').src;
        that.removeElementById('bauhausCropImageWrapper');
        var div = that.makeBlackDiv(that.waitupload);
        that.resizeAndReturn(src, that.data.kw, that.data.kh, that.data.ct, that.data.cl, that.data.nw, that.data.nh, that.data.max);
    };

    this.cancel = function (evt) {
        that.exit();

        if (that.oncancel) {
            var e = {};
            e.data = that.data;
            try {
                eval(that.oncancel);
            } catch (e) {

            }
        }
    };

    this.exit = function (evt) {
        that.stopOverScrolling(false);
        that.removeElementById('bauhausCropImageWrapper');
    };

    this.resizeAndReturn = function (file, kw, kh, ct, cl, nw, nh, max) {
        //var reader = new FileReader();
        //reader.onloadend = function () {

        var tempImg = new Image();
        tempImg.src = file;
        tempImg.onload = function () {
            var canvas = document.createElement('canvas');
            if (max) {
                //console.log("WAR");
                var t = that.data.kw / that.data.cw;
                nw = nw * t;
                nh = nh * t;
                cl = cl * t;
                ct = ct * t;

                canvas.width = kw;
                canvas.height = kh;
            } else {
                var t = that.data.ow / that.data.cw;
                nw = nw * t;
                nh = nh * t;
                cl = cl * t;
                ct = ct * t;

                canvas.width = that.data.ow;
                canvas.height = that.data.oh;
            }
            var ctx = canvas.getContext("2d");

            ctx.drawImage(this, cl, ct, nw, nh);
            var dataURL = canvas.toDataURL("image/jpeg");

            //var div = document.createElement('div');
            //div.innerHTML = '<img draggable="false" src="' + dataURL + '" />'; // style="width: 100%;"
            //document.body.appendChild(div);

            if (that.onimgset) {
                var e = {};
                e.data = that.data;
                e.dataURL = dataURL;
                try {
                    eval(that.onimgset);
                } catch (e) {

                }
            }

            //that.exit();

            that.upload(dataURL, that.data.uploadURL);
        }

        //}
        //reader.readAsDataURL(file);
    };

    this.uploadOLD = function (dataURL, uploadURL) {
        var xhr = new XMLHttpRequest();
        var first = 0;
        xhr.onreadystatechange = function (ev) {
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

    this.uploadERR = function () {
        alert(that.textbad);
        that.exit();
        //var div = that.makeBlackDiv(that.textbad);
    };

    this.uploadCB = function (evt) {
        if (that.uploadReq.readyState == 4) {
            if (that.uploadReq.status === 200) {
                alert(that.textgood);
                that.exit();
                //var div = that.makeBlackDiv(that.textgood);
            } else {
                that.uploadERR();
            }
        }
    };

    this.upload = function (dataURL, uploadURL) {
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
            this.uploadReq.send("image=" + dataN);
        }
    };

    this.removeElementById = function (id) {
        return (elem = document.getElementById(id)).parentNode.removeChild(elem);
    };

    this.resizeTimer;
    this.windowResize = function () {
        if (that.sta) {
            if (that.resizeTimer) {
                clearTimeout(that.resizeTimer);
            }
            that.resizeTimer = setTimeout(that.updateResize, 250);
            //that.updateResize();
        }
    };

    this.updateResize = function () {
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

            that.displayCropper(that.callCache.dataURL, width, height, that.callCache.uploadURL, div, that.data.ow, that.data.oh, that.callCache.max);
        }
    }

    window.addEventListener('resize', this.windowResize);

    this.addEventListeners();
};