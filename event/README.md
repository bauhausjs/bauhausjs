# Bauhaus event

The event module provides an NodeJS `EventEmitter`, which can be used to allow event based communication between plugins.

## Events

### modules.loaded

Data: `null`

Emitted when all architect modules are loaded successfully.

## API

### event.emitter

Type: `EventEmitter`

Use `emitter.emit('NAME', data)` to trigger and `emitter.on('NAME', function (e) {})` to listen to event.