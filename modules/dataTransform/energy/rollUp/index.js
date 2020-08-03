import rollUp30m from './30m.js'

export default function({ domains, datasetFlat, interval }) {
  switch (interval) {
    case '30m':
      return rollUp30m(domains, datasetFlat)
    default:
      return datasetFlat
  }
}
