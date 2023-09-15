import { getDay } from '@/data/transform/time-of-day.js'

export const state = () => ({
  todayKey: function() {
    const utcCurrent = new Date()
    utcCurrent.setUTCDate(utcCurrent.getDate());
    utcCurrent.setUTCHours(0, 0, 0, 0)
    return getDay(utcCurrent)
  }()
})

export const getters = {
  todayKey: (state) => state.todayKey
}

export const mutations = {
  // timeDomains(state, timeDomains) {
  //   state.timeDomains = timeDomains
  // }
}

export const actions = {}
