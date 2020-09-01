export const KILO = 'k'
export const MEGA = 'M'
export const GIGA = 'G'
export const TERA = 'T'

export const FACTOR = {}
FACTOR[KILO] = 3
FACTOR[MEGA] = 6
FACTOR[GIGA] = 9
FACTOR[TERA] = 12

export function convertValue(fromPrefix, toPrefix, value) {
  const fromFactor = FACTOR[fromPrefix]
  const toFactor = FACTOR[toPrefix]

  return value * Math.pow(10, fromFactor - toFactor)
}
