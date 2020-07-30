import * as FT from '@/constants/fuel-tech.js'

export function getPowerEnergyDomains(ids, type) {
  return ids ? FT.getFuelTechObjs(ids, type).reverse() : []
}

export function getTemperatureDomains(ids) {
  return ids.map(t => {
    return {
      id: t,
      domain: t,
      type: 'temperature',
      colour: 'red'
    }
  })
}
