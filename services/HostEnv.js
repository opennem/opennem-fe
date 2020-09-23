export default function() {
  let hostEnv = 'prod' // Default location of where the data comes from
  if (typeof window !== 'undefined') {
    const host = window.location.host

    if (host === 'opennem.org.au') {
      hostEnv = 'prod'
    }
    if (host === 'dev.opennem.org.au') {
      hostEnv = 'dev'
    }
  }
  return hostEnv
}
