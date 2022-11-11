const updateSettingListener = async (e) => {
  const name = e.target.id
  const value = e.target.value
  await browser.storage.local.set(Object.fromEntries([[name, value]]))
  console.log('set', name, value)
}

const restoreSetting = async (el) => {
  const name = el.id
  const options = [...el.options].map(o => o.value)
  const savedOption =  await browser.storage.local.get(name)
  const savedIndex = options.findIndex(o => o === savedOption[name])
  el.selectedIndex = savedIndex !== -1 ? savedIndex : 0
}

const load = () => {
  const elements = [document.querySelector('#decode-method'), document.querySelector('#encode-method')]
  elements.map(el => el.addEventListener('change', updateSettingListener))
  elements.map(el => restoreSetting(el))
}

window.addEventListener('load', load)