import _uniq from 'lodash.uniq'
import _isEmpty from 'lodash.isempty'
import * as FUEL_TECHS from '~/constants/fuel-tech.js'

function transformFacilityData(data) {
  const stationIds = Object.keys(data)
  const stations = stationIds.map(d => data[d])

  return stations.map(d => {
    const stationId = d.station_id || ''
    let regionId = d.region_id.toLowerCase() || ''
    const location = d.location || null
    const units = []
    const duidKeys = Object.keys(d.duid_data)
    const unitNum = duidKeys.length
    const fuelTechs = []
    const genFuelTechs = []
    const loadFuelTechs = []
    const fuelTechRegisteredCap = {}
    const displayName = d.display_name.split('/').join(' / ')
    let generatorCap = 0
    if (regionId === 'wa1') {
      regionId = 'wem'
    }

    duidKeys.forEach(unitName => {
      const unit = d.duid_data[unitName]
      const regCap = unit.registered_capacity
      const fuelTech = unit.fuel_tech
      const type = FUEL_TECHS.FUEL_TECH_CATEGORY[fuelTech] || ''

      const unitObj = {
        name: unitName,
        fuelTech,
        regCap,
        type
      }

      if (type === 'source') {
        generatorCap += regCap || 0
      }

      if (fuelTech) {
        if (!fuelTechRegisteredCap[fuelTech]) {
          fuelTechRegisteredCap[fuelTech] = 0
        }
        fuelTechRegisteredCap[fuelTech] += regCap
      }

      if (fuelTech !== 'battery_charging' && !_isEmpty(unit)) {
        fuelTechs.push(fuelTech)
        if (type === 'source') {
          genFuelTechs.push(fuelTech)
        } else if (type === 'load') {
          loadFuelTechs.push(fuelTech)
        }
      }

      if (!_isEmpty(unit)) {
        units.push(unitObj)
      }
    })

    return {
      stationId,
      displayName,
      status: d.status.state,
      statusDate: d.status.date,
      regionId,
      location,
      units,
      generatorCap,
      unitNum,
      fuelTechs: _uniq(fuelTechs).sort(),
      genFuelTechs: _uniq(genFuelTechs).sort(),
      loadFuelTechs: _uniq(loadFuelTechs).sort(),
      fuelTechRegisteredCap
    }
  })
}

function transformV3FacilityData(data) {
  const emptyProperties = []
  const emptyGeometries = []

  const transformed = data.map(d => {
    const props = d.properties
    const geo = d.geometry

    if (!geo) {
      emptyGeometries.push(d)
    }
    if (!props) {
      emptyProperties.push(d)
    }
    const stationId = `station${props.id}`
    const status = props.status_id
    const displayName = props.name || '-'
    const regionId = props.region ? props.region.toLowerCase() : 'wem'
    const generatorCap = props.nameplate_capacity || 0
    const fuelTechs = [props.fueltech_id]
    const genFuelTechs = [props.fueltech_id]
    const fuelTechRegisteredCap = {}
    const loadFuelTechs = []
    const location = geo
      ? {
          latitude: geo.coordinates[1],
          longitude: geo.coordinates[0]
        }
      : {
          latitude: null,
          longitude: null
        }

    fuelTechRegisteredCap[props.fueltech_id] = generatorCap
    return {
      stationId,
      status,
      displayName,
      regionId,
      generatorCap,
      location,
      fuelTechs,
      genFuelTechs,
      loadFuelTechs,
      fuelTechRegisteredCap
    }
  })
  console.log('List of facilities without location:', emptyGeometries)

  return transformed
}

export default {
  flatten(data) {
    const promise = new Promise(resolve => {
      let flatData = transformFacilityData(data)
      resolve(flatData)
    })

    return promise
  },

  flattenV3(data) {
    const promise = new Promise(resolve => {
      let flatData = transformV3FacilityData(data)
      resolve(flatData)
    })

    return promise
  }
}
