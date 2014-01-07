angular.module('bauhaus.page.controllers', ['bauhaus.page.services']);

angular.module('bauhaus.page.controllers').controller('PageCtrl', ['$scope', '$routeParams', '$location', 'Page', 'PageType', 'PageTree', 'Content', 'PageContent', 'SharedPageTree', function ($scope, $routeParams, $location, Page, PageType, PageTree, Content, PageContent, SharedPageTree) {
    'use strict';

    /* Add shared tree scope to local scope */
    $scope.store = SharedPageTree.store;

    // Set current page variable to path var, automatically laods page via watcher
    if ($routeParams.id) {
        $scope.store.current.pageId = $routeParams.id;
    }

    $scope.pageTypes = {};


    $scope.$watch('store.tree', function (newVal, oldVal) {
        if (oldVal == null && newVal != null && !$scope.store.current.pageId) {
            for (var rootKey in newVal) {
                $scope.store.current.rootPageId = rootKey;
                $scope.store.current.pageId = rootKey;
            }
        }
    })

    /** Checks if a page object has any children, used by UI **/
    $scope.hasChildren = function (page) {
        return page.children && Object.keys(page.children).length > 0 ? true : false;
    }

    $scope.isRoot = function (id) {
        return $scope.store.current.rootPageId === id ? true : false;
    }

    $scope.expand = function (page) {
        $scope.store.expanded[page._id] = true;
        $scope.forEachParentByPath(page.path, page._id, function (parent) {
            $scope.store.expanded[parent._id] = true;
            if (!parent.open) parent.open = true;
        });
    }

    $scope.toggle = function (page) {
        var newStatus = ($scope.store.expanded[page._id] && $scope.store.expanded[page._id] === true) ? false : true;
        $scope.store.expanded[page._id] = newStatus;
    };

    $scope.isExpanded = function (page) {
        // always expand root
        if (page.parentId === null) return true;
        return ($scope.store.expanded[page._id] && $scope.store.expanded[page._id] === true) ? true : false;
    };

    /** Sets current page to given id, used by UI to change current page,  **/
    $scope.changePage = function (id) {
        $scope.store.current.pageId = id;
        $location.path('page/' + id);
    };

    /** Load page from server if currentPageId is changed **/
    $scope.$watch('store.current.pageId', function (newVal, oldVal) {
        if (newVal) {
            $scope.page = Page.get({ pageId: newVal }, function (result) {
                $scope.expand(result)
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

    /* Create new child page at rest service, called from UI */
    $scope.newPage = function (page) {
        var newPage = {
            parentId: page._id,
            title: 'New page',
            route: page.route + '/newpage',
            _type: page._type
        };

        Page.create(newPage, function (result) {
            if (!page.children) page.children = {};
            page.children[ result._id ] = result;
            $scope.changePage(result._id);
        });
    };

    /* Deletes page at rest service, called by UI */
    $scope.deletePage = function (page) {
        var pageInTree = $scope.getPageByPath(page.path, page._id);

        if (pageInTree.children && Object.keys(pageInTree.children).length > 0) {
            alert('You cannot delete this page because it has sub page. Please delete this pages first.');
            return;
        }
        var del = confirm('Do you really want to delete this page?');
        if (del) {
            Page.delete({pageId: page._id }, function (result) {
                $scope.deletePageByPath(page.path, page._id);
                var parentId = $scope.getParentId(page);
                $scope.changePage(parentId);
            });
        }

    };

    /* Get a page from stored tree by path */
    $scope.getPageByPath = function (path, id) {
        var subtree = $scope.store.tree[ $scope.store.current.rootPageId ];
        // if path is empty, its assumed the user wants the root node
        if (path === '') return subtree;

        var hierachy = path.split(',');
        // remove first key, which is always empty
        hierachy.shift();
        if (hierachy[0] === $scope.store.current.rootPageId) hierachy.shift();

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

    $scope.deletePageByPath = function (path, id) {
        var subtree = $scope.store.tree[ $scope.store.current.rootPageId ];
        // if path is empty, its assumed the user wants the root node
        if (path === '') return subtree;

        var hierachy = path.split(',');
        // remove first key, which is always empty
        hierachy.shift();
        if (hierachy[0] === $scope.store.current.rootPageId) hierachy.shift();

        for (var h in hierachy) {
            var childId = hierachy[h];
            if (subtree.children && subtree.children[childId]) {
                subtree = subtree.children[childId];
            }
        }
        if (subtree.children && subtree.children[id]) {
            delete subtree.children[id];
        } 
    }

    $scope.forEachParentByPath = function (path, id, callback) {
        if ($scope.store.tree) {
            var subtree = $scope.store.tree[ $scope.store.current.rootPageId ];
            // if path is empty, its assumed the user wants the root node
            if (path === '') return;

            var hierachy = path.split(',');
            // remove first key, which is always empty
            hierachy.shift();
            if (hierachy[0] === $scope.store.current.rootPageId) hierachy.shift();

            for (var h in hierachy) {
                var childId = hierachy[h];
                if (subtree.children && subtree.children[childId]) {
                    subtree = subtree.children[childId];
                    callback(subtree);
                }
            }
        }
    };

    $scope.getParentId = function (page) {
        if (page.path === '') return null;

        var splittedPath = page.path.split(',');
        return splittedPath[ splittedPath.length - 1 ];
    };

    PageType.get(function (result) {
        $scope.pageTypes = result;
    });

    /** Change currentPageType if type is changed by user **/
    $scope.$watch('page._type', function (newVal) {
        if ($scope.pageTypes[newVal]) {
            $scope.currentPageType = $scope.pageTypes[newVal];
        }
    });


}]);