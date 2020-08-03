import startOfWeek from 'date-fns/startOfWeek'
import rollUp from './energyRollUp'

export default function(domains, data) {
  data.forEach((d, i) => {
    data[i]._rollUpDate = startOfWeek(d.date, { weekStartsOn: 1 }).getTime()
  })
  return rollUp(domains, data)
}
