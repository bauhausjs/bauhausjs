angular.module('bauhaus.document.controllers', ['bauhaus.document.services']);

angular.module('bauhaus.document.controllers').controller('DocumentListCtrl', ['$scope', '$location', '$routeParams', 'DocumentService',  function ($scope, $location, $routeParams, DocumentService) {
    'use strict';

    $scope.type = $routeParams.type;
    $scope.documents = [];

    $scope.service = DocumentService($scope.type);

    $scope.service.query({}, function (result) {
        var documents = [];
        for (var d in result) {
            if (result[d]._id) {
                documents.push(result[d]);
            }
        }

        $scope.documents = documents;
    });

    $scope.createDocument = function () {
        $location.path('document/' + $scope.type + '/new')
    }

}]);

angular.module('bauhaus.document.controllers').controller('DocumentDetailCtrl', ['$scope', '$location', '$routeParams', 'DocumentService', 'SharedDocuments', function ($scope, $location, $routeParams, DocumentService, SharedDocuments) {
    'use strict';

    $scope.document = null;
    $scope.documentId = null;

    $scope.type = $routeParams.type;

    $scope.service = DocumentService($scope.type);

    $scope.customFields = {};

    $scope.$watch('documentInfos.all.' + $scope.type, function (newVal) {
        if (newVal && newVal.fields) {
            $scope.customFields = newVal;
        }
    });

    $scope.documentInfos = SharedDocuments.store;

    if ($routeParams.id && $routeParams.id != 'new') {
        $scope.documentId = $routeParams.id;
        // load document data for passed id
        $scope.service.get({ id: $scope.documentId }, function (result) {
            if (result && result._id) {
                $scope.document = result;
            }
        });
    } else {
        $scope.document = {};
    } 

    $scope.isNew = function () {
        return ($scope.document && $scope.document._id) ? false : true;
    };

    $scope.updateDocument = function () {
        // Save document if it already has an _id
        if ($scope.document._id) {
            $scope.service.put($scope.document, function (result) {

            });
        } else {
            // create new, empty document
            $scope.service.create({}, function (result) {
                $scope.document._id = result._id;
                $scope.documentId =   result._id;

                $scope.service.put($scope.document, function (result) {
                    // document saved
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