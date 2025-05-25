import * as FT from '@/constants/capacity-fuel-techs/group-detailed.js'

export function getFuelTechInOrder(data) {
  const fuelTechs = {}
  FT.DEFAULT_FUEL_TECH_ORDER.forEach((ft) => {
    const find = data.find((d) => d.fuel_tech === ft)
    if (find) {
      fuelTechs[ft] = find.id
    }
  })
  return fuelTechs
}

export function getFuelTechDomains(ids, type) {
  return ids ? FT.getFuelTechObjs(ids, type).reverse() : []
}

export function getFuelTechWithTypeDomains(ids, type) {
  const mutateIds = {}
  Object.keys(ids).forEach((key) => {
    const split = ids[key].split('.')
    split.pop()
    const newId = `${split.join('.')}.${type}`
    mutateIds[key] = newId
  })
  return FT.getFuelTechObjs(mutateIds, type).reverse()
}

