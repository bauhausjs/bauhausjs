# BauhausJS

![CI Status](https://travis-ci.org/bauhausjs/bauhausjs.png)

BauhausJS is a modular CMS for NodeJS. BauhausJS is supported by [DigitalWerft](http://digitalwerft.com). This is an open source project and pull requests are welcome.

**The development is in very early stage and there's not much to see yet.** We plan to provide a beta by spring 2014 and be production ready until summer 2014.


## Modules

BauhausJS is based on node packages. These packages are spiced with dependency injection, provided by [Architect](https://github.com/c9/architect) from Cloud9. This allows each module to expose objects as services to other modules. Each module can define dependencies to other modules, which are injected to this module on load time.

Each module represents a self-containing application, which is added to a root server as middleware. Usually a module creates an express app, which is added to a root express app.

### Server

* **server**: Provides an express server, which listens to port `1919` on default. All other middleware of other modules is added to this server. This pattern of multiple express servers is used to allow to define custom middleware for each route. 
* **frontend**: Provides an express server, were all frontend middleware (e.g. render page) is added to. The frontend is mounted at root `/` by default.
* **page**: Provides frontend (rendering) and backend (mangement) functionality for pages.
* **content**: Provides functionality for content 
* **backend**: Provides an express server were all backend middleware (e.g. manage page) is added to. The backend is mouted at server route `/backend` by default.
* **event**: EventEmitter service, which can be shared by all modules
* **mongoose**: Creates conntection to MongoDB, which can be used by all Mongoose Models without requirement depend on this module.




