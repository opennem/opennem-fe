function console() {
  if (typeof window !== 'undefined' && window.console) {
    return window.console
  }
}

export default console
