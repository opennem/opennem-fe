import axios from 'axios'
import { BrowserClient } from '@sentry/browser'

let host = null,
  client = null

if (typeof window !== 'undefined') {
  host = window.location.host
  if (host === 'opennem.org.au') {
    client = new BrowserClient({
      dsn:
        'https://c89c945a3c14478f9df55a65ddb1fbae@o402615.ingest.sentry.io/5265226'
    })
  }
}

const getBaseUrl = () => {
  let baseUrl = `https://data.opennem.org.au`
  let host = undefined

  if (typeof window !== 'undefined') {
    host = window.location.host
  }

  if (host && host.startsWith('127')) {
    baseUrl = `http://127.0.0.1:8000/static/`
  }

  if (host && host.startsWith('dev')) {
    baseUrl = `https://dev.data.opennem.org.au/`
  }

  if (process.env.DATA_BASE_URL !== undefined) {
    baseUrl = process.env.DATA_BASE_URL
  }

  console.info('baseUrl', baseUrl)

  return baseUrl
}

const http = axios.create({
  baseURL: getBaseUrl(),
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
