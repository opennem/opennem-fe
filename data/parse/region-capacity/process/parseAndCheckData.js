import * as DT from '@/constants/data-types.js'
import {
  checkHistoryObject,
  checkPowerEnergyExists
} from '@/services/DataCheck.js'

export default function (response, displayTz) {
  const data = response.data || response
  const dataCapacity = []
  data.forEach((d) => {
    
    switch (d.type) {
      case DT.CAPACITY:
        dataCapacity.push(d)
        break
      
      default:
        console.warn(`Unknown type in JSON response - ${d.type}`, d)
    }
  })


  return {
    dataCapacity,
    fuelTechDataType: DT.CAPACITY,
    units: dataCapacity.length > 0 ? dataCapacity[0].units : ''
  }
}
