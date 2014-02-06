# Bauhaus page

This module allows to manage and render pages in a hierarchical structure. You can register page types, which define a template for rendering and multiple slots (e.g. "Content", "Sidebar") were the user can add content to.

## API

### page.addType(name, config)

* **name** `String`: Unique identifier for page type
* **config** `Object`: Configuration object for page type

Register a page type, which can be selected as layout by user in the backend.

```javascript
page.addType('content', {
    title: 'Content page tempate',
    model: 'Page',
    template: __dirname + '/templates/content.ejs',
    slots: [
        {name:'content', label: 'Content'},
        {name:'sidebar', label: 'Sidebar'}
    ]
});
```

## REST API

The JSON REST service is currently generated with baucis and provides the following methods:

```
GET    /backend/api/Pages        
POST   /backend/api/Pages
GET    /backend/api/Pages/:id
PUT    /backend/api/Pages/:id
DELETE /backend/api/Pages/:id
GET    /backend/api/getTree/:id   Render tree for given id
GET    /backend/api/PageTypes     Return object (name: config) of defined PageTypes
```

## Model: Page

Pages are identified via their `route`. If this route is requested at the frontend and the page is public the page is rendered according to the page type, which is defined in `_type`.

The model uses the mongoose plugin [mongoose-materialized](https://github.com/janez89/mongoose-materialized). This allows to structure pages hierarchically (checkout [plugin](https://github.com/janez89/mongoose-materialized) for details). You can use this e.g. to render navigations. 

```javascript
page = new mongoose.Schema({
    title: String,
    label: String,
    _type: String,
    route: String,
    public: Boolean
});
```