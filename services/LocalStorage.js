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
  if (v === 'true' || v === 'false') {
    return v === 'true'
  }

  return v
}

export { lsSet, lsGet }
