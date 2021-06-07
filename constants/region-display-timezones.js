import { getTimezoneOffset } from 'date-fns-tz'
import {
  ENERGY_AU,
  ENERGY_NEM,
  ENERGY_NSW,
  ENERGY_QLD,
  ENERGY_SA,
  ENERGY_TAS,
  ENERGY_VIC,
  ENERGY_WEM
} from '@/constants/energy-regions.js'

const displayTzs = {}
displayTzs[ENERGY_AU] = getTimezoneOffset('+10:00')
displayTzs[ENERGY_NEM] = getTimezoneOffset('+10:00')
displayTzs[ENERGY_NSW] = getTimezoneOffset('Australia/Sydney')
displayTzs[ENERGY_QLD] = getTimezoneOffset('Australia/Brisbane')
displayTzs[ENERGY_SA] = getTimezoneOffset('Australia/Adelaide')
displayTzs[ENERGY_TAS] = getTimezoneOffset('Australia/Hobart')
displayTzs[ENERGY_VIC] = getTimezoneOffset('Australia/Melbourne')
displayTzs[ENERGY_WEM] = getTimezoneOffset('+08:00')

export default displayTzs
