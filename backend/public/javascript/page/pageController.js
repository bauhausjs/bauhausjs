angular.module('bauhaus.page.controllers', ['bauhaus.page.services']);

angular.module('bauhaus.page.controllers').controller('PageCtrl', ['$scope', '$routeParams', 'Page', 'PageType', 'PageTree', 'Content', 'PageContent', function ($scope, $routeParams, Page, PageType, PageTree, Content, PageContent) {
    'use strict';

    $scope.message = "Welcome to the page";
    $scope.currentPageId = $routeParams.id;

    $scope.pageTypes = {
        home: {
            title: "Home"
        },
        content: {
            title: "2-col Content"
        }
    }

    /** Checks if a page object has any children, used by UI **/
    $scope.hasChildren = function (page) {
        return page.children && Object.keys(page.children).length > 0 ? true : false;
    }

    $scope.isRoot = function (id) {
        return $scope.rootPageId === id ? true : false;
    }

    /** Sets current page to given id, used by UI to change current page,  **/
    $scope.changePage = function (id) {
        $scope.currentPageId = id;
    };

    /** Load page from server if currentPageId is changed **/
    $scope.$watch('currentPageId', function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            $scope.page = Page.get({ pageId: newVal }, function (result) {

            });
            // Load contents from server and assign to slots when ready
            $scope.content = PageContent.get({pageId: newVal}, function () {
                // reset slots
                $scope.slots = [];
                for (var c in $scope.content) {
                    var contentElement = $scope.content[c];
                    if (contentElement.meta) {
                        // get slot and position index from content element
                        var slot = contentElement.meta.slot;
                        var position = contentElement.meta.position;
                        if (! Array.isArray( $scope.slots[slot] ) ) {
                            $scope.slots[slot] = [];
                        }
                        $scope.slots[slot][position] = contentElement;
                    }
                }
            });
        }
    });

    /** Sends currently viewed page to server and update tree, to avoid tree reload **/
    $scope.updatePage = function (page) {
        Page.put(page, function (result) {
            if (result.path != null) {
                // Choose corrosponding page in tree to update without reload
                var pageInTree = $scope.getPageByPath(result.path, result._id);
                pageInTree.title = $scope.page.title;
            }
        });
    };

    $scope.getPageByPath = function (path, id) {
        var subtree = $scope.tree[ $scope.rootPageId ];
        // if path is empty, its assumed the user wants the root node
        if (path === '') return subtree;

        var hierachy = path.split(',');
        // remove first key, which is always empty
        hierachy.shift();
        if (hierachy[0] === $scope.rootPageId) hierachy.shift();

        for (var h in hierachy) {
            var childId = hierachy[h];
            if (subtree.children && subtree.children[childId]) {
                subtree = subtree.children[childId];
            }
        }
        if (subtree.children && subtree.children[id]) {
            return subtree.children[id];
        }
    }

    $scope.$watch('page._type', function (newVal) {
        if ($scope.pageTypes[newVal]) {
            $scope.currentPageType = $scope.pageTypes[newVal];
        }
    });

    
    /** Load tree on controller load **/
    PageTree.get(function (result) {
        $scope.tree = result.tree;
        // Set current id if /page was called without id
        if (!$scope.currentId) {
            for (var rootKey in $scope.tree) {
                $scope.rootPageId = rootKey;
                $scope.currentPageId = rootKey;
            }
        }
    });

    PageType.get(function (result) {
        $scope.pageTypes = result;
    });

}]);