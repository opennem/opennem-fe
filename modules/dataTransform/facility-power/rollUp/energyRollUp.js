import { sum, rollups } from 'd3-array'

function reducer(a, domains) {
  let obj = {}

  domains.forEach(domain => {
    const id = domain.id
    obj[id] = sum(a, d => d[id] || 0)
  })

  return obj
}

export default function(domains, data) {
  const entries = rollups(data, v => reducer(v, domains), d => d._rollUpDate)

  return entries.map(e => {
    const object = {
      time: e[0],
      date: new Date(e[0])
    }

    Object.keys(e[1]).forEach(k => {
      object[k] = e[1][k]
    })
    return object
  })
}
