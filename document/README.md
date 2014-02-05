# Bauhaus Document

At this plugin you can register your custom data models (e.g. News, Project or whatever you need) at the backend to make them manageable in the backend.

To allow the backend to manage your documents, you need to provide a REST API, which is registered at the `api` plugin.

## API

### document.addType(name, config)

* **name** `String`: Unique document name, e.g. 'post'
* **config** `Object`: Document configuration

```javascript
document.addType('post', {
    name: 'Post',
    collection: 'posts',
    fields: [
        { name: 'title', 
          type: 'text',
          label: 'Title' }, 
        { name: 'body', 
          type: 'text',
          label: 'Body' }
    ]
};
```