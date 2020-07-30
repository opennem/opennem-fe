import rollUp30m from './30m.js'

export default function({ domains, datasetAll, interval }) {
  switch (interval) {
    case '30m':
      return rollUp30m(domains, datasetAll)
    default:
      return datasetAll
  }
}
