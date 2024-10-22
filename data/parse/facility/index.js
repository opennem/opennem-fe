import _uniq from 'lodash.uniq'
import _isEmpty from 'lodash.isempty'
import parseISO from 'date-fns/parseISO'
import * as FUEL_TECHS from '~/constants/energy-fuel-techs/group-detailed.js'

let emptyIdCount = 0

function transformFacilityData(data) {
  const stationIds = Object.keys(data)
  const stations = stationIds.map((d) => data[d])

  return stations.map((d) => {
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

    let status = ''

    if (d.status.state === 'Commissioned') {
      status = 'operating'
    } else if (d.status.state === 'Decommissioned') {
      status = 'retired'
    }

    let generatorCap = 0
    if (regionId === 'wa1') {
      regionId = 'wem'
    }

    duidKeys.forEach((unitName) => {
      const unit = d.duid_data[unitName]
      const regCap = unit.registered_capacity
      let fuelTech = unit.fuel_tech

      // workaround for supporting previous fuel tech keys
      if (unit.fuel_tech === 'solar') {
        fuelTech = 'solar_utility'
      } else if (unit.fuel_tech === 'black_coal') {
        fuelTech = 'coal_black'
      } else if (unit.fuel_tech === 'brown_coal') {
        fuelTech = 'coal_brown'
      }
      const type = FUEL_TECHS.FUEL_TECH_CATEGORY[fuelTech] || ''

      const unitObj = {
        name: unitName,
        fuelTech,
        regCap,
        type,
        status
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
      status,
      statusDate: d.status.date,
      regionId,
      location,
      hasLocation: location ? true : false,
      units,
      unitStatuses: [status],
      generatorCap,
      unitNum,
      fuelTechs: _uniq(fuelTechs).sort(),
      genFuelTechs: _uniq(genFuelTechs).sort(),
      loadFuelTechs: _uniq(loadFuelTechs).sort(),
      fuelTechRegisteredCap,
      unitStatusRegisteredCap: {},
      jsonData: d
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

  const transformed = data.map((d) => {
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
    let stationId = props.station_code
    if (!stationId) {
      emptyIdCount++
      stationId = `emptyStationId-${emptyIdCount}`
    }
    const displayName = props.name || '-'
    const state = props.state || ''
    const network = props.network || ''
    const country = props.network_country || ''
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
    const facilityId = props.facility_id
    let generatorCap = 0

    dispatchUnits.forEach((unit) => {
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

    const regions = _uniq(unitNetworkRegions).filter((r) => r && r !== 'SNOWY1')
    const regionId = regions[0] ? regions[0].toLowerCase() : ''
    return {
      stationId,
      facilityId,
      displayName,
      status,
      state,
      regionId,
      location,

      network,
      country,
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

function transformV4FacilityData(data) {
  console.log('transformV4FacilityData', data)

  const transformed = data ? data.map((d) => {
    if (!d.code) {
      console.log('no code', d.code)
    }

    let hasLocation = false
    let location = {
      latitude: null,
      longitude: null
    }
    if (d.location && d.location.lat && d.location.lng) {
      // console.log('location', d.location)
      hasLocation = true
      location = {
        latitude: d.location.lat,
        longitude: d.location.lng
      }
    } else {
      console.log('no location for ', d.code, d.name)
    }

    let state = ''
    if (d.network_region && d.network_region.length > 2) {
      // if string contains 1 at the end, remove it and assign to state
      state = d.network_region.replace(/1$/, '')
    }

    // if at least 1 unit status is operating, then facility is operating
    // else use first unit status
    const status = d.units.some((u) => u.status_id === 'operating')
      ? 'operating'
      : d.units[0].status_id


    let units = []
    let generatorCap = 0
    let maximumCap = 0
    let batteryStorageCap = 0
    const unitStatuses = []
    const fuelTechRegisteredCap = {}
    const unitStatusRegisteredCap = {}
    const fuelTechs = []
    const genFuelTechs = []
    const loadFuelTechs = []

    if (d.units) {

      units = d.units.map((unit) => {
        const name = unit.code
        const regCap = unit.capacity_registered
        const maxCap = unit.capacity_maximum
        const storageCap = unit.storage_capacity

        if (unit.storage_capacity) {
          console.log('storage unit', d.name, unit.storage_capacity)
        }

        const fuelTech = unit.fueltech_id
        const status = unit.status_id
        const dispatchType = unit.dispatch_type
        const type = FUEL_TECHS.FUEL_TECH_CATEGORY[fuelTech] || ''
        
        const dateCommenced = unit.commencement_date ? parseISO(unit.commencement_date) : null
        const dateExpectedClosure = unit.expected_closure_date ? parseISO(unit.expected_closure_date) : null
        const dateClosure = unit.closure_date ? parseISO(unit.closure_date) : null

        // side effects
        unitStatuses.push(status)

        if (type === 'source') {
          generatorCap += regCap || 0
          maximumCap += maxCap || 0
          batteryStorageCap += storageCap || 0
        }

        if (fuelTech) {
          if (!fuelTechRegisteredCap[fuelTech]) {
            fuelTechRegisteredCap[fuelTech] = 0
          }
          fuelTechRegisteredCap[fuelTech] += regCap
        }

        if (status) {
          if (!unitStatusRegisteredCap[status]) {
            unitStatusRegisteredCap[status] = 0
          }
          unitStatusRegisteredCap[status] += regCap
        }

        if (fuelTech !== 'battery_charging' && fuelTech !== 'battery') {
          fuelTechs.push(fuelTech)
          if (type === 'source') {
            genFuelTechs.push(fuelTech)
          } else if (type === 'load') {
            loadFuelTechs.push(fuelTech)
          }
        }

        return {
          name,
          regCap,
          maxCap,
          storageCap,
          fuelTech,
          status,
          dispatchType,
          type,
          dateCommenced,
          dateExpectedClosure,
          dateClosure,

          jsonData: unit
        }
      })
    }

    return {
      stationId: d.code,
      facilityId: d.code,
      displayName: d.name,

      status,

      state,
      regionId: d.network_region || '',
      network: d.network_id || '',
      country: 'au',

      location,
      hasLocation,

      units,
      unitNum: d.units.length,
      unitStatuses: _uniq(unitStatuses).sort(),
      generatorCap,
      maximumCap,
      batteryStorageCap,

      fuelTechs: _uniq(fuelTechs).sort(),
      genFuelTechs: _uniq(genFuelTechs).sort(),
      loadFuelTechs: _uniq(loadFuelTechs).sort(),

      fuelTechRegisteredCap,
      unitStatusRegisteredCap,

      jsonData: d
    }
  }) : [];
  
  return transformed
}

export default {
  flatten(data) {
    const promise = new Promise((resolve) => {
      let flatData = transformFacilityData(data)
      resolve(flatData)
    })

    return promise
  },

  flattenV3(data) {
    const promise = new Promise((resolve) => {
      let flatData = transformV3FacilityData(data)
      resolve(flatData)
    })

    return promise
  },

  flattenV4(data) {
    const promise = new Promise((resolve) => {
      let flatData = transformV4FacilityData(data)
      resolve(flatData)
    })

    return promise
  }
}
