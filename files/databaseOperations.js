var File = require('./model/file');
var q = require('q');

var m = module.exports = {};

m.addDocument = function () {
    var file = new File({
        name: 'Furza'
    });
    file.save(function (err, file) {
        if (err) return console.error(err);
        console.log("saved");
    });
};


m.addFile = function (name, type) {
    var deferred = q.defer();

    var file = new File({
        name: name,
        type: type
    });

    file.save(function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(file._id);
        }
    });
    return deferred.promise;
};


m.addFileObject = function (obj) {
    var deferred = q.defer();

    var file = new File(obj);

    file.save(function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(file._id);
        }
    });
    return deferred.promise;
};

m.copyFile = function (id, name) {
    var deferred = q.defer();

    File.findOne({
        _id: id
    }, function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                var filecopy = {};
                filecopy.name = name;
                if (file.data) {
                    filecopy.data = file.data;
                }
                if (file.metadata) {
                    filecopy.metadata = file.metadata;
                }
                if (file.type) {
                    filecopy.type = file.type;
                }
                filecopy.parent = "";
                if (filecopy.type == 1 || filecopy.type == 0) {
                    filecopy.content = [];
                }
                console.log(filecopy);

                m.addFileObject(filecopy).then(function (data) {
                    deferred.resolve(data);
                }, function (err) {
                    deferred.reject(err);
                });
            }
        }
    });


    return deferred.promise;
};

m.deleteFile = function (id) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, '_id name', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                file.remove(function () {
                    deferred.resolve(true);
                });
            }
        }
    });
    return deferred.promise;
};

m.deleteCached = function (id) {
    var deferred = q.defer();
    File.find({
        parentId: id
    }, '_id parentId', function (err, files) {
        if (err) {
            deferred.reject(err);
        } else {
            var c = 0;
            for(var i in files){
                var file = files[i];
                if (file) {
                    file.remove(function () {
                        c++;
                        if(files.length == c){
                            deferred.resolve(c+" from "+files.length+" deleted good!");
                        }
                    });
                }
            }
            if(files.length < 1){
                deferred.resolve(c+" from "+files.length+" deleted good!");
            }
        }
    });
    return deferred.promise;
};

m.getFileBuffer = function (id) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, '_id data', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                if (file.data) {
                    deferred.resolve(file.data);
                } else {
                    deferred.reject(true);
                }
            }
        }
    });
    return deferred.promise;
};

m.getFile = function (id) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, '_id data metadata', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                if (file.data && file.metadata) {
                    deferred.resolve({
                        "buffer": file.data,
                        "metadata": file.metadata
                    });
                } else {
                    deferred.reject(true);
                }
            }
        }
    });
    return deferred.promise;
};

m.setFileBuffer = function (id, buffer) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, '_id name', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                file.data = buffer;
                file.save(function (err, file) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(file._id);
                    }
                });
            }
        }
    });
    return deferred.promise;
};

m.setFileData = function (id, buffer, metadata) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, '_id name metadata', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                file.data = buffer;
                file.metadata = metadata;
                file.save(function (err, file) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(file._id);
                    }
                });
            }
        }
    });
    return deferred.promise;
};

m.setFileInfo = function (id, data) {
    var deferred = q.defer();
    File.findOne({
        _id: id
    }, function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                for (var k in data) {
                    if(k != "_id"){
                        file[k] = data[k];
                        console.log("set file "+k+" "+JSON.stringify(file[k]));
                    }
                }
                file.save(function (err, file) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(file._id);
                    }
                });
            }
        }
    });
    return deferred.promise;
};

m.getFilesInfoWithoutBuffer = function () {
    var deferred = q.defer();
    File.find({}, '_id name type content parent metadata', function (err, files) {
        if (err) {
            deferred.reject(err);
        } else {
            var ex = {};
            for (var i in files) {
                if (files[i].name) {
                    //files[i].data = null;
                    ex[files[i]._id] = files[i];
                    //delete ex[files[i]._id].data;
                    //delete ex[files[i]._id].__v;
                    //delete ex[files[i]._id].metadata;
                }
            }
            var temp = JSON.parse(JSON.stringify(ex));
            for (i in temp) {
                //delete temp[i].data;
                //delete temp[i].__v;
                //delete temp[i].metadata;
            }
            deferred.resolve(temp);
        }
    });
    return deferred.promise;
};