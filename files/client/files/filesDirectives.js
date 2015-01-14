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
            '         <td ng-if="isTypeimage(key)" style="cursor: pointer;"><img ng-click="OpenInNewTab(id)" ng-src="/files/files{{id}}?reload={{reloadnumber}}" title="{{key}}" style="max-height: 40px; max-width: 100px;"></td>' +
            '         <td ng-if="!isTypeimage(key)" style="cursor: pointer;"><span ng-click="OpenInNewTab(id)" title="{{key}}"><i class="fa fa-download"></i></span></td>' +
            '         <td ng-click="key = changeName(id, key)"><i class="icon-pencil"></i>{{key}}</td>' +
            '         <td><input type="checkbox" style="opacity: 1;" ng-checked="isActive(id);" ng-click="toggleActive(id)" ng-disabled="isDisabled(id)"></td>' +
            '         <td><input type="button" value="L&ouml;schen" ng-click="deleteFile(id)"></td>' +
            '        </tr>' +
            '      </tbody>' +
            '    </table>' +
            '    <br>Datei hinzuf&uuml;gen: <input type="file" name="file" id="fileupload" cropWidth="800" cropHeight="600" maxSize="false" circle="false"/><input type="button" value="Upload" ng-click="uploadFile()"><br><br><br><progress min="0" max="100" value="0" id="fileuploadprogress">0% complete</progress><span>{{uploadState}}</span>' +
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
            var t = scope.config.options.typeRegEx || '[.]*';
            scope.regex = new RegExp(t);
            scope.cropping = scope.config.options.cropping || {
                cropWidth: 600,
                cropHeight: 600,
                maxSize: false,
                circle: false
            };
            scope.dir = '/projects/' + scope.$parent.$parent.documentId + '/' + scope.config.options.dirname + '/';
            scope.reloadnumber = ((new Date()).getTime());
            scope.imageQuery = 'transform=resize&width=80&height=50';
            scope.images = {};
            scope.projectidjson = '{"projectid": "' + scope.$parent.$parent.projectId + '"}';

            scope.test = function (e) {
                //console.error("TOLLL");
            };
            scope.uploadState = 'Upload Status';

            scope.c = new cropImages();

            scope.c.listen('choice', function (e) {
                scope.uploadState = 'Datei wird eingelesen! Bitte warten...';
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });

            scope.c.listen('export', function (e) {
                scope.uploadState = 'Datei wird hochgeladen! Bitte warten...';
                if (!scope.$$phase) {
                    scope.$apply();
                }
                var arr = e.file.name.split('.');
                arr[arr.length - 1] = 'jpg';
                data.fsOp({
                    "op": "upload",
                    "dir": scope.dir,
                    "name": arr.join('.')
                }, function (e) {
                    if (e.success) {
                        scope.uploadState = 'Datei erfolgreich hochgeladen!';
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
                if (scope.value.files.indexOf(id) >= 0) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.isDisabled = function (id) {
                if (scope.value.files.indexOf(id) < 0 && scope.value.files.length == scope.limit) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.toggleActive = function (id) {
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

            scope.removeFromlist = function (id) {
                var ret = scope.value.files.indexOf(id);
                if (ret >= 0) {
                    scope.value.files.splice(ret, 1);
                    //console.log(scope.value.files);
                }
            };

            scope.checkLostFiles = function () {
                //console.log('checkLostFiles', scope.images);
                var rem = [];
                for (var i in scope.value.files) {
                    var arr = scope.value.files[i].split('/');
                    var key = arr[arr.length - 1];
                    if (!scope.images[key]) {
                        rem.push(scope.value.files[i]);
                    }
                }
                //console.log('rem', rem);
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
                        //console.log('fin');
                        scope.checkLostFiles();
                        //console.log('fin end');
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

            scope.changeName = function (id, oldname) {
                var name = prompt("Bitte gib einen neuen Namen ein.", oldname);
                if (name) {
                    data.fop({
                        "op": "changenameinfolder",
                        "projectid": scope.$parent.$parent.projectId,
                        "name": name,
                        "id": id
                    }, function (data) {
                        if (!data.success) {
                            for (i in scope.images) {
                                if (scope.images[i]._id == id) {
                                    scope.images[i].name = oldname;
                                    break;
                                }
                            }
                            alert("Fehlgeschlagen: " + data.err);
                        }
                    });
                } else {
                    var name = oldname;
                }
                return name;
            };

            scope.deleteFile = function (id) {

                //console.log('komisch', scope.$parent.$parent.documentId);
                var ret = confirm("Bist du sicher dass du dieses Bild löschen willst?");
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
                var win = window.open('/files/files' + url, '_blank');
                win.focus();
            }

            scope.uploadFile = function () {
                //console.log('test', document.getElementById('fileupload').files[0].type);
                if (scope.regex.test(document.getElementById('fileupload').files[0].type)) {
                    if (document.getElementById('fileupload').files[0].type.split('/')[0] == 'image') {
                        scope.c.crop(document.getElementById('fileupload').files[0], document.getElementById('fileupload'), scope.cropping);
                    } else {
                        scope.uploadState = "Datei wird hochgeladen...";
                        data.uploadFileById('fileupload', {
                            'path': scope.dir
                        }, function (err, data) {
                            if (err) {
                                scope.uploadState = "Upload fehlgeschlagen!";
                            } else {
                                try {
                                    var json = JSON.parse(data.responseText);
                                } catch (e) {
                                    scope.uploadState = "Upload fehlgeschlagen!";
                                }
                                if (json.success) {
                                    scope.uploadState = "Datei wurde erfolgreich hochgeladen!";
                                    scope.loadlist();
                                } else {
                                    scope.uploadState = "Upload fehlgeschlagen!";
                                }
                            }

                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        }, 'fileuploadprogress');
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