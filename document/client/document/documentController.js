angular.module('bauhaus.document.controllers', ['bauhaus.document.services']);

angular.module('bauhaus.document.controllers').controller('DocumentListCtrl', ['$scope', '$location', '$routeParams', '$templateCache', 'DocumentService', 'SharedDocuments',  function ($scope, $location, $routeParams, $templateCache, DocumentService, SharedDocuments) {
    'use strict';

    $scope.type = $routeParams.type;
    $scope.documents = [];
    $scope.useAsLabel = 'title';
    $scope.icon = 'fa-file';

    $scope.service = DocumentService($scope.type);


    $scope.$watch('documentInfos.all.' + $scope.type, function (newVal) {
        if (newVal && newVal.fields) {
            $scope.modelConfig = newVal;
        }

        var query = $scope.modelConfig.query ? angular.copy($scope.modelConfig.query) : {};

        if ($scope.modelConfig.useAsLabel) {
            $scope.useAsLabel = $scope.modelConfig.useAsLabel;
        }
        if ($scope.modelConfig.icon) {
            $scope.icon = 'fa-' + $scope.modelConfig.icon;
        }
        if ($scope.modelConfig.templates && $scope.modelConfig.templates.listItem) {
            $templateCache.put('documentListViewItem.html', $scope.modelConfig.templates.listItem);
        }

        $scope.service.query(query, function (result) {
            var documents = [];
            for (var d in result) {
                if (result[d]._id) {
                    documents.push(result[d]);
                }
            }

            $scope.documents = documents;
        });
    });
    // reference shared documentInfo service to init loading
    $scope.documentInfos = SharedDocuments.store;




    $scope.createDocument = function () {
        $location.path('document/' + $scope.type + '/new')
    }

}]);

angular.module('bauhaus.document.controllers').controller('DocumentDetailCtrl', ['$scope', '$location', '$routeParams', 'DocumentService', 'SharedDocuments', function ($scope, $location, $routeParams, DocumentService, SharedDocuments) {
    'use strict';

    $scope.document = null;
    $scope.documentId = null;
    $scope.documentChanged = false;
    $scope.useAsLabel = 'title';

    $scope.$watch('document', function (newVal, oldVal) {
        if (newVal !== null && typeof newVal._id !== 'undefined' && oldVal !== null && typeof oldVal._id !== 'undefined') {
            $scope.documentChanged = true;
        }
    }, true)

    $scope.type = $routeParams.type;

    $scope.service = DocumentService($scope.type);

    $scope.modelConfig = {};

    $scope.$watch('documentInfos.all.' + $scope.type, function (newVal) {
        if (newVal && newVal.fields) {
            $scope.modelConfig = newVal;
        }

        if ($scope.modelConfig.useAsLabel) {
            $scope.useAsLabel = $scope.modelConfig.useAsLabel;
        }

        if ($routeParams.id && $routeParams.id != 'new') {
            // load document data for passed id
            $scope.reloadDocument();
        } else {
            $scope.document = {};
        }
    });
    // reference shared documentInfo service to init loading
    $scope.documentInfos = SharedDocuments.store;


    $scope.isNew = function () {
        return ($scope.document && $scope.document._id) ? false : true;
    };

    /* Replaces all objects with a field _id by a string of the id */
    function unpopulate (object) {
        var obj = angular.copy(object);
        for (var f in obj) {
            if (obj.hasOwnProperty(f)) {
                var field = obj[f];
                // replace field with object by id
                if (typeof field !== 'undefined' && field._id) {
                    obj[f] = field._id;
                }
                // replace field with array of objects by array of ids
                if (Array.isArray(field) &&
                    field.length > 0 &&
                    typeof field[0] === 'object' &&
                    field[0]._id) {

                    var ids = [];
                    for (var o in field) {
                        if (field[o]._id) {
                            ids.push(field[o]._id);
                        }
                    }
                    obj[f] = ids;
                }
            }
        }
        return obj;
    }


    $scope.reloadDocument = function () {
        var query = $scope.modelConfig.query ? angular.copy($scope.modelConfig.query) : {};
        query.id = $routeParams.id;
        $scope.service.get(query, function (result) {
            if (result && result._id) {
                $scope.document = result;
                $scope.documentChanged = false;
            }
        }); 
    };

    $scope.updateDocument = function () {
        var doc = unpopulate($scope.document);
        // Save document if it already has an _id
        if ($scope.document._id) {
            $scope.service.put(doc, function (result) {
                $scope.reloadDocument()
            });
        } else {
            // create new, empty document
            $scope.service.create({}, function (result) {
                $scope.document._id = result._id;
                $scope.documentId =   result._id;
                doc._id = result._id;

                $scope.service.put(doc, function (result) {
                    $scope.reloadDocument();
                });
            })
        }
    };

    $scope.deleteDocument = function () {
        var ok = confirm('Are you sure you want to delete ' + $scope.type + ' "' + $scope.document.name + '"');
        if (ok) {
            $scope.service.delete({}, {_id: $scope.document._id }, function (result) {
                $location.path('document/' + $scope.type);
            });
        }
    }


}]);
