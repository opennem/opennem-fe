import _includes from 'lodash.includes'
import _uniqBy from 'lodash.uniqby'
import * as FUEL_TECHS from '~/constants/fuel-tech.js'
import { EMISSIONS } from '~/constants/data-types.js'

export default {
  parseDomains(domains, dict, type) {
    const groupDomains = []
    if (dict) {
      const order = dict.FUEL_TECH_ORDER

      order.forEach(id => {
        const grouping = dict.FUEL_TECH_GROUP[id]
        const find = domains.find(d => _includes(grouping, d.fuelTech))

        if (find) {
          const domainIds = []
          grouping.forEach(g => {
            const domain = domains.find(d => d.fuelTech === g)
            if (domain) domainIds.push(domain.id)
          })
          groupDomains.push({
            id: `${id}.${type}`,
            domain: `${id}.${type}`,
            label: dict.FUEL_TECH_LABEL[id],
            colour: dict.FUEL_TECH_GROUP_COLOUR[id],
            category: dict.FUEL_TECH_CATEGORY[id],
            type: find.type,
            group: id,
            domainIds
          })
        }
      })
    }

    return groupDomains.reverse()
  },

  getAllDomainObjs() {
    const order = FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER
    return order.map(ft => {
      return {
        // id: `${region}.fuel_tech.${ft}.${type}`,
        fuelTech: ft,
        label: FUEL_TECHS.FUEL_TECH_LABEL[ft],
        colour: FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[ft],
        category: FUEL_TECHS.FUEL_TECH_CATEGORY[ft],
        renewable: FUEL_TECHS.FUEL_TECH_RENEWABLE[ft],
        group: null
      }
    })
  },

  getAllGroupDomains(dict) {
    const order = dict.FUEL_TECH_ORDER
    return order.map(ft => {
      return {
        id: `${ft}.energy`,
        label: dict.FUEL_TECH_LABEL[ft],
        colour: dict.FUEL_TECH_GROUP_COLOUR[ft],
        category: dict.FUEL_TECH_CATEGORY[ft],
        group: ft
      }
    })
  },

  getDomainObjsOrder(domainObjs, domainOrder) {
    // get the unique domains in the right order
    const order = domainOrder
    const uniq = _uniqBy(domainObjs, 'fuelTech').map(d => d.fuelTech)
    const domainObjsOrder = []
    order.forEach(o => {
      if (_includes(uniq, o)) {
        domainObjsOrder.push(o)
      }
    })
    return domainObjsOrder
  },

  getEnergyDomains(res) {
    let domains = []
    res.forEach(r => {
      const rData = r.data || r
      const objs = rData
        .filter(d => d.type === 'power' || d.type === 'energy')
        .map(d => {
          return {
            id: d.id,
            fuelTech: d.fuel_tech,
            type: d.type,
            group: d.group
          }
        })
      domains = [...domains, ...objs]
    })
    return domains
  },

  getEmissionsDomains(res) {
    let domains = []
    res.forEach(r => {
      const rData = r.data || r
      const objs = rData.filter(d => d.type === EMISSIONS).map(d => {
        return {
          id: d.id,
          fuelTech: d.fuel_tech,
          type: d.type,
          group: d.group
        }
      })
      domains = [...domains, ...objs]
    })
    return domains
  },

  getTemperatureDomainsAndIds(res) {
    function isTemperatureType(type) {
      return (
        type === 'temperature' ||
        type === 'temperature_min' ||
        type === 'temperature_mean' ||
        type === 'temperature_max'
      )
    }
    function isTemperatureMeanType(type) {
      return type === 'temperature' || type === 'temperature_mean'
    }
    function isTemperatureMinType(type) {
      return type === 'temperature_min'
    }
    function isTemperatureMaxType(type) {
      return type === 'temperature_max'
    }

    let domains = [],
      minId = '',
      meanId = '',
      maxId = ''

    res.forEach(r => {
      const rData = r.data || r
      const objs = rData.filter(d => isTemperatureType(d.type)).map(d => {
        if (isTemperatureMeanType(d.type)) meanId = d.id
        if (isTemperatureMinType(d.type)) minId = d.id
        if (isTemperatureMaxType(d.type)) maxId = d.id
        return { id: d.id, type: d.type, colour: 'red' }
      })
      domains = [...domains, ...objs]
    })

    return {
      domains,
      minId,
      meanId,
      maxId
    }
  },

  getPriceDomains(res) {
    const PRICE_ABOVE_300 = 'price.above300'
    const PRICE_BELOW_0 = 'price.below0'
    const PRICE_COLOUR = 'blue'
    let domains = []
    res.forEach(r => {
      const rData = r.data || r
      const objs = rData
        .filter(d => d.type === 'price' || d.type === 'volume_weighted_price')
        .map(d => {
          return { id: d.id, type: d.type, colour: PRICE_COLOUR }
        })
      domains = [...domains, ...objs]
    })

    if (domains.length > 0) {
      domains.push({
        id: PRICE_ABOVE_300,
        type: 'price',
        colour: PRICE_COLOUR
      })
      domains.push({
        id: PRICE_BELOW_0,
        type: 'price',
        colour: PRICE_COLOUR
      })
    }
    return domains
  },

  getVolWeightedDomains() {
    const PRICE_COLOUR = 'blue'
    return [
      {
        id: '_volWeightedPrice',
        type: 'price',
        colour: PRICE_COLOUR
      },
      {
        id: '_volWeightedPriceAbove300',
        type: 'price',
        colour: PRICE_COLOUR
      },
      {
        id: '_volWeightedPriceBelow0',
        type: 'price',
        colour: PRICE_COLOUR
      }
    ]
  },

  getDomainObjs(region, domainIds, type) {
    // create ft Objects that has the right id and meta data
    return domainIds.map(ft => {
      return {
        id: `${region}.fuel_tech.${ft}.${type}`,
        domain: `${region}.fuel_tech.${ft}.${type}`,
        fuelTech: ft,
        label: FUEL_TECHS.FUEL_TECH_LABEL[ft],
        colour: FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[ft],
        category: FUEL_TECHS.FUEL_TECH_CATEGORY[ft],
        type,
        renewable: FUEL_TECHS.FUEL_TECH_RENEWABLE[ft]
      }
    })
  }
}
