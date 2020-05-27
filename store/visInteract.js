export const state = () => ({
  isHovering: false
})

export const getters = {
  isHovering: state => state.isHovering
}

export const mutations = {
  isHovering(state, isHovering) {
    state.isHovering = isHovering
  }
}

export const actions = {}
