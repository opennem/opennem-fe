<template>
  <div>
    <ToolbarNarrow v-if="toolbarBreak" />
    <ToolbarWide v-else />
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