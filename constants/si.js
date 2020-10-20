export const KILO = 'k'
export const MEGA = 'M'
export const GIGA = 'G'
export const TERA = 'T'

export const EXPONENT = {}
EXPONENT[KILO] = 3
EXPONENT[MEGA] = 6
EXPONENT[GIGA] = 9
EXPONENT[TERA] = 12

export function convertValue(fromPrefix, toPrefix, value) {
  const fromExponent = EXPONENT[fromPrefix]
  const toExponent = EXPONENT[toPrefix]
  return value ? value * Math.pow(10, fromExponent - toExponent) : null
}
