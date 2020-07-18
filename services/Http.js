import axios from 'axios'
import { BrowserClient } from '@sentry/browser'

const host = window.location.host
let client = null
if (host === 'opennem.org.au') {
  client = new BrowserClient({
    dsn:
      'https://c89c945a3c14478f9df55a65ddb1fbae@o402615.ingest.sentry.io/5265226'
  })
}

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
        const error = e.toJSON()
        const message = `fetch ${error.config.url} error: ${error.message}`
        if (client) {
          client.captureException(message)
        }
        console.error(message, e.toJSON())
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
          const updated = []
          args.forEach(a => {
            if (a.status !== 200) {
              reject(a.originalError)
            } else {
              updated.push(a.data)
            }
          })
          resolve(updated)
        })
      )
      .catch(e => {
        reject(e)
      })
  })
}
