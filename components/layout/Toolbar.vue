<template>
  <div>
    <div v-if="isEnergyView">
      <ToolbarEnergyNarrow v-show="toolbarBreak" />
      <ToolbarEnergyWide v-show="!toolbarBreak" />
    </div>

    <div v-if="isFacilitiesView">
      <ToolbarFacilitiesNarrow v-show="toolbarBreak" />
      <ToolbarFacilitiesWide v-show="!toolbarBreak" />
    </div>

    <div v-if="isCompareView">
      <ToolbarCompareWide />
    </div>

    <div v-if="isStripesView">
      <ToolbarStripesWide />
    </div>

    <div v-if="isEmissionsView">
      <ToolbarEmissionsWide />
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ToolbarEnergyWide from '@/components/Toolbar/Energy/Wide'
import ToolbarEnergyNarrow from '@/components/Toolbar/Energy/Narrow'
import ToolbarFacilitiesWide from '@/components/Toolbar/Facilities/Wide'
import ToolbarFacilitiesNarrow from '@/components/Toolbar/Facilities/Narrow'
import ToolbarCompareWide from '@/components/Toolbar/Compare/Wide'
import ToolbarStripesWide from '@/components/Toolbar/Stripes/Wide'
import ToolbarEmissionsWide from '@/components/Toolbar/Emissions/Wide'

export default {
  components: {
    ToolbarEnergyWide,
    ToolbarEnergyNarrow,
    ToolbarFacilitiesWide,
    ToolbarFacilitiesNarrow,
    ToolbarCompareWide,
    ToolbarStripesWide,
    ToolbarEmissionsWide
  },

  computed: {
    ...mapGetters({
      isEnergyView: 'isEnergyView',
      isFacilitiesView: 'isFacilitiesView',
      isCompareView: 'isCompareView',
      isStripesView: 'isStripesView',
      isEmissionsView: 'isEmissionsView',
      toolbarBreak: 'app/toolbarBreak'
    })
  }
}
</script>