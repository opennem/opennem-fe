import startOfMonth from 'date-fns/startOfMonth'
import rollUp from './energyRollUp'

export default function(domains, data) {
  data.forEach((d, i) => {
    data[i]._rollUpDate = startOfMonth(d.date).getTime()
  })
  return rollUp(domains, data)
}
