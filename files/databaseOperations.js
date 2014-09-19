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

m.copyFile = function (id, name) {
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
                var filecopy = new File({
                    name: name
                });
                for (i in file) {
                    if (i != "name" && i != "_id") {
                        filecopy[i] = file[i];
                    }
                }

                filecopy.save(function (err, file) {
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
    }, '_id name', function (err, file) {
        if (err) {
            deferred.reject(err);
        } else {
            if (!file) {
                deferred.reject(true);
            } else {
                for (i in data) {
                    file[i] = data[i];
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
    File.find(function (err, files) {
        if (err) {
            deferred.reject(err);
        } else {
            var ex = {};
            for (i in files) {
                files[i].data = null;
                ex[files[i]._id] = files[i];
                delete ex[files[i]._id].data;
            }
            var temp = JSON.parse(JSON.stringify(ex));
            for (i in temp) {
                delete temp[i].data;
            }
            deferred.resolve(temp);
        }
    });
    return deferred.promise;
};