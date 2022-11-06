# CBOR to JSON decoder extension

This is an addon for Firefox. It decodes [CBOR](https://cbor.io/) to JSON, making it render using the browser JSON engine.
Decoding options are the ones of [DAG-CBOR](https://ipld.io/docs/codecs/known/dag-cbor/) and encoding are [DAG-JSON](https://ipld.io/docs/codecs/known/dag-json/). This is slightly more restrictive than the CBOR spec, but allows for a smooth JSON view.

## Install

1. Download the latest [cbor_viewer](https://github.com/thibmeu/cbor-viewer/releases).
2. [`about:addons`](about:addons) and load the downloaded extension.

## Development

Tested with NodeJS v18

```bash
npm install # install modules
npm run build # generate background.js
npm run bundle # bundle the packed extension
```

You can then load the unpacked extension from [`about:debugging#/runtime/this-firefox`](about:debugging#/runtime/this-firefox).
