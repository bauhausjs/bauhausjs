angular.module('bauhaus.page.controllers', ['bauhaus.page.services']);

angular.module('bauhaus.page.controllers').controller('PageCtrl', ['$scope', '$routeParams', '$location', 'Page', 'SharedPageType', 'SharedContentType', 'Content', 'PageContent', 'SharedPageTree', 'Slug', function ($scope, $routeParams, $location, Page, SharedPageType, SharedContentType, Content, PageContent, SharedPageTree, Slug) {
    'use strict';

    /* reference to page tree in service */
    $scope.tree            = SharedPageTree.tree;   

    /* reference to object of pageTypes configurations in service */    
    $scope.pageTypes       = SharedPageType.store; 
    /* Contains the configuration of the current page type, is updated when page._type is updated */
    $scope.currentPageType = null;

    /* reference to object of contentType configuations in service */
    $scope.contentTypes    = SharedContentType.store;
    /* Contains name content type selected by user to add, uses first in list as default */
    $scope.newContentType  = null;


    /* current page object */
    $scope.page           = {};    
    /* bool which is updated by content watcher, if true page was updated by user */ 
    $scope.pageHasChanges = false;

    /* array of slots, which contain arrays of content objects */
    $scope.slots             = [];
    /* object that contains all content element, which were updated
       by user in shape hasContentChanges[ _id ] = [slotIndex, index] */
    $scope.contentChanges    = {};

    /* If activated route is automatically generated from title */
    $scope.generateRoute   = false;

    /* Set current page path variable tree service, automatically laods page via watcher */
    if ($routeParams.id) {
        $scope.tree.current.pageId = $routeParams.id;
    }


    /********************
     ** PAGE ************
     ********************/

    /* Helper: Sets current page to given id, used by UI to change current page */
    $scope.changePage = function (id) {
        $location.path('page/' + id);
    };

    /* Helper */
    $scope.contentHasChanges = function () {
        return (Object.keys($scope.contentChanges).length > 0) ? true : false;
    };

    /* Watcher: Load page from server if currentPageId is changed */
    $scope.$watch('tree.current.pageId', function (newVal, oldVal) {
        if (newVal) {
            /* Load new page */
            $scope.page = Page.get({ pageId: newVal }, function (result) {
                $scope.tree.expand(result);
                $scope.pageHasChanges = false;
                $scope.showPageLabel = ($scope.page.label && $scope.page.label.length != null && $scope.page.label.length > 0);
                /* Activate route generation for new pages */
                $scope.generateRoute = ($scope.page.title === '' && 
                                        !$scope.page.public && 
                                        $scope.page.route.length >= 1 &&
                                        $scope.page.route[ $scope.page.route.length - 1 ] === '/') ? true : false;
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

    /* Watcher: cache parent route if routeGeneration is activated */ 
    $scope.$watch('generateRoute', function (newVal) {
        if (newVal === true) {
            $scope.parentRoute = $scope.page.route;
            if ($scope.parentRoute.length >= 1 && $scope.parentRoute[ $scope.parentRoute.length - 1 ] !== '/') {
                /* Add slash to parent route if it doesn't end with one */
                $scope.parentRoute += '/';
            }
        }
    });

    /* Watcher: Slugify title to route if route generation is activated */
    $scope.$watch('page.title', function (newVal) {
        if ($scope.generateRoute) {
            $scope.page.route = $scope.parentRoute + Slug.slugify(newVal);
        }
    });

    /* Watcher: Deactivate route generation if user had changed route */
    $scope.$watch('page.route', function (newVal) {
        if ($scope.generateRoute) {
            if (newVal !== $scope.parentRoute + Slug.slugify($scope.page.title)) {
                $scope.generateRoute = false;
            }
        }
    });

    /* Watcher: Update page update flag, if user updated page */
    $scope.$watch('page', function (newVal, oldVal) {
        if (newVal && newVal._id && oldVal && oldVal._id) {
            $scope.pageHasChanges = true;
        }
    }, true);

    /* Watcher: Change currentPageType if type is changed by user */
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

    /* Set first content type as current */
    $scope.$watch('contentTypes.all', function (newVal, oldVal) {
        for (var type in newVal) {
            $scope.newContentType = type;
            break;
        }
    }, true);

    /** Sends currently viewed page and updated content to server and update tree, to avoid tree reload **/
    $scope.updatePage = function (page) {
        if ($scope.pageHasChanges) {
            Page.put(page, function (result) {
                if (result.path != null) {
                    // Choose corrosponding page in tree to update without reload
                    var pageInTree = $scope.tree.getByPath(result.path, result._id);
                    pageInTree.title = $scope.page.title;
                    pageInTree.route = $scope.page.route;
                    pageInTree.public = $scope.page.public;
                }
                // set route to valid
                $scope.pageEditor.route.$setValidity('routeExists', true);
                $scope.pageHasChanges = false;
            }, function (error) {
                if (error && error.status === 422 && error.data && error.data.route) {
                    $scope.invalidRoute = true;
                    // set route to invalid
                    $scope.pageEditor.route.$setValidity('routeExists', false);
                    console.log($scope.pageEditor);
                    alert('This route does already exist, please choose a different route');
                }
                console.log("error", error);
            });
        }

        $scope.updateContents();
    };

    /* UI: Deletes page at rest service */
    $scope.deletePage = function (page) {
        var pageInTree = $scope.tree.getByPath(page.path, page._id);

        if (pageInTree.children && Object.keys(pageInTree.children).length > 0) {
            alert('You cannot delete this page because it has sub page. Please delete this pages first.');
            return;
        }
        var del = confirm('Do you really want to delete this page?');

        var deletePage = function () {
            Page.delete({pageId: page._id }, function (result) {
                $scope.tree.deleteByPath(page.path, page._id);
                var parentId = $scope.tree.getParentId(page);
                $scope.changePage(parentId);
            }); 
        };

        if (del) {
            
            // Iterate over all content elements and delete them before deleting page
            var remainingContentElements = 0;

            /* Delete page directly, if it has no slots */
            if ($scope.slots.length === 0) deletePage(); 

            for (var s in $scope.slots) {
                var slot = $scope.slots[s];
                remainingContentElements += slot.length;
                for (var c in slot) {
                    var content = slot[c];
                    Content.delete({}, {'_id': content._id}, function (result) {
                        remainingContentElements--;
                        if (remainingContentElements === 0) {
                            // delete page if all content elements were deleted
                            deletePage();
                        }
                    });
                }

                if (remainingContentElements === 0 && $scope.slots.length - 1 == s) {
                    /* delete page if there are no content elements in last slot */
                    deletePage(); 
                }
            }
        }
    };


    /********************
     ** CONTENT *********
     ********************/

    /* Sends all updated content elements to server */
    $scope.updateContents = function () {
        // iterate over all content elements, which were updated
        var contentToUpdate = Object.keys($scope.contentChanges).length;

        var contentUpdated = 0;
        for (var id in $scope.contentChanges) {
            var position = $scope.contentChanges[ id ];
            var content = $scope.slots[position[0]][position[1]];

            Content.put(content, function (result) {
                // remove content from list of content blocks which should be updated
                contentUpdated++;
                // Count if all content elements to update have been updated, if finished clear list
                if (contentUpdated >= contentToUpdate) {
                    $scope.contentChanges = {};
                }
            });
        }
    };

    /* Register watcher for changes in single content element */
    $scope.watchContent = function (slot, position) {
        $scope.$watch(function () { return $scope.slots[slot][position] }, function (newVal, oldVal) {
            if (newVal && JSON.stringify(oldVal) !== JSON.stringify(newVal) ) {
                var coordinates = [slot, position];
                if ($scope.contentChanges[ newVal._id ] == null) {
                    // add content to list of changed content
                    $scope.contentChanges[ newVal._id ] = [slot, position];
                } else {
                    // update coordinates of content in list of changed content
                    $scope.contentChanges[ newVal._id ] = [slot, position];
                }
            }
        }, true); 
    };

    /* UI: Create content element of selected type at server and add to current slot */
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

    /* UI: Moves content element up in slot */
    $scope.moveContentUp = function (content) {
        var slot = content.meta.slot,
            oldIndex = content.meta.position,
            newIndex = oldIndex - 1;
        // change positions in content array
        $scope.moveContent(slot, oldIndex, newIndex);
    };

    /* UI: Moves content element down in slot */
    $scope.moveContentDown = function (content) {  
        var slot = content.meta.slot,
            oldIndex = content.meta.position,
            newIndex = oldIndex + 1;
        // change positions in content array
        $scope.moveContent(slot, oldIndex, newIndex);
    };

    /* UI: Delete content from server after confirm and update positions of other elements */
    $scope.deleteContent = function (content) {
        var ok = confirm('Do you really want to delete this content element?');
        if (ok) {
            var position = content.meta.position,
                slot = content.meta.slot;
            Content.delete({}, {'_id': content._id}, function (result) {
                $scope.removeContent(slot, position);
                var unregWatcher = $scope.$watch('slots[' + slot + ']', function (newVal) {
                    $scope.updateContents();
                    unregWatcher();
                });
                
            });
        }
    };

    /* Helper: Removes content element from scope and update positions of other elements */
    $scope.removeContent = function (slotId, position) {
        var slot = $scope.slots[slotId];
        slot.splice(position, 1);

        for (var c in slot) {
            var element = slot[c];
            if (element.meta.position !== c) {
                element.meta.position = c;
            }
        };
    };

    /* Helper: Changes position of of content element in scope */
    $scope.moveContent = function (slotId, oldIndex, newIndex) {
        var slot = $scope.slots[slotId];
        while (oldIndex < 0) {
            oldIndex += slot.length;
        }
        while (newIndex < 0) {
            newIndex += slot.length;
        }
        if (newIndex >= slot.length) {
            var k = new_Index - slot.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        // change position of moved element
        var content = $scope.slots[slotId][oldIndex];
        content.meta.position = newIndex;
        // change position of element which is moved by other element moving up or down
        var content2 = $scope.slots[slotId][newIndex];
        content2.meta.position = oldIndex;
        slot.splice(newIndex, 0, slot.splice(oldIndex, 1)[0]);
    };
}]);