module.exports = function (bauhausConfig) {
    // Register document for CRUD generation
    bauhausConfig.addDocument('Assets', {
        name: 'Asset',
        model: 'Asset',
        collection: 'assets',
        icon: 'picture-o',
        query: {
            conditions: {parentId: null}
        },
        templates: {
            listItem: '<a href="#/document/{{ type }}/{{document._id}}"><img ng-src="/assets/{{document._id}}?transform=resize&width=80&height=80"/> {{ document.name }}</a>'
        },
        fields: [
            { name: 'name',
              type: 'text',
              label: 'Name'},
            { name: 'data',
              type: 'asset-data',
              label: 'File'},
            { name: 'metadata',
              type: 'asset-meta-data',
              label: 'MetaData'}
        ]
    });
};