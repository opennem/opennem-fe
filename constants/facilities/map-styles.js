export const MAP_STYLE_DEFAULT = 'default'
export const MAP_STYLE_LIGHT = 'light'
export const MAP_STYLE_SATELLITE = 'satellite'

export const MAP_STYLE_URLS = {}
MAP_STYLE_URLS[MAP_STYLE_LIGHT] =
  'mapbox://styles/steventan/ckoji70651l9j18p5uefuskvt'
MAP_STYLE_URLS[MAP_STYLE_SATELLITE] =
  'mapbox://styles/steventan/ckomkdzo11qcw17qljpcd1wki'

export const mapStyleSelections = [
  {
    label: 'Light',
    value: MAP_STYLE_LIGHT,
    preview: 'default'
  },
  {
    label: 'Satellite',
    value: MAP_STYLE_SATELLITE,
    preview: 'satellite'
  }
]
