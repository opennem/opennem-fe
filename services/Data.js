export default {
  getEnergyUrls(region, range) {
    const urls = []
    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        urls.push(`/power/${region}.json`)
        break
      case '30D':
        urls.push(`/energy/history/daily/${region}.json`)
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        const thisFullYear = new Date().getFullYear()
        const lastFullYear = new Date(aYearAgo).getFullYear()
        if (thisFullYear !== lastFullYear) {
          urls.push(`/testing/${region}/energy/daily/${lastFullYear}.json`)
        }
        urls.push(`/testing/${region}/energy/daily/${thisFullYear}.json`)
        break
      case 'ALL':
        urls.push(`/testing/${region}/energy/monthly/all.json`)
        break
      default:
    }
    return urls
  }
}
