<template>
  <section class="facility">
    <div>
      <header>
        <h2>{{ facilityName }}</h2>
      </header>
      <summary>
        <p class="blank">Bayswater Power Station is a bituminous (black) coal-powered thermal power station with four 660 
        megawatts (890,000 hp) Tokyo Shibaura Electric (Japan) steam driven turbo alternators for a combined 
        capacity of 2,640 megawatts (3,540,000 hp). Commissioned between 1985 and 1986, the station is located 
        16 kilometres (10 mi) from Muswellbrook, and 28 km (17 mi) from Singleton in the Hunter Region of 
        New South Wales, Australia.</p>
        <p class="blank">Prior to September 2014 Bayswater Power Station was part of NSW Government power producer, 
        Macquarie Generation. Macquarie Generation was acquired by AGL Energy in September 2014.</p>
      </summary>

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
              <td>{{ d.status.label }}</td>
              <td>{{ d.fueltech.label }}</td>
              <td>{{ d.capacity_registered }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="facility-info">
        <h3>Facility information</h3>

        <div class="info">
          <h4 class="info-title">Boilers</h4>
          <ul>
            <li>Steam pressure: 16,550 kilopascals (2,400 psi)</li>
            <li>Steam temperature: 540 °C (1,004 °F)</li>
            <li>Height: 80 metres (260 ft)</li>
          </ul>
        </div>

        <div class="info">
          <h4 class="info-title">Turbo alternators</h4>
          <ul>
            <li>Number in use: 4</li>
            <li>Manufacturer: Tokyo Shibaura Electric Company, (Toshiba) Limited, Japan.</li>
            <li>Operating speed 3,000 rpm</li>
            <li>Alternator voltage: 23 kV</li>
            <li>Rating: 660 megawatts (890,000 hp)</li>
            <li>Length: 50 metres (160 ft)</li>
            <li>Weight: 1,342 metric tons (1,479 short tons)</li>
          </ul>
        </div>
      </section>

      <FacilityProperties :facility="facility" />
    </div>
    
    <aside>
      <section>
        <figure>
          <img
            src="~/assets/img/placeholder-facility.png"
            alt="Facility image placeholder">
          <figcaption>{{ facilityName }} facility</figcaption>
        </figure>
      </section>
      
      <section class="map">
        <figure>
          <img
            src="~/assets/img/placeholder-map.png"
            alt="Facility map placeholder">
          <figcaption>Lat: {{ facilityLocation.lat }} Lng: {{ facilityLocation.lng }}</figcaption>
        </figure>
        
      </section>
      
      <section class="facility-meta card">
        <table>
          <tbody>
            <tr>
              <th>Code</th>
              <td>{{ facilityId }}</td>
            </tr>
            <tr>
              <th>State</th>
              <td>{{ facilityState }}</td>
            </tr>
            <tr>
              <th>Number of units</th>
              <td>{{ facilityUnits.length }}</td>
            </tr>
            <tr>
              <th>Participant</th>
              <td>{{ participant }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </aside>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FacilityProperties from '@/components/Facility/Properties.vue'
export default {
  components: {
    FacilityProperties
  },
  computed: {
    ...mapGetters({
      facility: 'facility/selectedFacility'
    }),
    facilityId() {
      return this.$route.query.facilityId
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
      return this.facility ? this.facility.participant : ''
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

// test styles
@mixin redacted($display) {
  color: #999;
  background-color: #999;
  display: $display;
}
.blank {
  @include redacted(inline);
}
//

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

h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  border-bottom: 1px solid #666;
}

summary {
  padding: 1rem 1rem 1rem 0;
  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.facility-chart {
  width: 100%;
  height: 200px;
  background-color: #fff;
  padding: 1rem;
  border-radius: $radius;
  margin-top: 1rem;
}

.facility-info {
  margin: 1rem 0;
  font-size: 0.9em;

  h4 {
    font-weight: 700;
    font-size: 1.2em;
    @include redacted(inline);
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5rem;

    li {
      @include redacted(list-item);
      margin-bottom: 2px;
    }
  }

  .info {
    margin-top: 1rem;
  }
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
