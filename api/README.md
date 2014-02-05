# Bauhaus Api

This plugin provides an express app, were all middleware and routes for the REST API are added to. Because the `backend` plugin requires REST services to edit data, all plugins which have manageable data need to add middleware to this app.

The api is accessible at route `/backend/api`. 

## REST API Conventions

We use **baucis** to create REST services based on mongoose documents. If you are creating the REST API of an module with baucis the service already matches this conventions. 

`NAME`: Use the capitalized plural of your model, e.g. `Pages`
`ID`: `_id` of mongo document

* `GET NAME/`: Array of all models
* `POST NAME/`: Create new document, returns document with id
* `GET NAME/ID`: Receive a single model with mongo given id
* `PUT NAME/ID`: Update a model with mongo given id
* `DELETE NAME/ID`: Delete a model with mongo given id

Add your express app to the api via `imports.api.app.use(yourApp)`