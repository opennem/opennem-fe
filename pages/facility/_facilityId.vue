<template>
  <section class="facility">
    <div v-if="facility">
      <header>
        <h2>{{ facilityName }}</h2>
      </header>
      <SummaryPlaceholder />

      <h3>Facility units</h3>
      <div class="facility-chart card">
        7 day power
      </div>

      <section class="facility-units card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Region</th>
              <th>Status</th>
              <th>Fuel tech</th>
              <th>Registered capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(d,i) in facilityUnits"
              :key="i" >
              <td>{{ d.code }}</td>
              <td>{{ d.network_region }}</td>
              <td>{{ d.status ? d.status.label : '' }}</td>
              <td>{{ d.fueltech ? d.fueltech.label : '' }}</td>
              <td>{{ d.capacity_registered }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <InfoPlaceholder />

      <FacilityProperties :facility="facility" />
    </div>
    
    <aside v-if="facility">
      <section>
        <figure>
          <img
            src="~/assets/img/placeholder-facility.png"
            alt="Facility image placeholder">
          <figcaption>{{ facilityName }} facility</figcaption>
        </figure>
      </section>
      
      <section class="map">
        <MiniMap 
          :lat="facilityLocation.lat" 
          :lng="facilityLocation.lng" />
        <small>Lat: {{ facilityLocation.lat }} Lng: {{ facilityLocation.lng }}</small>
      </section>
      
      <MetaInfo 
        :facility-id="facilityId"
        :facility-state="facilityState"
        :units-num="facilityUnits.length"
        :participant-name="participant"
      />
    </aside>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MiniMap from '@/components/Facility/MiniMap.vue'
import MetaInfo from '@/components/Facility/MetaInfo.vue'
import FacilityProperties from '@/components/Facility/Properties.vue'
import SummaryPlaceholder from '@/components/Facility/SummaryPlaceholder.vue'
import InfoPlaceholder from '@/components/Facility/InfoPlaceholder.vue'
export default {
  components: {
    MiniMap,
    MetaInfo,
    FacilityProperties,
    SummaryPlaceholder,
    InfoPlaceholder
  },
  computed: {
    ...mapGetters({
      facility: 'facility/selectedFacility'
    }),
    facilityId() {
      console.log(this.$route.params.facilityId)
      return this.$route.params.facilityId
    },
    facilityName() {
      return this.facility ? this.facility.name : ''
    },
    facilityUnits() {
      return this.facility ? this.facility.facilities : []
    },
    facilityLocation() {
      return this.facility ? this.facility.location : { lat: 0, lng: 0 }
    },
    facilityState() {
      return this.facility && this.facility.location
        ? this.facility.location.state
        : ''
    },
    participant() {
      return this.facility ? this.facility.participant_id : ''
    }
  },

  created() {
    this.doGetFacilityById({
      facilityId: this.facilityId
    })
  },

  methods: {
    ...mapActions({
      doGetFacilityById: 'facility/doGetFacilityById'
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$radius: 0.5rem;

.facility {
  display: flex;
  margin: 1rem;

  & > div {
    width: 70%;
    padding: 1rem;
  }
}

header {
  h2 {
    font-family: $header-font-family;
    font-size: 1.6em;
    font-weight: 700;
  }
}

::v-deep h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  border-bottom: 1px solid #666;
}

.facility-chart {
  width: 100%;
  height: 200px;
  background-color: #fff;
  padding: 1rem;
  border-radius: $radius;
  margin-top: 1rem;
}

.facility-units {
  margin: 0.5rem 0;
}

.facility-meta {
  margin: 0.5rem 0;
}

aside {
  width: 30%;
  margin-top: 1rem;

  figure {
    margin-bottom: 1rem;
  }

  img {
    border-radius: $radius;
  }

  figcaption {
    text-align: center;
    font-size: 0.8em;
    font-weight: 700;
  }
}

::v-deep .card {
  background-color: #fff;
  border-radius: $radius;
  padding: 1rem;
  font-size: 0.9em;

  & > .card {
    font-size: 1em;
  }

  &.dark {
    background-color: #333;
    color: #fff;

    table th,
    table td {
      color: #fff;
      border-bottom-color: #666;
    }

    header h4 {
      border-bottom-color: #666;
    }
  }

  &.dim {
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;

    table th,
    table td {
      color: #fff;
      border-bottom-color: #666;
    }

    header h4 {
      border-bottom-color: #666;
    }
  }

  header {
    h4 {
      font-family: $header-font-family;
      font-size: 1.5em;
      font-weight: 700;
      border-bottom: 1px solid #ddd;
    }
  }

  table {
    width: 100%;
  }
  td,
  th {
    border-bottom: 1px solid #efefef;
    padding: 3px 6px;
  }
}
</style>
