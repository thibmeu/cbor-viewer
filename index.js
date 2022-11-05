import { decode as cborDecode } from '@ipld/dag-cbor'
import { encode as jsonEncode } from '@ipld/dag-json'

const target = '<all_urls>'

const cborURLs = {}

const listener = (details) => {
  let filter = browser.webRequest.filterResponseData(details.requestId)

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
    if (!cborURLs[details.url]) {
      filter.disconnect()
      return
    }
    const flatten = new Uint8Array(data.flatMap(x => [...x.values()]))
    const jData = jsonEncode(cborDecode(flatten))
    filter.write(jData)
    filter.disconnect()
  }

  return {}
}

const setJSONContentType = (e) => {
  for (const i in e.responseHeaders) {
    if (e.responseHeaders[i].name.toLowerCase().includes('content-type') && e.responseHeaders[i].value.toLowerCase().includes('application/cbor')) {
      e.responseHeaders[i].value = 'application/json'
      cborURLs[e.url] = true
    }
  }
  return { responseHeaders: e.responseHeaders }
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  { urls: [target] },
  ['blocking'],
)

browser.webRequest.onHeadersReceived.addListener(
  setJSONContentType,
  { urls: [target] },
  ['blocking', 'responseHeaders'],
)

