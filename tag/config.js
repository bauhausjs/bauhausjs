module.exports = function (bauhausConfig) {
    bauhausConfig.addDocument('Tags', {
        name: 'Tag',
        model: 'Tag',
        collection: 'tags',
        useAsLabel: 'name',
        icon: 'tag',
        fields: [
            { name: 'name',
              type: 'text',
              label: 'Name' }
        ]
    });
};