import * as FT from '@/constants/fuel-tech.js'

export default function(data) {
  const fuelTechs = {}
  FT.DEFAULT_FUEL_TECH_ORDER.forEach(ft => {
    const find = data.find(d => d.fuel_tech === ft)
    if (find) {
      fuelTechs[ft] = find.id
    }
  })
  return fuelTechs
}
