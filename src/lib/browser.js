const browserSize = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight,
};

function isMobileWidth() {
  // Large smart phone in portrait mode
  return browserSize.width < 420;
}

function isIE11andBelow() {
  // Check the userAgent property of the window.navigator object
  const ua = window.navigator.userAgent;

  // IE 10 or older
  const msie = ua.indexOf('MSIE ');

  // IE 11
  const trident = ua.indexOf('Trident/');

  return (msie > 0 || trident > 0);
}


export {
  browserSize,
  isMobileWidth,
  isIE11andBelow,
};
