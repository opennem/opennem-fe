import axios from 'axios'

const apiKey = process.env.API_KEY

const getApiBaseUrl = () => {
  let apiBaseUrl = `https://api.openelectricity.org.au`
  let host = undefined
  if (typeof window !== 'undefined') {
    host = window.location.host
  }

  if (
    host &&
    (host === 'localhost:3000' ||
      host.startsWith('127') ||
      host.startsWith('192'))
  ) {
    apiBaseUrl = `/api`
  }

  // if (host && (host.startsWith('feature-dev-testing-only') || host.startsWith('dev'))) {
  //   apiBaseUrl = `https://api.dev.openelectricity.org.au`
  // }

  if (process.env.API_BASE_URL !== undefined) {
    apiBaseUrl = process.env.API_BASE_URL
  }

  console.info('apiBaseUrl', apiBaseUrl)

  return apiBaseUrl
}

const http = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-ONAU': process.env.NUXT_ENV_HEADER_X_ONUU,
    Authorization: `Bearer ${apiKey}`
  }
})

export default http
