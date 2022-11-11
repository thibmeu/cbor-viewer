import { decode as cborDecode } from 'cborg'
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

  filter.onstop = (event) => {
    const decode = cborURLs[details.url]
    if (!decode) {
      filter.disconnect()
      return
    }
    const flatten = new Uint8Array(data.flatMap(x => [...x.values()]))
    const jData = dagjsonEncode(decode(flatten))
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
      cborURLs[e.url] = dagcborDecode
      value = 'application/json'
    }
    if (name.toLowerCase() === 'content-type' && value.includes('application/vnd.ipld.dag-cbor')) {
      cborURLs[e.url] = dagcborDecode
      value = 'application/json'
    }
    responseHeaders.push({ name, value })
  }
  return { responseHeaders }
}

browser.webRequest.onBeforeRequest.addListener(
  listener, { urls: [target] }, ['blocking'],
)

browser.webRequest.onHeadersReceived.addListener(
  setJSONContentType, { urls: [target] }, ['blocking', 'responseHeaders'],
)