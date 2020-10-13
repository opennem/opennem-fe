export default function({ currentDataset, domains }) {
  currentDataset.forEach(d => {
    let total = 0

    domains.forEach(domain => {
      const id = domain.id
      total += d[id] || 0
    })

    d._total = total
  })
}
