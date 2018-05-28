const browserSize = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight,
};

function isMobileWidth() {
  // Large smart phone in portrait mode
  return browserSize.width < 420;
}

export {
  browserSize,
  isMobileWidth,
};
