<template>
  <div class="vis-summary">
    <section class="vis-section">
      <header>
        <h1>date selection</h1>
      </header>
      <h1>HTML Ipsum Presents</h1>

      <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>

      <h2>Header Level 2</h2>

      <ol>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
      </ol>

      <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote>

      <h3>Header Level 3</h3>

      <ul>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
      </ul>

      <ul>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
      </ul>

      <footer>
        <h1>dates</h1>
      </footer>
    </section>
    
    <section class="summary-section">
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Clients</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Clients</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Clients</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Clients</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </nav>
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  layout: 'default2',

  computed: {
    ...mapGetters({
      energyRegions: 'region-energy/energyRegions',
      energyFuelTechs: 'region-energy/energyFuelTechs'
    }),
    regionId() {
      return this.$route.params.region
    }
  },
  created() {
    this.doGetRegionData(this.regionId)
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'region-energy/doGetRegionData'
    })
  }
}
</script>

<style lang="scss" scoped>
header {
  position: sticky;
  top: 0;
  height: 50px;
  background-color: #999;
}
footer {
  position: sticky;
  bottom: 0;
  height: 50px;
  background-color: #999;
}
.vis-summary {
  display: flex;
  .vis-section {
    width: 75%;
  }
  .summary-section {
    width: 25%;

    nav {
      position: sticky;
      top: 0;
    }
  }
}
</style>
