import { decode as cborDecode } from 'cborg'
import { encode as jsonEncode } from 'cborg/json'
import { decode as dagcborDecode } from '@ipld/dag-cbor'
import { encode as dagjsonEncode } from '@ipld/dag-json'

const target = '<all_urls>'

const cborURLs = {}

const listener = (details) => {
  const filter = browser.webRequest.filterResponseData(details.requestId)

  const data = []
  filter.ondata = (event) => {
    if (!cborURLs[details.url]) {
      filter.write(event.data)
      filter.disconnect()
      return
    }
    data.push(new Uint8Array(event.data))
  }

  filter.onstop = () => {
    const { decode, encode } = cborURLs[details.url]
    if (!decode) {
      filter.disconnect()
      return
    }
    const flatten = new Uint8Array(data.flatMap(x => [...x.values()]))
    const jData = encode(decode(flatten))
    filter.write(jData)
    filter.disconnect()
  }

  return {}
}

const setJSONContentType = (e) => {
  const responseHeaders = []
  for (const i in e.responseHeaders) {
    let { name, value } = e.responseHeaders[i]
    if (name.toLowerCase() === 'content-type' && value.includes('application/cbor')) {
      cborURLs[e.url] = {
        decode: settings.decodeMethod('application/cbor'),
        encode: settings.encodeMethod('application/cbor'),
      }
      value = 'application/json'
    }
    if (name.toLowerCase() === 'content-type' && value.includes('application/vnd.ipld.dag-cbor')) {
      cborURLs[e.url] = {
        decode: settings.decodeMethod('application/vnd.ipld.dag-cbor'),
        encode: settings.encodeMethod('application/vnd.ipld.dag-cbor'),
      }
      value = 'application/json'
    }
    responseHeaders.push({ name, value })
  }
  return { responseHeaders }
}

const DECODE_METHOD = {
    'auto': (contentType) => {
      const methods = [DECODE_METHOD.cbor(contentType), DECODE_METHOD['dag-cbor'](contentType)]
      if (contentType.toLowerCase() === 'application/vnd.ipld.dag-cbor') {
          methods.reverse()
      }
      return (n) => {
        try {
          return  methods[0](n)
        } catch (_) {
          return methods[1](n)
        }
      }
    },
    'cbor': () => cborDecode,
    'dag-cbor': () => dagcborDecode,
}

const ENCODE_METHOD = {
    'auto': (contentType) => {
      const methods = [ENCODE_METHOD.json(contentType), ENCODE_METHOD['dag-json'](contentType)]
      return (n) => {
        try {
          return methods[1](n)
        } catch (_) {
          return methods[0](n)
        }
      }
    },
    'json': () => (n) => new TextEncoder().encode(JSON.stringify(n)),
    'dag-json': () => dagjsonEncode,
}

const settings = {
  decodeMethod: DECODE_METHOD.auto,
  encodeMethod: ENCODE_METHOD.auto,
}

const updateSettingListener = (e) => {
  const changedItems = Object.keys(e)
  for (const item of changedItems) {
    const value = e[item].newValue
    console.log(`update setting ${item} to ${value}`)
    switch (item) {
      case 'decode-method':
        settings.decodeMethod = DECODE_METHOD[value]
        break
      case 'encode-method':
        settings.encodeMethod = ENCODE_METHOD[value]
        break
    }
  }
}

const loadSettings = async () => {
  const getSetting = (s) => browser.storage.local.get(s).then(o => o[s])
  settings.decodeMethod = DECODE_METHOD[await getSetting('decode-method')]
  settings.encodeMethod = ENCODE_METHOD[await getSetting('encode-method')]
}

browser.webRequest.onBeforeRequest.addListener(
  listener, { urls: [target] }, ['blocking'],
)

browser.webRequest.onHeadersReceived.addListener(
  setJSONContentType, { urls: [target] }, ['blocking', 'responseHeaders'],
)

browser.storage.local.onChanged.addListener(updateSettingListener)

loadSettings()