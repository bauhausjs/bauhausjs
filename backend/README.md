# Bauhaus Backend

This module provides an backend client for BauhausJS, which can be accessed at the server at path `/backend`.

## Backend Client architecture

The backend client is a single page app driven by **AngularJS**, which requests data from REST services. 

All client dependencies need currently to be added to `templates/index.ejs`, the frondend logic is located at `client/`. The app constists of several modules, which keep bundle their own controllers, services, directives and templates.

## Client Build

Frontend dependencies are currently installed by **Bower** to `backend/client/components`. 

The build is performed by **Gulp** and is defined in `build.js`. The build cannot be triggered on the command line by using a `gulpfile.js`, but is is started by `app.js` on runtime. This allows other modules to dynamically register JavaScript, CSS, HTML and other assets at the backend module which are included in the backend build.

When the app is run in `development` env (default) a live reload server is started, which recompiles backend assets, if you are developing modules for the backend. Use the Chrome Live Reload Plugin until  the livereload URL is dynamically incjected into the `index.ejs.
