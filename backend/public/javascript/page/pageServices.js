angular.module('bauhaus.page.services', []);

angular.module('bauhaus.page.services').factory('Page', function ($resource) {
    return $resource('api/Pages/:pageId', {}, {
        get: {
            method: 'GET',
            params: { pageId: 'pageId' },
            isArray: false
        },
        put: {
            method: 'PUT',
            params: { pageId: '@_id' }
        },
        create: {
            method: 'POST',
            params: { pageId: '' }
        }
    });
});

angular.module('bauhaus.page.services').factory('PageTree', function ($resource) {
    return $resource('api/Pages/getTree', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

/** This Service stores the status of the page tree, which can be shared between views **/
angular.module('bauhaus.page.services').factory('SharedPageTree', function (PageTree, $rootScope) {
    var scope = $rootScope.$new();
    scope.tree = {
        current: {
            rootPageId: null,
            pageId: null
        },
        expanded: {},
        /** Check if given page has children **/
        hasChildren: function (page) {
            return (page && page.children && Object.keys(page.children).length > 0) ? true : false;
        },
        /** Check if given page is root node **/
        isRoot: function (page) {
            return scope.tree.current.rootPageId === page._id ? true : false;
        },


        /** Expand given root by expanding all parent nodes **/
        expand: function (page) {
            scope.tree.expanded[page._id] = true;
            page = scope.tree.getByPath(page.path, page._id);
            if (page) {
                page.open = true;
                scope.tree.forEachParentByPath(page.path, page._id, function (parent) {
                    scope.tree.expanded[parent._id] = true;
                    if (!parent.open) parent.open = true;
                });
            }
        },
        toggle: function (page) {
            var newStatus = (scope.tree.expanded[page._id] && scope.tree.expanded[page._id] === true) ? false : true;
            scope.tree.expanded[page._id] = newStatus;
            page.open = newStatus;
        },
        isExpanded: function (page) {
            // always expand root
            if (page.parentId === null) return true;
            return (scope.tree.expanded[page._id] && scope.tree.expanded[page._id] === true) ? true : false;
        },


        /** Parse path of ids and commas to array of ids **/
        pathToIdArray: function (path) {
            if (path === '') return [];
            var hierachy = path.split(',');
            // remove first key, which is always empty
            hierachy.shift();
            return hierachy;
        },
        /** Convert path to array of page objects **/ 
        pathToPageArray: function (path) {
            var hierachy = scope.tree.pathToIdArray(path);

            var pages = [];
            var subtree = scope.tree.all;

            for (var h in hierachy) {
                var id = hierachy[ h ];
                if (scope.tree.hasChildren(subtree) && subtree.children[ id ]) {
                    subtree = subtree.children[ id ];
                    pages.push(subtree);
                } else if (subtree && subtree[ id ]) {
                    // extract root node, which is no child, directly
                    subtree = subtree[ id ]
                    pages.push(subtree);
                }
            } 
            return pages;
        },
        /** Get a page object by parent id **/
        getParentId: function (page) {
            var parents = scope.tree.pathToIdArray(page.path);
            return parents[ parents.length - 1 ];
        },
        /** Get an page by passing path and id **/
        getByPath: function (path, id) {
            var hierachy = scope.tree.pathToPageArray(path);
            var parent = hierachy[ hierachy.length - 1 ];
            
            if (parent && parent.children && parent.children[ id ]) {
                return parent.children[ id ];
            } else if (path === '' && id === scope.tree.current.rootPageId) {
                return scope.tree.all[ id ];
            } 
            return null;
        },
        /** Deleting a page from tree by passing path and id **/
        deleteByPath: function (path, id) {
            var hierachy = scope.tree.pathToPageArray(path);
            // get parent (last element in hierachy)
            var parent = hierachy[ hierachy.length - 1 ];
            if (parent.children && parent.children[ id ]) {
                delete parent.children[ id ];
            }
        },
        /** Execute callback on all parents **/
        forEachParentByPath: function (path, id, callback) {
            var parents = scope.tree.pathToPageArray(path);
            for (var p in parents) {
                callback(parents[p]);
            }
        }
    };

    

    PageTree.get(function (result) {
        scope.tree.all = result.tree;

        for (var rootKey in result.tree) {
            // set root key
            scope.tree.current.rootPageId = rootKey;
            
            // set current pageId if not set 
            if (!scope.tree.current.pageId) {
                scope.tree.current.pageId = rootKey;
            }
        }
        
    });
    return scope;
});


angular.module('bauhaus.page.services').factory('PageType', function ($resource) {
    return $resource('api/PageTypes', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.page.services').factory('SharedPageType', function (PageType, $rootScope) {
    var scope = $rootScope.$new();
    scope.store =  {
        all: {},
    };

    PageType.get(function (result) {
        for (var key in result) {
            if (result[key].title) {
                scope.store.all[key] = result[key];
            }
        }
    });

    return scope;
});

angular.module('bauhaus.page.services').factory('ContentType', function ($resource) {
    return $resource('api/ContentTypes', {}, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

angular.module('bauhaus.page.services').factory('SharedContentType', function (ContentType, $rootScope) {
    var scope = $rootScope.$new();
    scope.store =  {
        all: {},
    };

    ContentType.get(function (result) {
        for (var key in result) {
            if (result[key].title) {
                scope.store.all[key] = result[key];
            }
        }
    });

    return scope;
});

angular.module('bauhaus.page.services').factory('Content', function ($resource) {
    return $resource('api/Contents/:contentId', {}, {
        get: {
            method: 'GET',
            params: { contentId: '@_id' }
        },
        put: {
            method: 'PUT',
            params: { contentId: '@_id' }
        },
        create: {
            method: 'POST',
            params: { contentId: '' }
        },
        delete: {
            method: 'DELETE',
            params: { contentId: '@_id'}
        }
    });
});

angular.module('bauhaus.page.services').factory('PageContent', function ($resource) {
    return $resource('api/Contents?conditions={"_page":":pageId"}', {}, {
        get: {
            method: 'GET',
            params: { pageId: '@pageId' },
            isArray: true
        }
    });
});
