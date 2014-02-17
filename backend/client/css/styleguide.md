# Bauhaus JS Backend styleguide


## Conventions

Bauhaus main elements always start with prefix `bauhaus-` to avoid naming conficts with external stylesheets. Main elements are style description, which can be reused anywhere and can contain sub elements.

## Layout

The basic layout classes are

```
.bauhaus-body
.bauhaus-navigation
.bauhaus-top-navigation
.bauhaus-content
```

## Views

Views reside within the `.bauhaus-content` element, and usually contain of editors or lists.

The base classes for that are the following two:

```
.bauhaus-editor-view
.bauhaus-list-view
```

If these views are need to be extended for certain models, add model name to class name, e.g. `bauhaus-page-editor`.
