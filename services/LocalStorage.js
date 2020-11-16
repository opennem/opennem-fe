function lsSet(name, value) {
  try {
    if (!window.localStorage) {
      return undefined
    }
  } catch (e) {
    return undefined
  }

  window.localStorage.setItem(name, value)
  return true
}

function lsGet(name) {
  try {
    if (!window.localStorage) {
      return undefined
    }
  } catch (e) {
    return undefined
  }

  const v = window.localStorage.getItem(name)
  if (v === 'true') {
    return true
  }

  if (v === 'null' || v === 'false') {
    return false
  }

  return v
}

export { lsSet, lsGet }
