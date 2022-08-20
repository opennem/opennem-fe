<template>
  <header>
    <a :href="path" class="back-link" @click.prevent="backToFacilities">
      <i class="fal fa-chevron-left" />
      <AppLogo class="logo" />
      <h1>Facilities</h1>
    </a>

    <nav v-if="filteredFacilities.length > 1">
      <nuxt-link
        v-tooltip="prevFacilityName"
        v-if="prevFacilityPath"
        :to="prevFacilityPath"
      >
        <i class="fal fa-fw fa-arrow-circle-up" />
      </nuxt-link>
      <span v-else class="is-disabled">
        <i class="fal fa-fw fa-arrow-circle-up" />
      </span>

      <nuxt-link
        v-tooltip="nextFacilityName"
        v-if="nextFacilityPath"
        :to="nextFacilityPath"
      >
        <i class="fal fa-fw fa-arrow-circle-down" />
      </nuxt-link>
      <span v-else class="is-disabled">
        <i class="fal fa-fw fa-arrow-circle-down" />
      </span>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
  },

  data() {
    return {
      nextFacilityPath: null,
      nextFacilityName: '',
      prevFacilityPath: null,
      prevFacilityName: ''
    }
  },

  computed: {
    ...mapGetters({
      facilitiesQuery: 'app/facilitiesQuery',
      previousPath: 'facility/previousPath',
      filteredFacilities: 'facility/filteredFacilities'
    }),
    facilityCode() {
      return this.$route.params.facilityCode
    },
    path() {
      const selected = `?selected=${this.facilityCode}`
      return this.previousPath === ''
        ? '/facilities/au/'
        : this.previousPath + selected
    }
  },

  watch: {
    facilityCode() {
      this.updatePaths()
    }
  },

  mounted() {
    this.updatePaths()
    window.addEventListener('keydown', this.listenToNavKeys)
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.listenToNavKeys)
  },

  methods: {
    backToFacilities(e) {
      e.preventDefault()
      this.$router.push({ path: this.path, query: this.facilitiesQuery })
    },
    listenToNavKeys(e) {
      const isLeft = e.keyCode === 37
      const isUp = e.keyCode === 38
      const isDown = e.keyCode === 40

      if (isUp) {
        e.preventDefault()
        if (this.prevFacilityPath) {
          this.$router.push({ path: this.prevFacilityPath })
        }
      } else if (isDown) {
        e.preventDefault()
        if (this.nextFacilityPath) {
          this.$router.push({ path: this.nextFacilityPath })
        }
      } else if (isLeft) {
        e.preventDefault()
        this.$router.push({ path: this.path, query: this.facilitiesQuery })
      }
    },
    updatePaths() {
      const facilitiesLength = this.filteredFacilities.length
      const currentIndex = this.filteredFacilities.findIndex(
        (f) => f.facilityId === this.facilityCode
      )
      const currentFacility = this.filteredFacilities.find(
        (f) => f.facilityId === this.facilityCode
      )

      console.log(this.filteredFacilities, this.facilityCode)

      if (currentIndex !== -1) {
        const isFirstItem = currentIndex === 0
        const isLastItem = currentIndex === facilitiesLength - 1

        const nextFacility = isLastItem
          ? null
          : this.filteredFacilities[currentIndex + 1]
        const prevFacility = isFirstItem
          ? null
          : this.filteredFacilities[currentIndex - 1]

        const nextFacilityId = nextFacility ? nextFacility.facilityId : null
        const nextFacilityName = nextFacility ? nextFacility.displayName : null
        const nextFacilityNetwork = nextFacility ? nextFacility.network : null
        const nextFacilityCountry = nextFacility ? nextFacility.country : null

        const prevFacilityId = prevFacility ? prevFacility.facilityId : null
        const prevFacilityName = prevFacility ? prevFacility.displayName : null
        const prevFacilityNetwork = prevFacility ? prevFacility.network : null
        const prevFacilityCountry = prevFacility ? prevFacility.country : null

        console.log(prevFacilityCountry, nextFacilityCountry)

        this.nextFacilityPath = nextFacilityId
          ? `/facility/${encodeURIComponent(
              nextFacilityCountry
            )}/${encodeURIComponent(nextFacilityNetwork)}/${encodeURIComponent(
              nextFacilityId
            )}`
          : null
        this.prevFacilityPath = prevFacilityId
          ? `/facility/${encodeURIComponent(
              prevFacilityCountry
            )}/${encodeURIComponent(prevFacilityNetwork)}/${encodeURIComponent(
              prevFacilityId
            )}`
          : null
        this.nextFacilityName = nextFacilityName
        this.prevFacilityName = prevFacilityName
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

header {
  display: flex;
  justify-content: space-between;

  nav {
    margin-top: 1.7rem;
    margin-right: 1rem;
    font-size: 2rem;

    @include mobile {
      margin-top: 0.7rem;
      margin-right: 0.5rem;
    }

    .is-disabled {
      color: #ccc;
    }
  }
}
.back-link {
  $item-margin: 0.75rem;

  display: inline-flex;
  align-items: center;
  border-radius: $header-hover-radius;
  margin-top: 1.5rem;
  margin-left: 1.5rem;
  padding: $app-padding / 3 $app-padding / 2;
  background-color: $background-alpha;

  @include mobile {
    margin-top: 0.5rem;
    margin-left: 0rem;
  }

  i {
    font-size: 1.6rem;
    margin-right: $item-margin;
  }

  .logo {
    width: 2.3rem;
    position: relative;
    top: 3px;
    margin-right: $item-margin;
  }

  h1 {
    font-family: $header-font-family;
    font-weight: 700;
    color: #000;
    font-size: 1.2rem;
  }

  &:hover {
    i {
      color: $opennem-link-color;
    }
    background-color: rgba(255, 255, 255, 0.55);
  }
}
</style>
