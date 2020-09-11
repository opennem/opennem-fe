import startOfDay from 'date-fns/startOfDay'
import rollUp from './energyRollUp'

export default function(domains, data) {
  data.forEach((d, i) => {
    data[i]._rollUpDate = startOfDay(d.date).getTime()
  })
  return rollUp(domains, data)
}
