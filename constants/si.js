export const BASE = ''
export const KILO = 'k'
export const MEGA = 'M'
export const GIGA = 'G'
export const TERA = 'T'

export const THOUSAND = 'k'
export const MILLION = 'm'

export const EXPONENT = {}
EXPONENT[BASE] = 0
EXPONENT[KILO] = 3
EXPONENT[MEGA] = 6
EXPONENT[GIGA] = 9
EXPONENT[TERA] = 12

EXPONENT[THOUSAND] = 3
EXPONENT[MILLION] = 6

export function convertValue(fromPrefix, toPrefix, value) {
  const fromExponent = EXPONENT[fromPrefix]
  const toExponent = EXPONENT[toPrefix]
  return value || value === 0
    ? value * Math.pow(10, fromExponent - toExponent)
    : null
}
