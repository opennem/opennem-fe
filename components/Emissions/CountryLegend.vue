<template>
  <div class="country-legend">
    <div class="twitter-hashtag-button-wrapper">
      <a 
        :data-url="href"
        href="https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw" 
        class="twitter-hashtag-button" 
        data-size="large" 
        data-text="How they compare" 
        data-related="Opennem" 
        data-show-count="false">Tweet #opennem</a>
    </div>
    
    <div 
      v-on-clickaway="onClickAway" 
      v-show="showAddArea" 
      class="add-area">
      <label>Countries/areas</label>
      <input
        v-model="query"
        class="input" 
        type="text"
        placeholder="Type to filter countries"
        @focus="() => showList = true">
      
      <div 
        v-show="showList"
        class="area-code-list">
        <ol>
          <li 
            v-for="a in filteredAreaCodes" 
            :key="a.code">
            <button 
              @click="() => handleCodeClick(a.code)" 
              @keyup="(evt) => handleKeyup(evt, a.code)">
              {{ a.area }}
            </button>
          </li>
        </ol>
      </div>
      <button 
        v-show="showList" 
        class="close-list-btn button is-primary"
        @click="() => showList = false">Close</button>
    </div>

    <ul>
      <li
        v-for="(d, i) in domains"
        :key="i"
        :class="{
          'is-hidden-domain': isHidden(d.id)
        }"
        role="button"
        @click.exact="handleRowClick(d.id)"
        @click.shift.exact="handleRowShiftClick(d.id)">
        <div
          :style="{ backgroundColor: d.colour}"
          class="colour-square" />
        <span class="country-label">{{ d.label }}</span>

        <button
          v-show="domains.length > 1"
          class="remove-btn" 
          @click.stop="() => handleRemoveRow(d.id)">
          <i class="fal fa-times"/>
        </button>
      </li>
    </ul>

    <!-- <button 
      class="button is-small is-primary" 
      @click="() => showAddArea = true">Add more</button> -->

    
  </div>
</template>

<script>
import _includes from 'lodash.includes'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],

  props: {
    domains: {
      type: Array,
      default: () => []
    },
    hidden: {
      type: Array,
      default: () => []
    },
    areaCodes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      area: null,
      query: '',
      showAddArea: true,
      showList: false,
      href: null
    }
  },

  computed: {
    filteredAreaCodes() {
      const domains = this.domains.map(d => d.id)
      return this.areaCodes.filter(a => {
        return (
          !_includes(domains, a.code) &&
          a.area.toLowerCase().indexOf(this.query.toLowerCase().trim()) !== -1
        )
      })
    }
  },

  watch: {
    filteredAreaCodes(val) {
      // console.log(val.length)
    }
  },

  created() {
    console.log(this.areaCodes)
  },

  mounted() {
    console.log(this.$route, window.location)
    this.href = window.location.href
  },

  methods: {
    handleRowClick(row) {
      this.$emit('rowClick', row)
    },
    handleRowShiftClick(row) {
      this.$emit('rowShiftClick', row)
    },
    handleTotalClick() {
      this.$emit('totalClick')
    },
    handleTotalShiftClick() {
      this.$emit('totalShiftClick')
    },
    isHidden(id) {
      return _includes(this.hidden, id)
    },
    handleKeyup(evt, code) {
      const isEnterKey = evt.code === 'Enter'

      if (isEnterKey) {
        this.$emit('codeAdd', code)
      }
    },
    handleCodeClick(code) {
      this.$emit('codeAdd', code)
    },
    handleRemoveRow(code) {
      this.$emit('codeRemove', code)
    },
    onClickAway() {
      this.showList = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.country-legend {
  padding: 0 1rem;
}
.is-inactive {
  td {
    color: #aaa;
  }
}

.is-hidden-domain {
  .colour-square {
    background-color: white !important;
  }
  .unit-name {
    color: #aaa;
  }
}
.summary-list {
  @include mobile {
    font-size: 0.8em;
  }
}

.colour-square {
  min-width: 18px;
  min-height: 18px;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  border-radius: 4px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  @include mobile {
    min-width: 14px;
    min-height: 14px;
    width: 14px;
    height: 14px;
  }
}

.country-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

ul {
  margin: 0 auto;
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */

  li {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    font-size: 13px;
    position: relative;

    .remove-btn {
      display: none;
      position: absolute;
      right: 0;
      font-size: 14px;
      border: none;
      color: $opennem-primary;
      cursor: pointer;
    }

    &:hover {
      background-color: #eee;

      .remove-btn {
        display: block;
      }
    }

    span {
      white-space: nowrap;
      overflow: hidden;
    }
  }
}

.add-area {
  margin: 0 0 1rem 0.5rem;
  position: relative;
  z-index: 999;

  label {
    font-weight: bold;
  }
}

.close-list-btn {
  width: 100%;
  position: absolute;
  margin-top: 335px;
  left: 0;
}
.area-code-list {
  position: absolute;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #eee;
  left: 0;
  right: 0;

  ol {
    list-style-type: none;
    margin: 0;
    padding: 0;

    li {
      padding: 0;
    }

    button {
      font-size: 12px;
      text-align: left;
      display: block;
      width: 100%;
      padding: 3px 6px;
      border: none;
      border-bottom: 1px solid #ccc;

      &:hover {
        background: white;
      }
    }
  }
}

.twitter-hashtag-button-wrapper {
  position: absolute;
  top: 2rem;
  right: 1rem;
  z-index: 999;

  @include mobile {
    top: 1rem;
  }
}
</style>
