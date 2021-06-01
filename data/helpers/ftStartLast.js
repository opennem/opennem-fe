import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'

export function getEarliestLatestDates(domainPowerEnergy, dataset) {
  let earliestEnergyStartDate = null,
    latestEnergyLastDate = null
  domainPowerEnergy.forEach(domain => {
    const id = domain.id
    const find = dataset.find(d => d.id === id)
    const start = new Date(find.history.start)
    const last = new Date(find.history.last)

    if (find) {
      if (
        !earliestEnergyStartDate ||
        (earliestEnergyStartDate && isBefore(start, earliestEnergyStartDate))
      ) {
        earliestEnergyStartDate = start
      }

      if (
        !latestEnergyLastDate ||
        (latestEnergyLastDate && isAfter(last, latestEnergyLastDate))
      ) {
        latestEnergyLastDate = last
      }
    }
  })

  return { earliestEnergyStartDate, latestEnergyLastDate }
}
