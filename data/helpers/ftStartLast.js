import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import { mutateDate } from '@/services/datetime-helpers.js'

export function getEarliestLatestDates(
  domainPowerEnergy,
  dataset,
  displayTz,
  ignoreTime
) {
  let earliestEnergyStartDate = null,
    latestEnergyLastDate = null
  domainPowerEnergy.forEach((domain) => {
    const id = domain.id
    const find = dataset.find((d) => d.id === id)
    const start = new Date(
      mutateDate(find.history.start, displayTz, ignoreTime)
    )
    const last = new Date(mutateDate(find.history.last, displayTz, ignoreTime))

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
