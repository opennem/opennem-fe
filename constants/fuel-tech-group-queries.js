import _includes from 'lodash.includes'
import { ftGroups, GROUP_DEFAULT } from '@/constants/energy-fuel-techs/'

export function isValidFtGroupQuery(query) {
  return _includes(ftGroups, query)
}

export function getDefaultFtGroup() {
  return GROUP_DEFAULT
}
