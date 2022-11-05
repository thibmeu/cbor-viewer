import { decode as cborDecode } from '@ipld/dag-cbor'
import { encode as jsonEncode } from '@ipld/dag-json'

const target = '<all_urls>'

const listener = (details) => {
  let filter = browser.webRequest.filterResponseData(details.requestId)

  console.log('event', details.requestId)
  const data = []
  filter.ondata = (event) => {
    console.log('ondata')
    data.push(new Uint8Array(event.data))
  }

  filter.onstop = (event) => {
    console.log('stop')
    const flatten = new Uint8Array(data.flatMap(x => [...x.values()]))
    const jData = jsonEncode(cborDecode(flatten))
    filter.write(jData)
    filter.disconnect()
  }

  return {}
}

const setJSONContentType = (e) => {
  for (const i in e.responseHeaders) {
    if (e.responseHeaders[i].name.toLowerCase().includes('content-type')) {
      e.responseHeaders[i].value = 'application/json'
    }
  }
  return { responseHeaders: e.responseHeaders }
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: [ target ],
    types: [ 'main_frame', 'script', 'sub_frame', 'xmlhttprequest', 'other' ]
  },
  ['blocking']
)

browser.webRequest.onHeadersReceived.addListener(
  setJSONContentType,
  { urls: [target] },
  ['blocking', 'responseHeaders'],
)

