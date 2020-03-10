import moment from 'moment'
import _sortBy from 'lodash.sortby'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'
import { timeMinute as d3TimeMinute } from 'd3-time'
import parseInterval from '~/plugins/intervalParser.js'
import millisecondsByInterval from '~/constants/millisecondsByInterval.js'
import { EMISSIONS } from '~/constants/emissions.js'

import rollUp30m from '../rollUpModules/ru-30m.js'
import rollUp1YDay from '../rollUpModules/ru-1y-day.js'
import rollUp1YWeek from '../rollUpModules/ru-1y-week.js'
import rollUp1YMonth from '../rollUpModules/ru-1y-month.js'
import rollUpAllSeason from '../rollUpModules/ru-all-season.js'
import rollUpAllQuarter from '../rollUpModules/ru-all-quarter.js'
import rollUpAllHalfYear from '../rollUpModules/ru-all-half-year.js'
import rollUpAllFinYear from '../rollUpModules/ru-all-financial-year.js'
import rollUpAllYear from '../rollUpModules/ru-all-year.js'

const PRICE_ABOVE_300 = 'price.above300'
const PRICE_BELOW_0 = 'price.below0'

function checkTemperatureType(type) {
  return (
    type === 'temperature' ||
    type === 'temperature_min' ||
    type === 'temperature_mean' ||
    type === 'temperature_max'
  )
}

/**
 *
 * @param {*} data: response data from API
 */
function transformEnergyData(
  data,
  domains,
  marketValueDomains,
  temperatureDomains,
  priceDomains,
  emissionDomains
) {
  const dataset = []

  /**
   *
   * @param {*} id: data id
   * @param {*} type: data type
   * @param {*} newHistory: updated history list
   *
   * Flat data array contains a list of dates and data values
   */
  function mergeIntoFlatData(id, type, newHistory) {
    const isEnergyData = type === 'power' || type === 'energy'
    const isMarketValueData = type === 'market_value'
    const isTemperatureType = checkTemperatureType(type)
    const isPriceData = type === 'price' || type === 'volume_weighted_price'
    const isEmissionData = type === EMISSIONS

    newHistory.forEach(r => {
      const findDate = dataset.find(f => f.date === r.date)
      if (!findDate) {
        // if Date point doesn't exist, create date point with empty values
        const newObj = { date: r.date }

        if (
          isEnergyData ||
          isTemperatureType ||
          isPriceData ||
          isMarketValueData ||
          isEmissionData
        ) {
          // Add energy domains
          domains.forEach(domain => {
            newObj[domain.id] = null
          })
          // Add market value domains
          marketValueDomains.forEach(domain => {
            newObj[domain.id] = null
          })
          // Add temperature domains
          temperatureDomains.forEach(domain => {
            newObj[domain.id] = null
          })
          // Add price domains
          priceDomains.forEach(domain => {
            newObj[domain.id] = null
          })
          // Add price domains
          emissionDomains.forEach(domain => {
            newObj[domain.id] = null
          })
          newObj[id] = r.value
          dataset.push(newObj)
        }
      } else {
        if (
          isEnergyData ||
          isTemperatureType ||
          isMarketValueData ||
          isEmissionData
        ) {
          findDate[id] = r.value
        } else if (isPriceData) {
          findDate[id] = r.value
          findDate[PRICE_ABOVE_300] = r.value > 300 ? r.value : 0.001
          findDate[PRICE_BELOW_0] = r.value < 0 ? r.value : -0.001
        }
      }
    })
  }

  /**
   *
   * @param {*} id: data id
   * @param {*} fuelTech: fuel tech type
   * @param {*} type: data type
   * @param {*} history: history object
   */
  function parseHistory(id, fuelTech, type, history) {
    const historyData = history.data
    // const offsetHrs = moment().utcOffset()
    // let historyDate = moment(history.start).utcOffset(offsetHrs)
    // const year = historyDate.year()
    // const month = historyDate.month() + 1
    // const date = historyDate.date()
    // const hour = historyDate.hour()
    // const minute = historyDate.minute()
    // let currentDate = moment.utc(
    //   `${year}-${month}-${date} ${hour}:${minute}`,
    //   'YYYY-MM-DD HH:mm'
    // )
    let currentDate = moment(history.start)
    let interval = parseInterval(history.interval)

    function createHistoryObject(hData) {
      return hData.map(h => {
        const newObj = {
          date: currentDate.valueOf(),
          value: h
        }

        // Increment to next time interval
        currentDate.add(interval.value, interval.key)
        return newObj
      })
    }

    const historyObjs = createHistoryObject(historyData)
    mergeIntoFlatData(id, type, historyObjs)
  }
  data.forEach(d => {
    if (d.history && d.history.start) {
      parseHistory(d.id, d.fuel_tech, d.type, d.history)
    } else {
      console.error(`${d.id} has no history.`)
    }

    if (d.forecast && d.forecast.start) {
      parseHistory(d.id, d.fuel_tech, d.type, d.forecast)
    } else {
      // console.log(`${d.id} has no forecast.`)
    }
  })
  return _sortBy(dataset, ['date'])
}

function findInterpolateSeriesTypes(data) {
  const rooftopSolarItem = data.find(d => d['fuel_tech'] === 'rooftop_solar')
  const temperatureItem = data.find(d => checkTemperatureType(d.type))
  const priceItem = data.find(
    d => d.type === 'price' || d.type === 'volume_weighted_price'
  )
  const interpolateSeriesTypes = []
  if (rooftopSolarItem) {
    interpolateSeriesTypes.push({
      key: rooftopSolarItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  if (temperatureItem) {
    interpolateSeriesTypes.push({
      key: temperatureItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  if (priceItem) {
    interpolateSeriesTypes.push({
      key: priceItem.id,
      interpolation: 'step',
      startIndex: -1,
      currentValue: null
    })
    interpolateSeriesTypes.push({
      key: PRICE_ABOVE_300,
      interpolation: 'step',
      startIndex: -1,
      currentValue: null
    })
    interpolateSeriesTypes.push({
      key: PRICE_BELOW_0,
      interpolation: 'step',
      startIndex: -1,
      currentValue: null
    })
  }

  return interpolateSeriesTypes
}

function mutateDataForInterpolation(data, interpolateSeriesTypes) {
  data.forEach((d, i) => {
    interpolateSeriesTypes.forEach(type => {
      if (d[type.key] !== null) {
        if (type.interpolation === 'linear') {
          if (type.startIndex === -1) {
            type.startIndex = i
          } else {
            const count = i - type.startIndex
            const addValue = (d[type.key] - type.currentValue) / count
            for (let x = type.startIndex + 1; x <= i; x += 1) {
              data[x][type.key] = type.currentValue + addValue
              type.currentValue = data[x][type.key]
            }
            type.startIndex = i
          }
        }
        type.currentValue = d[type.key]
      } else if (d[type.key] === null) {
        if (type.interpolation === 'step') {
          d[type.key] = type.currentValue
        }
      }
    })
  })
}

function getNextDatetime(interval, datetime) {
  switch (interval) {
    case 'Month':
      return moment(datetime)
        .add(1, 'month')
        .valueOf()
    default:
      return datetime + millisecondsByInterval[interval]
  }
}

function addEmptyDataPoint(interval, dataset) {
  const emptyDataPoint = _cloneDeep(dataset[dataset.length - 1])
  const time = getNextDatetime(interval, emptyDataPoint.date)
  Object.keys(emptyDataPoint).forEach(key => {
    if (key === 'date') {
      emptyDataPoint[key] = time
    } else {
      if (
        _includes(key, 'temperature') ||
        _includes(key, 'volume_weighted_price')
      ) {
        // console.log(key)
      } else if (_includes(key, '_volWeightedPrice')) {
        // _includes(key, '_emissionsIntensity')
        // _includes(key, EMISSIONS)
        emptyDataPoint[key] = emptyDataPoint[key]
      } else {
        emptyDataPoint[key] = null
      }
    }
  })
  return emptyDataPoint
}

export default {
  flatten(data) {
    const promise = new Promise(resolve => {
      let flatData = transformEnergyData(data)
      resolve(flatData)
    })

    return promise
  },

  flattenAndInterpolate(
    data,
    energyDomains,
    marketValueDomains,
    temperatureDomains,
    priceDomains,
    emissionDomains,
    shouldInterpolate
  ) {
    const promise = new Promise(resolve => {
      let flatData = transformEnergyData(
        data,
        energyDomains,
        marketValueDomains,
        temperatureDomains,
        priceDomains,
        emissionDomains
      )

      if (shouldInterpolate) {
        const interpolateSeriesTypes = findInterpolateSeriesTypes(data)
        mutateDataForInterpolation(flatData, interpolateSeriesTypes)
      }

      resolve(flatData)
    })

    return promise
  },

  mergeResponses(
    res,
    energyDomains,
    marketValueDomains,
    temperatureDomains,
    priceDomains,
    emissionDomains,
    range,
    interval
  ) {
    return new Promise(resolve => {
      let data = []
      const promises = []
      const shouldInterpolate =
        range === '1D' || range === '3D' || range === '7D'

      let lastDate = null
      if (res.length) {
        try {
          const resData = res[0].data
          const e = energyDomains[0]
          const ft = resData.find(d => d.id === e.id)
          if (ft) lastDate = ft.history.last
        } catch (e) {
          console.log('There is an issue looking for last valid FT date')
        }
      }

      // flatten data for vis and summary
      res.forEach(r => {
        promises.push(
          this.flattenAndInterpolate(
            r.data,
            energyDomains,
            marketValueDomains,
            temperatureDomains,
            priceDomains,
            emissionDomains,
            shouldInterpolate
          )
        )
      })

      // return flatten data and merge
      Promise.all(promises).then(values => {
        values.forEach(v => {
          data = [...data, ...v]
        })

        // If 1D or 3D, use 7D data and filter the data here, so the chart doesn't zoom
        if (range === '1D' || range === '3D') {
          const lastPointDate = data[data.length - 1].date
          const roundedEndDate =
            interval === '5m'
              ? d3TimeMinute.every(5).round(lastPointDate)
              : d3TimeMinute.every(30).round(lastPointDate)
          const diff = range === '1D' ? 86400000 + 1200000 : 259200000
          data = data.filter(
            d => d.date >= roundedEndDate - diff && d.date < roundedEndDate
          )
        } else if (range === '30D') {
          let lastDateTime = new Date().getTime()
          if (lastDate) {
            // if has valid FT last date, use that to filter the data.
            // Because there could be non-FT last dates that are into the future
            lastDateTime = moment(lastDate).valueOf()
          }
          const thirtyDaysAgo = lastDateTime - 2592000000
          data = data.filter(
            d => d.date > thirtyDaysAgo && d.date <= lastDateTime
          )
        } else if (range === '1Y') {
          // filter 1Y because it could be a combination of two 1Y datasets
          const now = new Date().getTime()
          const aYearAgo = now - 31557600000
          data = data.filter(d => d.date >= aYearAgo && d.date <= now)
        }

        // Filter the start and last date based on a fuel tech other than solars
        if (range === '1D' || range === '3D' || range === '7D') {
          let startDate = null,
            lastDate = null
          energyDomains.every(domain => {
            if (
              domain.fuelTech !== 'rooftop_solar' &&
              domain.fuelTech !== 'solar'
            ) {
              const find = res[0].data.find(d => d.id === domain.id)
              if (find) {
                startDate = moment(find.history.start).valueOf()
                let lastTime =
                  moment(find.history.last).valueOf() -
                  millisecondsByInterval[interval]
                lastDate = moment(lastTime).valueOf()
                return false
              }
            }
            return true
          })

          if (startDate && lastDate) {
            data = data.filter(d => d.date >= startDate && d.date <= lastDate)
          }
        }

        // Roll up based on interval
        this.rollUp(
          data,
          energyDomains,
          marketValueDomains,
          temperatureDomains,
          priceDomains,
          emissionDomains,
          range,
          interval
        ).then(rolledUpData => {
          const dataset = this.calculateMinTotal(
            rolledUpData,
            energyDomains,
            marketValueDomains,
            emissionDomains,
            interval,
            data[0].date,
            data[data.length - 1].date
          )
          // add an empty datapoint, so the stacked step will have something to render
          if (range !== '1D' && range !== '3D' && range !== '7D') {
            dataset.push(addEmptyDataPoint(interval, dataset))
          }

          resolve(dataset)
        })
      })
    })
  },

  calculateMinTotal(
    dataset,
    energyDomains,
    marketValueDomains,
    emissionDomains,
    interval,
    actualStartDate,
    actualLastDate
  ) {
    // Calculate total, min, reverse value for imports and load types
    dataset.forEach((d, i) => {
      let totalDemand = 0,
        totalSources = 0,
        totalGeneration = 0,
        min = 0,
        totalEmissionsVol = 0,
        totalRenewables = 0,
        totalMarketValue = 0

      energyDomains.forEach(domain => {
        const id = domain.id

        if (domain.category === 'load' || domain.fuelTech === 'imports') {
          const negValue = -d[id]
          d[id] = negValue
        }

        if (domain.category == 'source') {
          totalSources += d[id] || 0
        }

        if (domain.category == 'source' && domain.fuelTech !== 'imports') {
          totalGeneration += d[id] || 0
        }

        totalDemand += d[id] || 0

        if (domain.renewable) {
          totalRenewables += d[id] || 0
        }

        if (d[id] < 0) {
          min += d[id] || 0
        }
      })

      // calculate vol weighted pricing
      marketValueDomains.forEach(domain => {
        totalMarketValue += d[domain.id] || 0
      })

      emissionDomains.forEach(domain => {
        totalEmissionsVol += d[domain.id] || 0
      })

      const volWeightedPrice =
        interval === 'Year' || interval === 'Fin Year'
          ? totalMarketValue / totalDemand / 1000 / 1000
          : totalMarketValue / totalDemand / 1000

      dataset[i]._total = totalDemand
      dataset[i]._totalRenewables = totalRenewables
      dataset[i]._totalDemandRenewables = (totalRenewables / totalDemand) * 100
      dataset[i]._totalSources = totalSources
      dataset[i]._totalGeneration = totalGeneration
      dataset[i]._totalSourcesRenewables =
        (totalRenewables / totalSources) * 100
      dataset[i]._totalGenerationRenewables =
        (totalRenewables / totalGeneration) * 100
      dataset[i]._min = min
      dataset[i]._totalEmissionsVol = totalEmissionsVol
      const emissionsIntensity =
        interval === 'Year' || interval === 'Fin Year'
          ? totalEmissionsVol / totalDemand / 1000
          : totalEmissionsVol / totalDemand
      dataset[i]._emissionsIntensity = emissionsIntensity || 0
      dataset[i]._actualLastDate = actualLastDate
      dataset[i]._actualStartDate = actualStartDate
      dataset[i]._totalMarketValue = totalMarketValue
      dataset[i]._volWeightedPrice = isNaN(volWeightedPrice)
        ? null
        : volWeightedPrice

      dataset[i]._volWeightedPriceAbove300 =
        !isNaN(volWeightedPrice) && volWeightedPrice > 300
          ? volWeightedPrice
          : 0.01
      dataset[i]._volWeightedPriceBelow0 =
        !isNaN(volWeightedPrice) && volWeightedPrice < 0
          ? volWeightedPrice
          : -0.01
    })
    return dataset
  },

  rollUp(
    data,
    energyDomains,
    marketValueDomains,
    temperatureDomains,
    priceDomains,
    emissionDomains,
    range,
    interval
  ) {
    const domains = [
      ...energyDomains,
      ...marketValueDomains,
      ...priceDomains,
      ...temperatureDomains,
      ...emissionDomains
    ]
    const promise = new Promise(resolve => {
      if (interval === '30m') {
        resolve(rollUp30m(domains, data))
      } else if (range === '30D' && interval === 'Day') {
        // resolve(data)
        resolve(rollUp1YDay(domains, data))
      } else if (range === '1Y' && interval === 'Day') {
        resolve(rollUp1YDay(domains, data))
      } else if (range === '1Y' && interval === 'Week') {
        resolve(rollUp1YWeek(domains, data))
      } else if (range === '1Y' && interval === 'Month') {
        resolve(rollUp1YMonth(domains, data))
      } else if (range === 'ALL' && interval === 'Month') {
        resolve(rollUp1YMonth(domains, data))
      } else if (range === 'ALL' && interval === 'Season') {
        resolve(rollUpAllSeason(domains, data))
      } else if (range === 'ALL' && interval === 'Quarter') {
        resolve(rollUpAllQuarter(domains, data))
      } else if (range === 'ALL' && interval === 'Half Year') {
        resolve(rollUpAllHalfYear(domains, data))
      } else if (range === 'ALL' && interval === 'Fin Year') {
        resolve(rollUpAllFinYear(domains, energyDomains, data))
      } else if (range === 'ALL' && interval === 'Year') {
        resolve(rollUpAllYear(domains, energyDomains, data))
      }
      resolve(data)
    })
    return promise
  },

  filterDataByStartEndDates(data, startDate, endDate) {
    const startDateTime = new Date(startDate).getTime()
    const endDateTime = new Date(endDate).getTime()

    return data.filter(d => d.date >= startDateTime && d.date < endDateTime)
  }
}
