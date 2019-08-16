import axios from 'axios'

const http = axios.create({
  baseURL: `https://data.opennem.org.au`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

function fetchJSON(ref) {
  return new Promise((resolve, reject) => {
    http
      .get(ref)
      .then(data => {
        resolve(data)
      })
      .catch(e => {
        reject(e)
      })
  })
}

export default function(ref) {
  return new Promise((resolve, reject) => {
    const calls = ref.map(r => fetchJSON(r))
    axios
      .all(calls)
      .then(
        axios.spread((...args) => {
          args.forEach(a => {
            if (a.status !== 200) {
              reject(a.originalError)
            }
          })
          resolve(args)
        })
      )
      .catch(e => {
        reject(e)
      })
  })
}
