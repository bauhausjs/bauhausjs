angular.module('bauhaus.document.directives').directive('bauhausFile', function ($timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
            '     <label class="page-content-field-label">{{config.label}}</label><br><br>' +
            '     <span ng-if="!config.options.singlefile">Es sind maximal {{limit}} Datei/en aktivierbar.</span>' +
            '     <table class="table" ng-if="!loading">' +
            ' <thead>' +
            '     <tr>' +
            '         <th>Datei</th>' +
            '         <th>Name</th>' +
            '         <th ng-if="!config.options.singlefile">Aktiv</th>' +
            '         <th ng-if="!config.options.singlefile">L&ouml;schen</th>' +
            '     </tr>' +
            ' </thead>' +
            ' <tbody>' +
            '     <tr ng-repeat="(key, id) in images" ng-class="getClass(key)">' +
            '         <td ng-if="isTypeimage(key) && !cropping.circle" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files/{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 40px; max-width: 100px;"></td>' +
            '         <td ng-if="isTypeimage(key) && cropping.circle" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files/{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 50px; max-width: 100px; border-radius: 50%;"></td>' +
            '         <td ng-if="!isTypeimage(key)" style="cursor: pointer;"><span ng-click="OpenInNewTab(id)" title="{{key}}"><i class="fa fa-download"></i></span></td>' +
            '         <td><i class="icon-pencil"></i>{{key}}</td>' +
            '         <td ng-if="!config.options.singlefile"><input type="checkbox" style="opacity: 1;" ng-checked="isActive(id);" ng-click="toggleActive(id)" ng-disabled="isDisabled(id)"></td>' +
            '         <td ng-if="!config.options.singlefile"><input type="button" value="L&ouml;schen" ng-click="deleteFile(key)"></td>' +
            '        </tr>' +
            '      </tbody>' +
            '    </table>' +
            '    <div ng-if="loading"><br><br>Dateiliste wird geladen...<br><br></div>' +
            '    <br>Datei hinzuf&uuml;gen: <input type="file" name="file" id="fileupload{{config.name}}" cropWidth="800" cropHeight="600" maxSize="false" circle="false"/><input type="button" value="Upload" ng-click="uploadFile()"><br><br><br><progress min="0" max="100" value="0" id="fileuploadprogress{{config.name}}">0% complete</progress> <span> {{uploadState}} </span>' +
            '</div>',
        scope: {
            value: '=ngModel',
            config: '=fieldConfig'
        },
        link: function (scope, el, attr) {
            // Load labels of related documents
            if (typeof scope.config.options === 'undefined') {
                scope.config.options = {};
            }

            scope.limit = (scope.config.options.limit !== undefined && typeof scope.config.options.limit === 'number') ? scope.config.options.limit : 1;
            scope.filename = scope.config.options.filename || false;
            scope.loading = true;


            scope.loadId = function () {
                if(scope.$parent != null && scope.$parent.doc != null && scope.$parent.doc._id != null){
                    scope._id = scope.$parent.doc._id;
                } else {
                    //console.error('could not find ID');
                    scope._id = null;
                }
            };

            scope.loadId();

            var t = scope.config.options.typeRegEx || '[.]*';
            scope.regex = new RegExp(t);
            scope.cropping = scope.config.options.cropping || {
                width: 600,
                height: 600,
                maxSize: false,
                circle: false
            };
            scope.reloadnumber = Date.now();
            scope.imageQuery = 'transform=resize&width=80&height=50';
            scope.images = {};
            scope.projectidjson = '{"projectid": "' + scope._id + '"}';

            scope.test = function (e) {
                //console.error("TOLLL");
            };
            scope.uploadState = 'Upload Status';

            scope.c = new cropImages();

            scope.c.listen('choice', function (e) {
                scope.uploadState = 'Datei wird eingelesen! Bitte warten...';
                //if (!scope.$$phase) {
                //    scope.$apply();
                //}
            });

            scope.c.listen('export', function (e) {
                scope.uploadState = 'Datei wird hochgeladen! Bitte warten...';
                if (!scope.$$phase) {
                    scope.$apply();
                }
                var blob = scope.dataURItoBlob(e.dataUrl);
                var name = e.file.name.split('.');
                name.pop();
                scope.uploadHandler(blob, name.join('_'));
            });

            scope.dataURItoBlob = function (dataURI) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(dataURI.split(',')[1]);
                else
                    byteString = unescape(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], {
                    type: mimeString
                });
            }

            scope.getHTTPObject = function () {
                if (window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP");
                else if (window.XMLHttpRequest) return new XMLHttpRequest();
                else {
                    alert("Dein Browser unterstuetzt kein AJAX!");
                    return null;
                }
            }

            scope.fsOp = function (data, callback, dataUrl) {
                scope.loadId();
                var fopReq = scope.getHTTPObject();
                if (fopReq != null) {
                    fopReq.onreadystatechange = function () {
                        if (fopReq.readyState == 4 && fopReq.status == 200) {
                            if (callback) {
                                try {
                                    callback(JSON.parse(fopReq.responseText));
                                } catch (e) {
                                    console.error({
                                        "error": "Invalid JSON!",
                                        e: e
                                    });
                                }
                            }
                        }
                    };
                    data.field = scope.config.name;
                    data.config = scope.config.configPath;
                    data._id = scope._id;
                    fopReq.open("POST", "/files/.operations/fsop/" + data.op + "?data=" + encodeURIComponent(JSON.stringify(data)), true);
                    fopReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    var temp = '';
                    if (dataUrl) {
                        temp = '&file=' + encodeURIComponent(dataUrl);
                    }
                    fopReq.send("data=" + JSON.stringify(data) + temp);
                }
            };

            scope.uploadFileBlob = function (blob, data, callback, progress) {
                scope.loadId();
                var formData = new FormData();
                data.field = scope.config.name;
                data.config = scope.config.configPath;
                data._id = scope._id;
                formData.append("data", JSON.stringify(data));
                formData.append("file", blob, data.name);

                var xhr = scope.getHTTPObject();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        callback(false, xhr);
                    }
                };

                xhr.onerror = callback;

                if (progress && document.getElementById(progress)) {
                    var progressBar = document.getElementById(progress);
                    xhr.upload.onprogress = function (e) {
                        if (e.lengthComputable) {
                            progressBar.value = (e.loaded / e.total) * 100;
                            progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
                        }
                    };
                };
                //console.log('data: ', data);
                xhr.open("POST", "/files/.operations/upload?data=" + encodeURIComponent(JSON.stringify(data)), true); // "+encodeURIComponent(JSON.stringify(data))+"
                xhr.send(formData);
            };

            scope.isTypeimage = function (key) {
                var a = key.split('.');
                if (['jpg', 'jpeg'].indexOf(a[a.length - 1].toLowerCase()) >= 0) {
                    return true;
                }
                return false;
            };

            scope.isActive = function (id) {
                scope.checkValue();
                if (scope.value.files.indexOf(id) >= 0) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.isDisabled = function (id) {
                scope.checkValue();
                if (scope.value.files.indexOf(id) < 0 && scope.value.files.length == scope.limit) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.toggleActive = function (id) {
                scope.checkValue();
                var ret = scope.value.files.indexOf(id);
                if (ret >= 0) {
                    scope.value.files.splice(ret, 1);
                    //console.log(scope.value.files);
                    return true;
                } else {
                    if (scope.value.files.length < scope.limit) {
                        scope.value.files.push(id);
                        return true;
                    } else {
                        alert("Es dürfen maximal " + scope.limit + " Dateien aktiviert werden!");
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        return false;
                    }
                }
            };

            scope.activateAllReminder = false;

            scope.activateAllWhenNeeded = function () {
                if (scope.activateAllReminder) {
                    scope.activateAllReminder = false;
                    scope.activateAll();
                }
            };

            scope.activateAll = function () {
                if (scope.value.files.length < scope.limit) {
                    for (var i in scope.images) {
                        var id = scope.images[i];
                        if (scope.value.files.length < scope.limit && scope.value.files.indexOf(id) < 0) {
                            scope.value.files.push(id);
                        }
                    }
                }
            };

            scope.load = function () {
                scope.loadId();
                //console.log('try load', scope._id, scope.$parent.$parent);
                var k = 0;
                for (var i in scope.images) {
                    k++;
                    break;
                }
                if (k < 1) {
                    if (scope._id == null) {
                        $timeout(function () {
                            //scope.load();
                        }, 200);
                    } else {
                        scope.loadId();
                        //console.log('dir', scope.dir);
                        scope.initValue();
                        scope.loadlist();
                    }
                }
            };
            scope.highlightkey = '';

            scope.getClass = function (key) {
                if (scope.highlightkey === key) {
                    return 'highlight';
                }
                return 'unhighlight';
            }

            scope.checkValue = function () {
                if (scope.value == null || scope.value.files == null) {
                    scope.value = {};
                    scope.value.files = [];
                }
            };

            scope.removeFromlist = function (id) {
                scope.checkValue();
                var ret = scope.value.files.indexOf(id);
                if (ret >= 0) {
                    scope.value.files.splice(ret, 1);
                    //console.log(scope.value.files);
                }
            };

            scope.checkLostFiles = function () {
                scope.checkValue();
                var rem = [];
                for (var i in scope.value.files) {
                    var arr = scope.value.files[i].split('/');
                    var key = arr[arr.length - 1];
                    if (!scope.images[key]) {
                        rem.push(scope.value.files[i]);
                    }
                }
                for (var i in rem) {
                    scope.removeFromlist(rem[i]);
                }
            };

            scope.loadfailconter = 5;

            scope.loadlist = function (startCrop) {
                scope.loading = true;
                scope.fsOp({
                    "op": "readcontainersure"
                }, function (e) {
                    if (e.success) {
                        //console.log('sta');
                        for (var i in scope.images) {
                            delete scope.images[i];
                        }

                        for (var i in e.files) {
                            scope.images[e.files[i].name] = e.files[i].container.replace(/\./g, '/') + "/" + e.files[i].name;
                        }
                        scope.checkLostFiles();
                        scope.activateAllWhenNeeded();
                        //scope.images = temp;

                        scope.highlightkey = '';
                        if (startCrop) {
                            scope.highlightkey = scope.images.length - 1;
                            $timeout(function () {
                                scope.highlightkey = '';
                            }, 1500);
                        }
                        scope.reloadnumber = Date.now();

                        scope.loading = false;

                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    } else {
                        console.error("Error: " + e.info);
                        if(scope.loadfailconter > 0){
                           scope.loadfailconter--;
                           scope.loadlist();
                        }
                    }
                });
            };

            scope.deleteFile = function (id) {
                var ret = confirm("Soll diese Datei wirklich gelöscht werden?");
                if (ret) {
                    scope.fsOp({
                        "op": "removefile",
                        "file": id
                    }, function (e) {
                        if (e.success) {
                            scope.loadlist();
                        } else {
                            scope.loadlist();
                            alert("Löschen Fehlgeschlagen!");
                        }
                    });
                }
            };

            // Init relation object, of it doesn't exist yet
            scope.initValue = function () {
                if (typeof scope.value !== 'object') {
                    scope.value = {
                        files: []
                    };
                }
            };

            scope.OpenInNewTab = function (url) {
                var win = window.open('/files/' + url, '_blank');
                win.focus();
            }

            scope.uploadFile = function () {
                var uploadId = 'fileupload' + scope.config.name;
                if (scope.regex.test(document.getElementById(uploadId).files[0].type)) {
                    if (document.getElementById(uploadId).files[0].type.split('/')[0] == 'image') {
                        scope.c.crop(document.getElementById(uploadId).files[0], document.getElementById(uploadId), scope.cropping);
                    } else {
                        scope.uploadState = "Datei wird hochgeladen...";
                        var blob = document.getElementById(uploadId).files[0];
                        var name = blob.name.split('.');
                        name.pop();
                        scope.uploadHandler(blob, name.join('_'));
                    }
                } else {
                    scope.uploadState = "Dateityp nicht erlaubt!";
                }
            };

            scope.uploadHandler = function (blob, name) {
                var uploadProgressId = 'fileuploadprogress' + scope.config.name;
                scope.uploadFileBlob(blob, {'name': name}, function (err, data) {
                    if (err) {
                        scope.uploadState = "Upload fehlgeschlagen!";
                    } else {
                        var json = {};
                        //console.log('data.responseText',data.responseText);
                        try {
                            json = JSON.parse(data.responseText);
                        } catch (e) {
                            scope.uploadState = "Upload fehlgeschlagen!";
                        }
                        if (json.success) {
                            scope.uploadState = "Datei wurde erfolgreich hochgeladen!";
                            scope.activateAllReminder = true;
                            scope.loadlist();
                        } else {
                            scope.uploadState = "Upload fehlgeschlagen!";
                        }
                    }

                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }, uploadProgressId);
            };

            $timeout(function () {
                scope.load();
            }, 1000);

            scope.$watch('value', function (newValue, oldValue) {
                if (newValue) {
                    scope.load();
                }
            }, true);

        }
    };
});
