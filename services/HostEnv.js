export default function () {
  let hostEnv = 'dev' // Default location of where the data comes from
  if (typeof window !== 'undefined') {
    const host = window.location.host

    if (host && (host.startsWith('feature-dev-testing-only') || host.startsWith('dev'))) {
      hostEnv = 'dev'
    } else {
      hostEnv = 'prod'
    }
  }
  return hostEnv
}
