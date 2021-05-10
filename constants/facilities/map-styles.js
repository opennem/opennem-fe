export const MAP_STYLE_LIGHT = 'light-v10'
export const MAP_STYLE_SATELLITE = 'satellite-v9'

const getMapUrl = name => `mapbox://styles/mapbox/${name}?optimize=true`
export const MAP_STYLE_URLS = {}
MAP_STYLE_URLS[MAP_STYLE_LIGHT] = getMapUrl(MAP_STYLE_LIGHT)
MAP_STYLE_URLS[MAP_STYLE_SATELLITE] = getMapUrl(MAP_STYLE_SATELLITE)

export const mapStyleSelections = [
  {
    label: 'Light',
    value: MAP_STYLE_LIGHT
  },
  {
    label: 'Satellite',
    value: MAP_STYLE_SATELLITE
  }
]
