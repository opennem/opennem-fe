function lsSet(name, value) {
  try {
    if (!window.localStorage) {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }

  window.localStorage.setItem(name, value);
  return true;
}

function lsGet(name) {
  try {
    if (!window.localStorage) {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }

  const v = window.localStorage.getItem(name);
  return v === 'true';
}

export {
  lsSet,
  lsGet,
};
