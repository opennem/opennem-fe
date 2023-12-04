<template>
  <div>
    <ToolbarNarrow v-show="toolbarBreak" />
    <ToolbarWide v-show="!toolbarBreak" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ToolbarWide from '@/components/Toolbar/Wide'
import ToolbarNarrow from '@/components/Toolbar/Narrow'

export default {
  components: {
    ToolbarWide,
    ToolbarNarrow
  },

  computed: {
    ...mapGetters({
      toolbarBreak: 'app/toolbarBreak'
    })
  }
}
</script>