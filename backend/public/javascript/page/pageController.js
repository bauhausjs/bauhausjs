angular.module('bauhaus.page.controllers', ['bauhaus.page.services']);

angular.module('bauhaus.page.controllers').controller('PageCtrl', ['$scope', '$routeParams', '$location', 'Page', 'SharedPageType', 'SharedContentType', 'PageTree', 'Content', 'PageContent', 'SharedPageTree', function ($scope, $routeParams, $location, Page, SharedPageType, SharedContentType, PageTree, Content, PageContent, SharedPageTree) {
    'use strict';

    /* Add shared tree scope to local scope */
    $scope.tree = SharedPageTree.tree;
    $scope.pageTypes = SharedPageType.store;
    $scope.contentTypes = SharedContentType.store;

    // Set current page variable to path var, automatically laods page via watcher
    if ($routeParams.id) {
        $scope.tree.current.pageId = $routeParams.id;
    }

    $scope.pageHasChanges = false;
    $scope.contentHasChanges = {};
    $scope.slots = [];

    /** Sets current page to given id, used by UI to change current page,  **/
    $scope.changePage = function (id) {
        //$scope.tree.current.pageId = id;
        $location.path('page/' + id);
    };

    /** Load page from server if currentPageId is changed **/
    $scope.$watch('tree.current.pageId', function (newVal, oldVal) {
        if (newVal) {
            $scope.page = Page.get({ pageId: newVal }, function (result) {
                $scope.tree.expand(result);
                $scope.pageHasChanges = false;
                $scope.showPageLabel = ($scope.page.label && $scope.page.label.length != null && $scope.page.label.length > 0);
            });
            // Load contents from server and assign to slots when ready
            $scope.content = PageContent.get({pageId: newVal}, function () {
                // reset slots
                $scope.slots = [];

                // add slots if unexistend
                if ($scope.currentPageType) {
                    while ($scope.currentPageType.slots.length > $scope.slots.length) {
                        $scope.slots.push([]);
                    }
                }
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

                        $scope.watchContent(slot, position);
                    }
                }
            });
        }
    });

    $scope.watchContent = function (slot, position) {
        $scope.$watch(function () { return $scope.slots[slot][position] }, function (newVal, oldVal) {
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal) ) {
                var coordinates = [slot, position];
                if ($scope.contentHasChanges[ newVal._id ] == null) {
                    $scope.contentHasChanges[ newVal._id ] = [slot, position];
                }
            }
        }, true); 
    }

    $scope.$watch('page', function (newVal, oldVal) {
        if (newVal && newVal._id && oldVal && oldVal._id) {
            $scope.pageHasChanges = true;
        }
    }, true);



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

    /** Sends currently viewed page and updated content to server and update tree, to avoid tree reload **/
    $scope.updatePage = function (page) {
        if ($scope.pageHasChanges) {
            Page.put(page, function (result) {
                if (result.path != null) {
                    // Choose corrosponding page in tree to update without reload
                    var pageInTree = $scope.tree.getByPath(result.path, result._id);
                    pageInTree.title = $scope.page.title;
                }
                $scope.pageHasChanges = false;
            });
        }

        // iterate over all content elements, which were updated
        for (var id in $scope.contentHasChanges) {
            var position = $scope.contentHasChanges[ id ];
            var content = $scope.slots[position[0]][position[1]];
            Content.put(content, function (result) {
                // remove content from list of content blocks which should be updated
                delete $scope.contentHasChanges[ id ];
            });
        }
    };

    /* Deletes page at rest service, called by UI */
    $scope.deletePage = function (page) {
        var pageInTree = $scope.tree.getByPath(page.path, page._id);

        if (pageInTree.children && Object.keys(pageInTree.children).length > 0) {
            alert('You cannot delete this page because it has sub page. Please delete this pages first.');
            return;
        }
        var del = confirm('Do you really want to delete this page?');
        if (del) {
            Page.delete({pageId: page._id }, function (result) {
                $scope.tree.deleteByPath(page.path, page._id);
                var parentId = $scope.tree.getParentId(page);
                $scope.changePage(parentId);
            });
        }

    };

    $scope.createContent = function () {
        var slot = $scope.currentSlot;

        var position = $scope.slots[slot].length; 
        var content = {
            _page: $scope.tree.current.pageId,
            _type: $scope.newContentType,
            meta: {
                slot: slot,
                position: position
            },
            content: {}
        };
        Content.create(content, function (result) {
            $scope.slots[ slot ].push(result);
            $scope.watchContent(slot, position);
        });
    };

    /* Set first content type as current */
    $scope.$watch('contentTypes.all', function (newVal, oldVal) {
        for (var type in newVal) {
            $scope.newContentType = type;
            break;
        }
    }, true);

    /** Change currentPageType if type is changed by user **/
    $scope.$watch('page._type', function (newVal) {
        if ($scope.pageTypes.all[newVal]) {
            $scope.currentPageType = $scope.pageTypes.all[newVal];
            // set default tab
            $scope.tab = 'slot:' + $scope.currentPageType.slots[0].name;
            $scope.currentSlot = 0;
            // add slots if unexistend
            while ($scope.currentPageType.slots.length > $scope.slots.length) {
                $scope.slots.push([]);
            }
        }
    });


}]);