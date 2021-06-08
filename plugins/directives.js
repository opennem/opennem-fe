import Vue from 'vue'

Vue.directive('highlight', {
  bind(el, binding) {
    if (binding.value) {
      el.classList.add('highlight')
    } else {
      el.classList.remove('highlight')
    }
  },

  update(el, binding) {
    if (binding.value) {
      el.classList.add('highlight')
    } else {
      el.classList.remove('highlight')
    }
  }
})
