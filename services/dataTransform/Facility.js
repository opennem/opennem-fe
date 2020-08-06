import _uniq from 'lodash.uniq'
import _isEmpty from 'lodash.isempty'
import * as FUEL_TECHS from '~/constants/fuel-tech.js'

let emptyIdCount = 0

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
  const operatingCount = []
  const committedCount = []
  const commissioningCount = []
  const retiredCount = []
  const noStatusCount = []

  const transformed = data.map(d => {
    const props = d.properties
    const geo = d.geometry
    let hasLocation = true

    if (!geo || geo.coordinates.length !== 2) {
      emptyGeometries.push(d)
      hasLocation = false
    }
    if (!props) {
      emptyProperties.push(d)
    }
    let stationId = props.station_id
    if (!stationId) {
      emptyIdCount++
      stationId = `emptyStationId-${emptyIdCount}`
    }
    const displayName = props.name || '-'
    const state = props.state || ''
    const units = []
    const dispatchUnits = props.duid_data || []
    const location = geo
      ? {
          latitude: geo.coordinates[1],
          longitude: geo.coordinates[0]
        }
      : {
          latitude: null,
          longitude: null
        }
    const fuelTechs = []
    const genFuelTechs = []
    const loadFuelTechs = []
    const unitStatuses = []
    const fuelTechRegisteredCap = {}
    const unitStatusRegisteredCap = {}
    const status = dispatchUnits.length > 0 ? dispatchUnits[0].status : ''
    const unitNetworkRegions = []
    let generatorCap = 0

    dispatchUnits.forEach(unit => {
      const regCap = unit.capacity_registered
      const fuelTech = unit.fuel_tech
      const unitStatus = unit.status
      const type = FUEL_TECHS.FUEL_TECH_CATEGORY[fuelTech] || ''
      let name = unit.duid
      if (!name) {
        emptyIdCount++
        name = `emptyDuid-${emptyIdCount}`
      }

      unitStatuses.push(unitStatus)
      unitNetworkRegions.push(unit.network_region)

      // if (unitStatus === 'operating') {
      //   operatingCount.push(unit)
      // } else if (unitStatus === 'committed') {
      //   committedCount.push(unit)
      // } else if (unitStatus === 'commissioning') {
      //   commissioningCount.push(unit)
      // } else if (unitStatus === 'retired') {
      //   retiredCount.push(unit)
      // } else {
      //   noStatusCount.push(unit)
      // }

      const unitObj = {
        name,
        fuelTech,
        regCap,
        type,
        status: unitStatus
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

      if (unitStatus) {
        if (!unitStatusRegisteredCap[unitStatus]) {
          unitStatusRegisteredCap[unitStatus] = 0
        }
        unitStatusRegisteredCap[unitStatus] += regCap
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

    const regions = _uniq(unitNetworkRegions).filter(r => r && r !== 'SNOWY1')
    const regionId = regions[0] ? regions[0].toLowerCase() : ''

    return {
      stationId,
      displayName,
      status,
      state,
      regionId,
      location,
      hasLocation,
      units,
      unitStatuses: _uniq(unitStatuses).sort(),
      generatorCap,
      unitNum: dispatchUnits.length,
      fuelTechs: _uniq(fuelTechs).sort(),
      genFuelTechs: _uniq(genFuelTechs).sort(),
      loadFuelTechs: _uniq(loadFuelTechs).sort(),
      fuelTechRegisteredCap,
      unitStatusRegisteredCap,
      jsonData: d
    }
  })

  console.log('List of facilities without location:', emptyGeometries)
  // console.log(`${committedCount.length} committed units`, committedCount)
  // console.log(
  //   `${commissioningCount.length} commissioning units`,
  //   commissioningCount
  // )
  // console.log(`${operatingCount.length} operating units`, operatingCount)
  // console.log(`${retiredCount.length} retired units`, retiredCount)
  // console.log(`${noStatusCount.length} no status units`, noStatusCount)

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
