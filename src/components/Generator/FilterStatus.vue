<template>
  <div class="dropdown" :class="{'is-active': dropdownActive}" v-on-clickaway="onClickAway">
    <button
      class="dropdown-trigger button is-rounded is-small is-primary"
      :class="{ 'is-inverted': selectedStatuses.length === 0 }"
      @click="dropdownActive = !dropdownActive"
    >
      <div class="dropdown-label">
        <span>Status:</span>
        <strong>({{ selectedStatuses.length }})</strong>
      </div>
      <font-awesome-icon class="fal" :icon="iconDown" />
    </button>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a
            v-for="(d, index) in statuses"
            :key="index"
            class="dropdown-item"
            @click="handleClick(d.id)"
          >
            <span class="status-checkbox">
              <font-awesome-icon v-if="isSelected(d.id)" class="checkmark-icon fal" :icon="iconCheckmark" />
            </span>
            {{d.label}}
          </a>

          <div class="buttons">
            <a class="button is-rounded is-small is-inverted" @click="clearSelected">Clear</a>
            <a class="button is-rounded is-small is-primary is-outlined" @click="dropdownActive = false">Close</a>
          </div>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown, faCheck } from '@fortawesome/fontawesome-pro-light';

const statuses = [
  {
    id: 'Commissioned',
    label: 'Operating',
  },
  {
    id: 'Decommissioned',
    label: 'Retired',
  },
];

export default {
  mixins: [clickaway],

  components: {
    FontAwesomeIcon,
  },

  props: {
    status: String,
  },

  data() {
    return {
      statuses,
      selectedStatus: '',
      selectedStatuses: [],
      dropdownActive: false,
    }
  },

  computed: {
    iconDown() {
      return faAngleDown;
    },
    iconCheckmark() {
      return faCheck;
    },
    selectedStatusLabel() {
      return this.statuses.find(s => s.id === this.status).label;
    },
  },

  watch: {
    status(newValue) {
      this.selectedStatus = newValue;
    },
  },

  mounted() {
    this.selectedStatus = this.status;
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    isSelected(status) {
      return _.includes(this.selectedStatuses, status);
    },
    handleClick(status) {
      const isIncluded = _.includes(this.selectedStatuses, status);
      if (isIncluded) {
        this.selectedStatuses = this.selectedStatuses.filter(d => d !== status);
      } else {
        this.selectedStatuses.push(status);
      }

      this.$emit('statusChanged', status);
      this.$emit('selectedStatuses', this.selectedStatuses);
    },
    clearSelected() {
      this.selectedStatuses = [];
      this.$emit('selectedStatuses', this.selectedStatuses);
    },
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.dropdown-label {
  margin-right: 0.5rem;
  strong {
    font-size: 11px;
    font-weight: 400;
  }
}
.dropdown-content {
  font-family: $primary-font-family;

  .dropdown-item {
    font-size: 12px;
  }
}
.status-checkbox {
  width: 15px;
  height: 15px;
  background-color: #fff;
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 0.4rem;
  position: relative;
  top: 1px;
  border: 1px solid #000;
  border-radius: 1px;

  .checkmark-icon {
    position: relative;
    left: 2px;
    bottom: 1px;
    color: #000;
  }
}

.buttons {
  border-top: 1px solid #eee;
  padding: 0.4rem 0.5rem 0.1rem;
  margin-top: 0.3rem;
  display: flex;
  justify-content: space-between;
  text-align: right;

  .button {
    font-size: 10px;
    margin-left: 0;
  }
}
</style>

