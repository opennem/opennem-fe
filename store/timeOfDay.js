import { getDay } from '@/data/transform/time-of-day.js'

export const state = () => ({
  todayKey: function() {
    const utcCurrent = new Date()
    utcCurrent.setUTCDate(utcCurrent.getDate());
    utcCurrent.setUTCHours(0, 0, 0, 0)
    return getDay(utcCurrent)
  }(),
  selectedToDs: []
})

export const getters = {
  todayKey: (state) => state.todayKey,
  selectedToDs: (state) => state.selectedToDs
}

export const mutations = {
  selectedToDs(state, selectedToDs) {
    state.selectedToDs = selectedToDs
  }
}

export const actions = {}
