angular.module('bauhaus.document.directives').directive('bauhausFile', function ($timeout) {
    return {
        restrict: 'AEC',
        template: '<div class="page-content-field" ng-blur="showSelect = false">' +
            '     <label class="page-content-field-label">{{config.label}}</label><br><br>' +
            '     <span>Es sind maximal {{limit}} Bilder aktivierbar.</span>' +
            '     <table class="table">' +
            ' <thead>' +
            '     <tr>' +
            '         <th>Bild</th>' +
            '         <th>Name</th>' +
            '         <th>Aktiv</th>' +
            '         <th>L&ouml;schen</th>' +
            '     </tr>' +
            ' </thead>' +
            ' <tbody>' +
            '     <tr ng-repeat="(key, id) in images" ng-class="getClass(key)">' +
            '         <td ng-if="isTypeimage(key)" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 40px; max-width: 100px;"></td>' +
            '         <td ng-if="!isTypeimage(key)" style="cursor: pointer;"><span ng-click="OpenInNewTab(id)" title="{{key}}"><i class="fa fa-download"></i></span></td>' +
            '         <td><i class="icon-pencil"></i>{{key}}</td>' +
            '         <td><input type="checkbox" style="opacity: 1;" ng-checked="isActive(id);" ng-click="toggleActive(id)" ng-disabled="isDisabled(id)"></td>' +
            '         <td><input type="button" value="L&ouml;schen" ng-click="deleteFile(id)"></td>' +
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
            scope.projectId = scope.$parent.$parent.documentId;
            var t = scope.config.options.typeRegEx || '[.]*';
            scope.regex = new RegExp(t);
            scope.cropping = scope.config.options.cropping || {
                cropWidth: 600,
                cropHeight: 600,
                maxSize: false,
                circle: false
            };
            scope.dir = '/projects/' + scope.projectId + '/' + scope.config.options.dirname + '/';
            scope.reloadnumber = ((new Date()).getTime());
            scope.imageQuery = 'transform=resize&width=80&height=50';
            scope.images = {};
            scope.projectidjson = '{"projectid": "' + scope.$parent.$parent.documentId + '"}';

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
                data.fsOp({
                    "op": "upload",
                    "dir": scope.dir,
                    "name": name
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
                        alert("Maximal " + scope.limit + " Bilder dürfen aktiviert werden!");
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
                //console.log('load dad');
                var k = 0;
                for (var i in scope.images) {
                    k++;
                    break;
                }
                if (k < 1) {
                    if (!(scope.$parent.$parent.documentId)) {
                        $timeout(function () {
                            scope.load();
                        }, 200);
                    } else {
                        scope.dir = '/projects/' + scope.$parent.$parent.documentId + '/' + scope.config.options.dirname + '/';
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
                data.fsOp({
                    "op": "readdirsure",
                    "dir": scope.dir
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
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    } else {
                        alert("Error: " + e.err);
                    }
                });
            };

            scope.deleteFile = function (id) {
                //console.log('komisch', scope.$parent.$parent.documentId);
                var ret = confirm("Bist du sicher dass du diese Datei löschen willst?");
                if (ret) {
                    data.fsOp({
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
                        data.uploadFileById(uploadId, {
                            'path': scope.dir,
                            'filename': scope.filename
                        }, function (err, data) {
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

            $timeout(function () {
                scope.load();
            }, 200);

        }
    };
});