<template>
  <section class="card dark">
    <header>
      <h4>All properties</h4>
    </header>

    
    <table v-if="hasFacility">
      <tbody>
        <tr 
          v-for="d in keys" 
          :key="d">
          <th>{{ d }}</th>
          <td v-if="d === 'facilities'">

            <div 
              v-for="(f, i) in facility[d]" 
              :key="`facility-${i}`"
              class="unit-card card dim">
              <table>
                <caption>{{ f.code }}</caption>
                <tbody>
                  <tr 
                    v-for="k in getKeys(f)" 
                    :key="k"
                  >
                    <th>{{ k }}</th>
                    <td>{{ f[k] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
          <td v-else>{{ facility[d] }}</td>
        </tr>
      </tbody>
    </table>
    
  </section>
</template>

<script>
export default {
  props: {
    facility: {
      type: Object,
      default: () => null
    }
  },

  computed: {
    hasFacility() {
      return this.facility ? true : false
    },
    keys() {
      return this.hasFacility ? Object.keys(this.facility) : []
    }
  },

  methods: {
    getKeys(obj) {
      return Object.keys(obj)
    }
  }
}
</script>

<style lang="scss" scoped>
.unit-card {
  margin: 1rem;

  caption {
    text-align: left;
    font-size: 1.4em;
    display: inline-block;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
  }
}
</style>
