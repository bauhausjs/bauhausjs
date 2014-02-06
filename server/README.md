# Bauhaus server

This plugin provides a central server, were all other apps (`backend`, `frontend` and `api`) are added to. The server waits until all plugins were registered before listening to the configured port.

## Options

* **port** `Number`: Port to listen to, default: `1919`
* **welcome** `Boolean`: Show Bauhaus welcome on command line, default: `true`

## API

### server.app

Type: `Object`, Express app

Add your own routes and middleware to this express app by using `server.app.use(route, yourMiddleware)`.