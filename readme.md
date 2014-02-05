# BauhausJS

[![CI Status](https://travis-ci.org/bauhausjs/bauhausjs.png)](https://travis-ci.org/bauhausjs/bauhausjs).

BauhausJS is a modular CMS for NodeJS. BauhausJS is developed by [DigitalWerft](http://digitalwerft.com) and supported by [Bettervest](https://bettervest.de/). This is an open source project and pull requests are welcome.

**The development is in early stage.** We plan to provide a beta by spring 2014 and be production ready until summer 2014.

# Plugins

BauhausJS is based on node modules. These packages are spiced as plugins with dependency injection, provided by [Architect](https://github.com/c9/architect) from Cloud9. This allows each module to expose objects as services to other modules. Each module can define dependencies to other modules, which are injected to this module on load time.

Each module represents a self-containing application, which is added to a root server as middleware. Usually a module creates an express app, which is added to a root express app.

* **[server](https://github.com/bauhausjs/bauhausjs/tree/master/server)**: Provides an express server, which listens to port `1919` on default. All other middleware of other modules is added to this server. 
* **[security](https://github.com/bauhausjs/bauhausjs/tree/master/security)**: User, role and permission managment, middleware and helpers.
* **[event](https://github.com/bauhausjs/bauhausjs/tree/master/event)**: Provides shared EventEmitter service
* **[mongoose](https://github.com/bauhausjs/bauhausjs/tree/master/mongoose)**: Shared connection to MongoDB, use to access models of other modules.
* **[backend](https://github.com/bauhausjs/bauhausjs/tree/master/backend)**: Provides an administration backend for your app at route `/backend`.
* **[page](https://github.com/bauhausjs/bauhausjs/tree/master/page)**: Provides frontend (rendering) and backend (mangement) functionality for pages.
* **[content](https://github.com/bauhausjs/bauhausjs/tree/master/content)**: Provides functionality to manage and render content.
* **[document](https://github.com/bauhausjs/bauhausjs/tree/master/document)**: Generic CRUD for documents in backend.
* **[frontend](https://github.com/bauhausjs/bauhausjs/tree/master/frontend)**: Provides an express server, were all frontend middleware (e.g. render page) is added to. The frontend is mounted at root `/` by default.
