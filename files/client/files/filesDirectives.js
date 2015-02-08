angular.module('bauhaus.document.directives').directive('bauhausFile', function ($timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
            '     <label class="page-content-field-label">{{config.label}}</label><br><br>' +
            '     <span>Es sind maximal {{limit}} Datei/en aktivierbar.</span>' +
            '     <table class="table">' +
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
            '         <td ng-if="isTypeimage(key) && !cropping.circle" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 40px; max-width: 100px;"></td>' +
            '         <td ng-if="isTypeimage(key) && cropping.circle" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 50px; max-width: 100px; border-radius: 50%;"></td>' +
            '         <td ng-if="!isTypeimage(key)" style="cursor: pointer;"><span ng-click="OpenInNewTab(id)" title="{{key}}"><i class="fa fa-download"></i></span></td>' +
            '         <td><i class="icon-pencil"></i>{{key}}</td>' +
            '         <td ng-if="!config.options.singlefile"><input type="checkbox" style="opacity: 1;" ng-checked="isActive(id);" ng-click="toggleActive(id)" ng-disabled="isDisabled(id)"></td>' +
            '         <td ng-if="!config.options.singlefile"><input type="button" value="L&ouml;schen" ng-click="deleteFile(key)"></td>' +
            '        </tr>' +
            '      </tbody>' +
            '    </table>' +
            '    <br>Datei hinzuf&uuml;gen: <input type="file" name="file" id="fileupload{{config.name}}" cropWidth="800" cropHeight="600" maxSize="false" circle="false"/><input type="button" value="Upload" ng-click="uploadFile()"><br><br><br><progress min="0" max="100" value="0" id="fileuploadprogress{{config.name}}">0% complete</progress><span>{{uploadState}}</span>' +
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

            scope.loadId = function () {
                if (scope.config._idName != null) {
                    scope._id = scope.$parent.$parent[scope.config._idName];
                    scope.dir = scope.config.options.dirname.replace(':id', scope._id);
                } else {
                    if (scope.$parent.$parent.documentId != null) {
                        scope._id = scope.$parent.$parent.documentId;
                        scope.dir = scope.config.options.dirname.replace(':id', scope._id);
                    } else {
                        scope._id = "loadingError **** AngularJS";
                        scope.dir = scope.config.options.dirname.replace(':id', scope._id);
                    }
                }
                //console.log('dir', scope.dir);
            }
            scope.loadId();

            var t = scope.config.options.typeRegEx || '[.]*';
            scope.regex = new RegExp(t);
            scope.cropping = scope.config.options.cropping || {
                cropWidth: 600,
                cropHeight: 600,
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
                var extension = 'jpg';
                var name = "";
                if (scope.filename) {
                    name = scope.filename + "." + extension;
                } else {
                    var arr = e.file.name.split('.');
                    arr[arr.length - 1] = 'jpg';
                    name = arr.join('.');
                }
                scope.fsOp({
                    "op": "upload"
                }, function (e) {
                    if (e.success) {
                        scope.uploadState = 'Datei erfolgreich hochgeladen!';
                        scope.activateAllReminder = true;
                        scope.loadlist();
                    } else {
                        scope.uploadState = 'Hochladen fehlgeschlagen! Datei möglicherweise zu groß?';
                        scope.loadlist();
                        //alert("Upload Fehlgeschlagen!");
                    }
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }, e.dataUrl);
            });

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
                    fopReq.open("POST", "/files/.operations/fsop/" + data.op, true);
                    fopReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    data.field = scope.config.name;
                    data.config = scope.config.configPath;
                    data._id = scope._id;
                    var temp = '';
                    if (dataUrl) {
                        temp = '&file=' + encodeURIComponent(dataUrl);
                    }
                    fopReq.send("data=" + JSON.stringify(data) + temp);
                }
            };

            scope.uploadFileById = function (id, data, callback, progress) {
                scope.loadId();
                var formData = new FormData();
                data.field = scope.config.name;
                data.config = scope.config.configPath;
                formData.append("file", document.getElementById(id).files[0]);
                formData.append("data", JSON.stringify(data));

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
                xhr.open("POST", "/files/.operations/upload", true);
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
                var k = 0;
                for (var i in scope.images) {
                    k++;
                    break;
                }
                if (k < 1) {
                    if (!(scope._id)) {
                        $timeout(function () {
                            scope.load();
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

            scope.loadlist = function (startCrop) {
                scope.fsOp({
                    "op": "readdirsure"
                }, function (e) {
                    if (e.success) {
                        //console.log('sta');
                        for (var i in scope.images) {
                            delete scope.images[i];
                        }

                        for (var i in e.files) {
                            if (e.files[i].search(/\./) < 0) {
                                scope.images[e.files[i]] = scope.dir + e.files[i] + "/";
                            } else {
                                scope.images[e.files[i]] = scope.dir + e.files[i];
                            }
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
                        
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    } else {
                        alert("Error: " + e.info);
                    }
                });
            };

            scope.deleteFile = function (id) {
                var ret = confirm("Soll diese Datei wirklich gelöscht werden?");
                if (ret) {
                    scope.fsOp({
                        "op": "removefiles",
                        "files": [id]
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
                var win = window.open('/files' + url, '_blank');
                win.focus();
            }

            scope.uploadFile = function () {
                var uploadId = 'fileupload' + scope.config.name;
                var uploadProgressId = 'fileuploadprogress' + scope.config.name;
                if (scope.regex.test(document.getElementById(uploadId).files[0].type)) {
                    if (document.getElementById(uploadId).files[0].type.split('/')[0] == 'image') {
                        scope.c.crop(document.getElementById(uploadId).files[0], document.getElementById(uploadId), scope.cropping);
                    } else {
                        scope.uploadState = "Datei wird hochgeladen...";
                        scope.uploadFileById(uploadId, {}, function (err, data) {
                            if (err) {
                                scope.uploadState = "Upload fehlgeschlagen!";
                            } else {
                                var json;
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
                    }
                } else {
                    scope.uploadState = "Dateityp nicht erlaubt!";
                }
            };

            /*$timeout(function () {
                scope.load();
            }, 1000);*/
            
            scope.$watch('value', function(newValue, oldValue) {
                if (newValue)
                    scope.load();
            }, true);

        }
    };
});