
module.exports = function (bauhausConfig) {
    bauhausConfig.addDocument('Pages', {
        //name: 'Page',
        model: 'Page',
        collection: 'pages',
        /*icon: 'leaf',
        url: '/pages2',*/
        fieldsets: [
            { id: 'main', legend: 'Main' }
        ],
        fields: [
// ============== START GENERAL ================
            // TITLE
            {
                name: 'fields.wysiwyg',
                type: 'file',
                label: 'wysiwyg files',
                fieldset: 'main',
                configPath: 'documents.Pages',
                options: {
                    singlefile: false,
                    typeRegEx: 'image\/[.]*' //image\/[.]*
                }
            }
        ]
    });
}
