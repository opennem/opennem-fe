export const MAP_STYLE_DEFAULT = 'default'
export const MAP_STYLE_LIGHT = 'light-v10'
export const MAP_STYLE_SATELLITE = 'satellite-v9'

// mapbox://styles/steventan/ckoji70651l9j18p5uefuskvt
// mapbox://styles/steventan/ckojdsmsh0p7d18mdebjrdsvx

// mapbox://styles/steventan/cjqq0t7w7tuaw2rqesn99vmfp

const getMapUrl = name => `mapbox://styles/mapbox/${name}?optimize=true`
export const MAP_STYLE_URLS = {}
MAP_STYLE_URLS[MAP_STYLE_DEFAULT] =
  'mapbox://styles/steventan/ckoji70651l9j18p5uefuskvt'
MAP_STYLE_URLS[MAP_STYLE_LIGHT] = MAP_STYLE_URLS[MAP_STYLE_DEFAULT]
MAP_STYLE_URLS[MAP_STYLE_SATELLITE] = getMapUrl(MAP_STYLE_SATELLITE)

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
