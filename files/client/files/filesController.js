angular.module('bauhaus.files.controllers', ['bauhaus.files']);

angular.module('bauhaus.files.controllers').controller('filesController', ['$scope',
    function ($scope) {
        $scope.reverse = false;
        $scope.sortby = "";
        $scope.searchText = "";
        
        $scope.order = function (predicate) {
            if ($scope.sortby != predicate) {
                $scope.reverse = false;
            } else {
                $scope.reverse = !$scope.reverse;
            }
            $scope.sortby = predicate;
        };


        $scope.c = new cropImages();

        $scope.lan = 'cool';

        // Load Handler ----------------------------
        $scope.loadinginfo = "";
        $scope.loadshow = 'none';
        $scope.updateLoad = function () {
            if ($scope.loadinginfo == "") {
                $scope.loadshow = 'none';
                //tab.position("slide10In");
            } else {
                $scope.loadshow = 'block';
                //tab.position("slideOut");
                document.getElementById('loadingslide').className = 'loadingslideIN';
            }
        }
        /*data.databind('loadinginfo', function (x) {
            //console.log("Data: "+JSON.stringify(x));
            $scope.loadinginfo = x;
            $scope.updateLoad();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });*/

        // File Edit Handler =============================

        $scope.fileedit = false;
        $scope.filesrc = "";
        $scope.filenamecache = "";

        $scope.editopen = function (id) {
            console.log(id);
            $scope.fileedit = true;
            $scope.filedata = $scope.dirObject[id];
            $scope.filesrc = "http://localhost:1919/files/" + id + ".jpg";
            $scope.filenamecache = $scope.filedata.name;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.editclose = function () {
            $scope.fileedit = false;
            $scope.filesrc = "";

            var cb = function (e) {
                if (e.success && e.dirObject) {
                    $scope.dirObject = e.dirObject;
                    $scope.update();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else {
                    alert("Error: " + e.error);
                }
                //console.log(e);
            };

            if ($scope.filenamecache != $scope.filedata.name) {
                data.fop({
                    "op": "changename",
                    "id": $scope.filedata._id,
                    "name": $scope.filedata.name
                }, cb);
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.editgeneratelink = function () {
            var id = $scope.filedata._id;
            if ($scope.dirObject[id] && $scope.dirObject[id].type == 2) {
                return "http://localhost:1919/files/" + id;
            }
        };

        $scope.imagereload = function (e) {
            //console.log("imgrefresh");

            //console.log(e);
            $scope.filesrc = e.dataURL

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };


        // Alert handler   ---------------------------------------------------------
        $scope.alertinfo = "";
        $scope.alertshow = 'none';
        $scope.updateAlert = function () {
            //console.log("Update Angular "+$scope.alertinfo);
            if ($scope.alertinfo == "") {
                $scope.alertshow = 'none';
                if (!$scope.shareshowbool) {
                    //tab.position("slideOut");
                }
            } else {
                $scope.alertshow = 'block';
                //tab.position("slideIn");
            }
        }
        /*data.databind('alertinfo', function (x) {
            //console.log("Data: "+JSON.stringify(x));
            $scope.alertinfo = x;
            $scope.updateAlert();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });*/

        $scope.unalert = function () {
            data.alertinfo = "";
            $scope.alertinfo = "";
            $scope.updateAlert();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        // Something else -------------------------------------------
        $scope.dirObject = {};
        /*if (data.actualDir != "") {
            $scope.actualDir = data.actualDir;
        } else {
            $scope.actualDir = data.login.userID;
            data.actualDir = data.login.userID;
        }*/
        //$scope.mainDir = data.login.userID;
        $scope.dirShow = [];
        $scope.superFolder = [];
        $scope.activeObject = {};
        $scope.activeArray = [];
        $scope.actactive = "";
        $scope.inactivetimer;
        $scope.lastactivate;
        $scope.activenum = 0;

        //addFile.AddFile = false;
        //addFile.AddFileChoice = false;

        $scope.getactive = function (key) {
            if ($scope.activeArray[key]) {
                return "fileListUlactive";
            }
            return "fileListUlli";
        }

        $scope.setactive = function ($event, key) {
            if ($scope.draganddropactive != true) {
                if (!$event.ctrlKey && !$event.metaKey && !$event.shiftKey) {
                    $scope.lastactivate = null;
                    $scope.lastactivate;
                    $scope.activeArray = null;
                    $scope.activeArray = [];
                }
                if ($scope.activeArray != [] && $event.shiftKey) {
                    if ($scope.lastactivate) {
                        var i = $scope.getPos(key);
                        var k = $scope.getPos($scope.lastactivate);
                        //console.log("von "+i+" nach "+k);
                        if (i > k) {
                            var o = i;
                            i = k;
                            k = o;
                        }
                        while (i <= k) {
                            //console.log("count"+i);
                            $scope.activeArray[$scope.dirShow[i]] = true;
                            i++;
                        }
                    } else {
                        $scope.activeArray[key] = true;
                        $scope.lastactivate = key;
                    }
                }
                if (!event.shiftKey) {
                    if ($scope.activeArray[key]) {
                        $scope.activeArray[key] = false;
                    } else {
                        $scope.activeArray[key] = true;
                        $scope.lastactivate = key;
                    }
                }
                var selectionarray = [];
                var activecount = 0;
                for (i in $scope.activeArray) {
                    if ($scope.activeArray[i] == true) {
                        activecount++;
                        selectionarray.push(i);
                    }
                }
                data.selectionarray = selectionarray;
                selectionarray = null;
                $scope.activenum = activecount;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        }

        $scope.getPos = function (key) {
            var i = 0;
            while ($scope.dirShow[i] != key && $scope.dirShow.length >= i) {
                i++;
            }
            return i;
        }

        $scope.setinactive = function ($event) {
            if (!$event.ctrlKey && !$event.metaKey && !$event.shiftKey) {
                $scope.forceinactiv();
            }
        }

        $scope.forceinactiv = function () {
            $scope.lastactivate = null;
            $scope.lastactivate;
            $scope.activeArray = null;
            $scope.activeArray = [];
            $scope.changeNameOff();
            var selectionarray = [];
            var activecount = 0;
            for (i in $scope.activeArray) {
                if ($scope.activeArray[i] == true) {
                    activecount++;
                    selectionarray.push(i);
                }
            }
            data.selectionarray = selectionarray;
            selectionarray = null;
            $scope.activenum = activecount;
        };

        $scope.getServerAddress = function () {
            return "no address";
            //return global.config.serveraddress;
        };

        // Drag and Drop -----------------------------------------------

        $scope.draganddrop = false;
        $scope.draganddropactive = false;
        $scope.elmdisplay = "none";
        $scope.moveto = "none";
        $scope.movetofile = "";
        $scope.movefromdir = "";
        $scope.elmtop = 300;
        $scope.elmleft = 300;

        $scope.clog = function () {
            //console.log('mousemove cLOG');
        }

        $scope.mousedown = function (key, $event) {
            if ($scope.activeArray[key] == true) {
                //$scope.elmtop   = $event.clientY-global.chY;
                //$scope.elmleft  = $event.clientX;
                $scope.draganddrop = true; // INCOMMENT
                //$scope.elmdisplay = "block";
            }
        };

        $scope.mouseup = function () {
            if ($scope.draganddrop == true && $scope.movetofile != "" && $scope.movetofile != $scope.actualDir) {
                //console.log("Move files " + JSON.stringify(data.selectionarray) + " to " + $scope.movetofile);
                data.fop({
                    "op": "move",
                    "moveobject": {
                        "files": data.selectionarray,
                        "fromid": $scope.actualDir,
                        "toid": $scope.movetofile
                    }
                }, function (e) {
                    if (e.success && e.dirObject) {
                        $scope.dirObject = e.dirObject;
                        $scope.update();
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else {
                        alert("Error: " + e.error);
                    }
                });
                //L3.moveFileList(data.selectionarray, $scope.movetofile, $scope.actualDir);
            }
            $scope.draganddrop = false;
            $scope.elmdisplay = "none";
            $scope.draganddropactive = false;

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.mousemove = function ($event) {

            //console.log("MOVE");
            if ($scope.draganddrop == true) {
                var y = $event.clientY - 50;
                var x = $event.clientX - 205;
                //console.log("UPDATE " + y + " " + x);

                $scope.elmtop = y;
                $scope.elmleft = x;
                $scope.elmdisplay = "block";
                $scope.draganddropactive = true;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        };

        $scope.mouseover = function (key) {
            if ($scope.activeArray[key] == true || ($scope.dirObject[key] && $scope.dirObject[key].type == 2)) {
                $scope.moveto = "...";
                $scope.movetofile = "";
            } else {
                if ($scope.dirObject[key]) {
                    $scope.moveto = $scope.dirObject[key].name;
                } else {
                    if (key == "4DELETED00") {
                        $scope.moveto = "DELETED";
                    } else {
                        $scope.moveto = "NO NAME FOUND";
                    }
                }
                $scope.movetofile = key;
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.mouseout = function () {
            $scope.moveto = "...";
            $scope.movetofile = "";

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };


        // Move / Copy  ---------------------------------------------

        $scope.moveclipboard;
        $scope.cilpboardaction;

        globalEvent.ctrlbind('X', function () {
            //if (uiControl.lastview == 'files') {
            //console.log("CRTL+X");
            $scope.moveclipboard = data.selectionarray;
            $scope.cilpboardaction = 'move';
            $scope.movefromdir = $scope.actualDir;
            data.set('alertinfo', 'Saved to clipboard!');
            //}
        });

        globalEvent.ctrlbind('C', function () {
            //if (uiControl.lastview == 'files') {
            //console.log("CRTL+C");
            $scope.moveclipboard = data.selectionarray;
            $scope.cilpboardaction = 'copy';
            $scope.movefromdir = $scope.actualDir;
            data.set('alertinfo', 'Saved to clipboard!');
            //}
        });

        globalEvent.ctrlbind('V', function () {
            //if (uiControl.lastview == 'files') {
            //console.log("CRTL+V");
            if ($scope.cilpboardaction == 'move') {
                //console.log("Move files " + JSON.stringify($scope.moveclipboard) + " to " + $scope.actualDir);
                data.fop({
                    "op": "move",
                    "moveobject": {
                        "files": $scope.moveclipboard,
                        "fromid": $scope.movefromdir,
                        "toid": $scope.actualDir
                    }
                }, function (e) {
                    if (e.success && e.dirObject) {
                        $scope.dirObject = e.dirObject;
                        $scope.update();
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else {
                        alert("Error: " + e.error);
                    }
                });
                //L3.moveFileList($scope.moveclipboard, $scope.actualDir, $scope.movefromdir);
            }
            if ($scope.cilpboardaction == 'copy') {
                //console.log("Copy files " + JSON.stringify($scope.moveclipboard) + " to " + $scope.actualDir);
                data.fop({
                    "op": "copy",
                    "copyobject": {
                        "files": $scope.moveclipboard,
                        "toid": $scope.actualDir,
                        "fromid": $scope.movefromdir
                    }
                }, function (e) {
                    if (e.success && e.dirObject) {
                        $scope.dirObject = e.dirObject;
                        $scope.update();
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else {
                        alert("Error: " + e.error);
                    }
                });
                //L3.copyFileList($scope.moveclipboard, $scope.actualDir, $scope.movefromdir);
            }
            $scope.cilpboardaction = '';
            //}
        });

        globalEvent.ctrlbind('A', function () {
            //console.log("CRTL+A");
            for (i in $scope.dirShow) {
                $scope.activeArray[$scope.dirShow[i]] = true;
            }
            var selectionarray = [];
            var activecount = 0;
            for (i in $scope.activeArray) {
                if ($scope.activeArray[i] == true) {
                    activecount++;
                    selectionarray.push(i);
                }
            }
            data.selectionarray = selectionarray;
            selectionarray = null;
            $scope.activenum = activecount;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });

        $scope.deleteSelection = function () {
            data.fop({
                "op": "delete",
                "deleteobject": {
                    "deletelist": data.selectionarray,
                    "fromid": $scope.actualDir
                }
            }, function (e) {
                console.warn(e);
                if (e.success && e.dirObject) {
                    $scope.dirObject = e.dirObject;
                    $scope.update();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else {
                    alert("Error: " + e.error);
                }
            });
            //L3.moveFileList(data.selectionarray, data.deleteDir, $scope.actualDir);
        };


        // Filelist creation --------------------------------------------
        $scope.update = function () {
            $scope.forceinactiv();
            for(i in $scope.dirObject){
                $scope.dirObject[i].name_cache = $scope.dirObject[i].type+$scope.dirObject[i].name;
            }
            
            var id = $scope.actualDir;
            var tempdir = $scope.dirObject[id].content;
            if (tempdir[0] == "") {
                tempdir = [];
            }
            var tempdirX = [];
            for (i in tempdir) {
                if (!(tempdir[i] in $scope.dirObject)) {
                    tempdirX.push(tempdir[i]);
                    tempdir.splice(i, 1);
                }
            }
            for (i in tempdirX) {
                L3.checkKillLink(id, tempdirX[i]);
            }
            $scope.dirShow = tempdir;
            //console.log($scope.dirShow);
            var temparray = [];
            temparray.push(id);
            while (id != $scope.mainDir) {
                if (id in $scope.dirObject) {
                    if ($scope.dirObject[id].parent in $scope.dirObject) {
                        id = $scope.dirObject[id].parent;
                    } else {
                        id = dirCreator.searchParent(id, $scope.dirObject);
                        if (!id) {
                            id = $scope.mainDir;
                        }
                    }
                } else {
                    //console.log("Search " + id);
                    //id = dirCreator.searchParent(id);
                    //console.log("Found  " + id);
                    if (!id) {
                        //    id = $scope.mainDir;
                    }
                }
                temparray.push(id);
            }
            temparray.reverse();
            $scope.superFolder = null;
            $scope.superFolder = temparray;
            temparray = null;
            $scope.order('name_cache');
        };

        $scope.openFileAngu = function (id) {
            //console.log("Openfile: " + id);
            //console.log($scope.dirObject[id].type);
            switch ($scope.dirObject[id].type) {
            case 2:
                //console.log("Openfile: = = = > FILE");
                //Datei Oeffnen
                $scope.editopen(id);

                $scope.cilpboardaction = '';
                //$scope.c = null;
                //$scope.c = new cropImages();
                $scope.c.addEventListeners();
                //uiControl.loadFile(id);
                break;
            case 1:
                //console.log("Openfile: = = = > FOLDER");
                $scope.forceinactiv();
                $scope.actualDir = id;
                data.actualDir = id;
                $scope.update();
                //$scope.update();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }

                //this.showDir(id);
                //this.generateFileSuperPath(id);
                //this.lastDir = id;
                break;
            case 0:
                //console.log("Openfile: = = = > FOLDER");
                $scope.forceinactiv();
                $scope.actualDir = id;
                data.actualDir = id;
                $scope.update();
                //$scope.update();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }

                //this.showDir(id);
                //this.generateFileSuperPath(id);
                //this.lastDir = id;
                break;
            }
        };

        $scope.getIconClass = function (key) {

            switch ($scope.dirObject[key].type) {
            case 2:
                return "fa fa-file-text";
                break;
            case 1:
                return "fa fa-folder";
                break;
            case 0:
                return "fa fa-folder";
                break;
            };
        };

        // Change FileName handler =============================================

        $scope.changeNameId = "";

        $scope.changeNameE = function (key) {
            if (data.selectionarray.indexOf(key) >= 0) {
                $scope.changeNameId = key;
                //document.getElementById('chNa'+key).select();
                //document.execCommand('selectAll',false,null);
                setTimeout("document.getElementById('chNa" + key + "').focus();", 100);
                setTimeout("document.execCommand('selectAll',false,null);", 120);
                //dada.select();
            }
        };

        $scope.changeNameOff = function () {
            $scope.changeNameId = '';
        }

        $scope.changeNameClass = function (key) {
            if ($scope.changeNameId == key) {
                return "changeNameEdit";
            } else {
                return "changeNameInactive";
            }
        };

        $scope.changeNameDisa = function (key) {
            if ($scope.changeNameId == key) {
                return true;
            } else {
                return false;
            }
        };

        $scope.changeNameUpdate = function (key) {
            $scope.dirObject[key].name = document.getElementById('chNa' + key).innerText;
            document.getElementById('chNa' + key).innerHTML = $scope.dirObject[key].name;
            //console.log("NEWNAME = " + $scope.dirObject[key].name);
            L3.setFileInfo('name', key, $scope.dirObject[key].name);
        };

        $scope.chKeyDown = function (key, e) {
            if (e.keyCode == 13) {
                $scope.changeNameOff();
                $scope.changeNameUpdate(key);
                return false;
            }
        };


        $scope.isEmpty = function (value) {
            return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
        };
        $scope.resolveName = function (id) {
            return "No Name";
            //return data.getUserName(id);
        };
        $scope.resolveId = function (name) {
            return "No ID";
            //return data.getUserId(name);
        };

        globalEvent.eventbind('mouseup', function (e) {
            $scope.mouseup(e);
        });

        globalEvent.eventbind('mousemove', function (e) {
            $scope.mousemove(e);
        });

        globalEvent.eventbind('imagereload', function (e) {
            $scope.imagereload(e);
        });

        $scope.searchMainDir = function () {
            for (i in $scope.dirObject) {
                if ($scope.dirObject[i].type === 0) {
                    $scope.fileinfoid = i;
                    $scope.actualDir = i;
                    data.actualDir = i;
                    $scope.mainDir = i;
                    return true;
                }
            }
            return false;
        };

        // Tab Handler
        //tab.deactivateAll();

        $scope.refreshDir = function () {
            data.fop({
                "op": "list"
            }, function (e) {
                console.warn(e);
                if (e.success && e.dirObject) {
                    $scope.dirObject = e.dirObject;
                    $scope.update();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else {
                    alert("Error: " + e.error);
                }
            });
        };


        data.fop({
            "op": "list"
        }, function (cb) {
            console.warn(cb);
            if (cb.success && cb.dirObject) {
                $scope.dirObject = cb.dirObject;
                if (!$scope.searchMainDir()) {
                    $scope.fileinfoid = "5412a796861b588f45e9710f";
                    $scope.actualDir = "5412a796861b588f45e9710f";
                    data.actualDir = $scope.actualDir;
                    $scope.mainDir = "5412a796861b588f45e9710f";
                    console.error("Couldn't find the root dir!");
                }
                $scope.update();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            } else {
                console.error("Couldn't get dir list!");
            }
        });

        data.binducb(function (e) {
            $scope.dirObject = e;
            $scope.update();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });

        //$scope.fileinfoid = "5412a796861b588f45e9710f";
        //$scope.actualDir = "5412a796861b588f45e9710f";
        //$scope.mainDir = "5412a796861b588f45e9710f";
        //$scope.dirObject = testfs.data;
        //$scope.update();
        //$scope.filedata = $scope.dirObject[$scope.fileinfoid];
        //$scope.updateShare();
        //$scope.getProposals();
        //if (!$scope.$$phase) {
        //    $scope.$apply();
        //}
        //}

            }]);