# CBOR to JSON decoder extension

This is an addon for Firefox. It decodes DAG-CBOR to DAG-JSON, making it render using the browser JSON engine.

## Install

1. Download the latest [cbor_decoder](https://github.com/thibmeu/dagcbor-decoder-extension/releases)
2. [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and load downloaded extension.

## Development

Tested with NodeJS v18

```bash
npm install # install modules
npm run build # generate background.js
npm run bundle # bundle the packed extension
```
