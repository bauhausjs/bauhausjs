# Bauhaus Content

This module provides a data model, REST services and middleware for content rendering. A content element is placed on a page, e.g. an article or news message. 

## Content Types 

You can add content types, which store their data directly in the content entity or reference to a a custom document, which is kept in its own collection. You also need to pass a template to render the content with. Since rendering is performed by express you can use any template engine, which is supported by express and is automatically determinded by the file ending.

Custom content types store their data `content` object of the orginal schema, e.g. an article with the fields `content.title` and `content.text`. The Angular client will generate a form for you based on your `fields` configuration. `name` describes the field name under `content`, `label` is viewed as input label in the UI and `type` determines the name of the Angular directive used to render that field.

### Example

```javascript
// within yourCustomModule/app.js
// import content service and add a custom content type Article
var content = imports.content;
content.types.Article = 
{
    title: 'Article',
    model: 'Content',
    template: __dirname + '/templates/article.ejs',
    fields: [
        { name: "title", label: 'Title', type: 'text' },
        { name: "text", label: 'Text', type: 'html' }
    ]
};
```

```html
<!-- yourCustomModule/templates/article.ejs -->
<h1><%= headline %></h1>
<p><%= body %></p>
```

## API

### content.addType(name, config)

* **name** `String`: Unique identifier for content type
* **config** `Object`: Content type configuration object

```javascript
content.addType('article',{
        title: 'Article',
        model: 'Content',
        template: __dirname + '/templates/article.ejs',
        fields: [
            { name: 'headline', label: 'Headline', type: 'text' },
            { name: 'body', label: 'Body', type: 'html' }
        ]
    });
```

## REST API

The JSON REST service is currently generated with baucis and provides the following methods:

```
GET    /backend/api/Content        
POST   /backend/api/Content
GET    /backend/api/Content/:id
PUT    /backend/api/Content/:id
DELETE /backend/api/Content/:id
```

## Model: Content

Every content entity belongs to a page. The field `content` can contain any fields. For the `article` example above the fields `content.headline` and `content.body` will be created.

```javascript
new mongoose.Schema({
  _page : { type: mongoose.Schema.ObjectId, ref: 'Page' },
  _type: String,
  content: {},
  meta: {
    position: Number,
    slot: Number
  }
}
```