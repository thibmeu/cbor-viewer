# CBOR to JSON decoder extension

This extension decodes DAG-CBOR to DAG-JSON, making it render using the browser JSON engine.

At the moment, this has only be tested for Firefox.

## Install

Clone the repository.
[about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and load the unpacked extension by clicking on manifest.json.

## Development

Tested with NodeJS v18

```bash
npm install # install modules
npm run build # generate background.js
```
