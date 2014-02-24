# Bauhaus Directives

BauhausJS Backend is a AngularJS app, which is build upon directives. Directives are UI components, similar to web components, which provide a specific functionality, e.g. to render a form based on a schema and a model. The are used by custom HTML tags and attributes, e.g. `<bauhaus-form-document config="fields" ng-model="document">` and wrap.

You can use this directives in your own module when extending the BauhausJS backend client. The most common usecase is to write a own form field widget, e.g. a map widget were the user can place a marker. 

# Form directives

In BauhausJS terminology a `form` consists of multiple files, which are rendered as `widgets` (field label and control, e.g. text input). An `editor` describes a complete view, which usually consists of at least one form as well as form controls, e.g. "Save", "Delete" or "Document history".

```html
<!-- Generic form, which renders field config -->
<bauhaus-form ng-model="" config="">
<!-- Document editor, form controls (save, histroy, .. ) -->       
<bauhaus-editor-document> 
<!-- Page editor, form controls --> 
<bauhaus-editor-page>
<!-- Page tree editor -->     
<bauhaus-editor-page-tree>

<!--
Attributes:
 - ng-model: Field in model, which is manipulated by widget
 - config:   Form / editor configuration
-->
```

# Form widget directives 

```html
<bauhaus-widget-text>
<bauhaus-widget-password>
<bauhaus-widget-select>
<bauhaus-widget-textarea>
<bauhaus-widget-html>

<bauhaus-widget-ref>
<bauhaus-widget-refs>

<bauhaus-widget-ref-roles>
<bauhaus-widget-ref-tags>

Attributes:
 - ng-model: Field in model, which is manipulated by widget
 - config:   Widget configuration
```

# Other directives

```html
<bauhaus-navigation>
```