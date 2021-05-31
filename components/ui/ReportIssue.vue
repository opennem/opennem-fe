<template>
  <DraggableDiv class="floating-palette">
    <template slot="header">
      <header>
        <i class="fal fa-fw fa-comment-alt-exclamation"/>
        Report an Issue
      </header>
    </template>
    <template slot="main">
      <main v-if="submitted">
        <h5>Your report has been submitted. <br> Thank you.</h5>
      </main>
      <main v-else>
        <label>Affected fields <em>(optional)</em></label>
        <p
          v-if="selectedFields.length === 0"
          class="placeholder">
          Click/tap on highlighted fields
        </p>
        <div
          v-else
          class="tags">
          <span 
            v-for="(field, index) in selectedFields" 
            :key="index"
            class="tag is-primary">
            {{ field.key }}
            <button
              class="delete is-small"
              @click="() => handleRemoveField(field)"/>
          </span>
        </div>

        <label>
          Sources
          <em v-if="triedSubmitting && !validSources">* (required)</em>
        </label>
        <textarea 
          v-model="sources"
          :class="{ 'has-error': triedSubmitting && !validSources }"
          class="textarea source-input" 
          placeholder="One source per line"/>
        
        <label>
          Describe
          <em v-if="triedSubmitting && !validDescription">* (required)</em>
        </label>
        <textarea 
          v-model="description"
          :class="{ 'has-error': triedSubmitting && !validDescription }"
          class="textarea" />

        <label>Your email <em>(optional)</em>)</label>
        <input
          v-model="email"
          type="email" 
          class="input">

        <p class="help">* for following up purposes</p>
      </main>
    </template>
    <template slot="footer">
      <footer v-if="submitted">
        <button
          class="button is-light"
          @click="handleDone">
          Done
        </button>
      </footer>
      
      <footer v-else>
        <button
          class="button is-light"
          @click="handleDone">
          Cancel
        </button>
        <button
          :disabled="!validSubmission"
          class="button is-dark is-disabled"
          @click="handleReportIssueSubmit">
          Report
        </button>
      </footer>
    </template>
  </DraggableDiv>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { lsGet, lsSet } from '@/services/LocalStorage'
import DraggableDiv from './DraggableContainer'

export default {
  components: {
    DraggableDiv
  },

  props: {
    name: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      sources: '',
      description: '',
      email: '',
      triedSubmitting: false,
      submitted: false
    }
  },

  computed: {
    ...mapGetters({
      selectedFields: 'feedback/selectedFields'
    }),
    validSources() {
      return this.sources.trim() !== ''
    },
    validDescription() {
      return this.description.trim() !== ''
    },
    validSubmission() {
      return this.validSources && this.validDescription
    }
  },

  mounted() {
    this.submitted = false
    this.email = lsGet('feedbackEmail') || ''
  },

  methods: {
    ...mapActions({
      removeIssueField: 'feedback/removeIssueField',
      clearIssueFields: 'feedback/clearIssueFields',
      submitFeedback: 'feedback/submit'
    }),
    ...mapMutations({
      setShowFields: 'feedback/showFields'
    }),
    handleRemoveField(field) {
      this.removeIssueField(field)
    },
    handleDone() {
      this.clearIssueFields()
      this.setShowFields(false)
    },
    handleReportIssueSubmit() {
      this.triedSubmitting = true
      if (this.validSubmission) {
        const description = this.getDescription()
        const payload = {
          subject: `${this.name} facility feedback`,
          description: description,
          email: this.email
        }

        this.submitFeedback(payload)
        this.submitted = true
        lsSet('feedbackEmail', this.email)
      } else {
        console.log('invalid')
      }
    },

    getDescription() {
      return `
**Path:**
${this.path}

**Sources:**
${this.sources}

**Fields:**
${JSON.stringify(this.selectedFields, null, 1)}

**Description:**
${this.description}
`
    }
  }
}
</script>

<style lang="scss" scoped>
.floating-palette {
  width: 300px;
  background-color: #fff;
  z-index: 9999;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  top: 30vh;
  left: calc(50vw - 150px);

  header {
    background-color: #eee;
    cursor: move;
    padding: 10px;
    border-radius: 6px 6px 0 0;
    font-weight: 700;
    font-family: 'Playfair Display', Georgia, 'Times New Roman', Times, serif;
    font-size: 16px;

    i.fal {
      position: relative;
      top: 1px;
    }
  }
  main {
    padding: 10px;
  }
  h5 {
    font-size: 1.2em;
    font-weight: 700;
    text-align: center;
    padding: 3rem 0;
  }
  footer {
    display: flex;
    padding: 10px;
    gap: 5px;
    button {
      width: 100%;
    }
  }
  label {
    display: block;
    font-weight: 700;
    font-family: 'Playfair Display', Georgia, 'Times New Roman', Times, serif;
    margin-top: 1rem;
    font-size: 0.9em;

    &:first-child {
      margin-top: 0;
    }
  }
  .placeholder {
    color: #cbcbcb;
    font-size: 0.9em;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #dbdbdb;
  }
  .tags {
    padding: 0.5rem 0.5rem 0;
    border-radius: 4px;
    border: 1px solid #dbdbdb;
  }
  textarea {
    width: 100%;

    &.source-input {
      min-height: 5em;
    }
  }
  .has-error {
    border-color: #e34a33 !important;
  }
}
</style>
