<template>
  <Draggable class="floating-palette">
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

      <main 
        v-if="isSubmitting" 
        style="margin: 75px 0;">
        <Loader class="submission-loader" />
      </main> 

      <main v-if="!isSubmitting && !submitted">
        <div
          v-if="hasSubmitError"
          class="notification is-danger">
          <p>There is an issue submitting the report.</p>
          <code>{{ submitErrorMsg }}</code>
        </div>

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
        <p 
          v-if="!validEmail && email.length > 5" 
          class="help is-danger">Please enter a valid email address</p>
        <input
          v-model="email"
          type="email" 
          class="input">
        
        <p class="help">* for following up purposes</p>
      </main>
    </template>
    <template slot="footer">
      <footer v-if="submitted && !isSubmitting">
        <button
          class="button is-light"
          @click="handleDone">
          Done
        </button>
      </footer>
      
      <footer v-if="!submitted && !isSubmitting">
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
  </Draggable>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { lsGet, lsSet } from '@/services/LocalStorage'
import Draggable from './DraggableContainer'
import Loader from '@/components/ui/Loader'

export default {
  components: {
    Draggable,
    Loader
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
      submitted: false,
      hasSubmitError: false,
      submitErrorMsg: '',
      isSubmitting: false
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
    validEmail() {
      return this.email.trim() === '' || this.checkEmail(this.email.trim())
    },
    validSubmission() {
      return this.validSources && this.validDescription && this.validEmail
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
      this.hasSubmitError = false
      if (this.validSubmission) {
        const description = this.getDescription()
        const payload = {
          subject: `${this.name} facility feedback`,
          description: description
        }

        if (this.email && this.email !== '') {
          payload.email = this.email
        }

        this.isSubmitting = true

        this.submitFeedback(payload)
          .then(r => {
            this.submitted = true
            this.isSubmitting = false
            lsSet('feedbackEmail', this.email)
          })
          .catch(error => {
            this.hasSubmitError = true
            this.isSubmitting = false
            if (error.response) {
              // Request made and server responded
              console.log(error.response.data)
              console.log(error.response.status)
              console.log(error.response.headers)
              const msg = error.response.data.detail
                ? error.response.data.detail[0].msg
                : JSON.stringify(error.response.data)
              this.submitErrorMsg = msg
            } else if (error.request) {
              // The request was made but no response was received
              console.log(error.request)
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message)
              this.submitErrorMsg = error.message
            }
          })
      } else {
        console.log('invalid')
      }
    },

    checkEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },

    getEmail() {
      if (this.email && this.email !== '') {
        return `
**Email:**
${this.email}     
   
`
      }
      return `
**No email provided.**
   
`
    },

    getDescription() {
      let desc = `
**Path:**
${this.path}

**Sources:**
${this.sources}

**Fields:**

\`\`\`
${JSON.stringify(this.selectedFields, null, 1)}
\`\`\`

**Description:**
${this.description}
`

      desc = this.getEmail() + desc

      return desc
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
  top: 15vh;
  right: 50px;

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
  .help.is-danger {
    font-weight: 700;
  }
  .notification.is-danger {
    background: #c74523;
    font-size: 0.9em;
    padding: 1rem;
  }
}
</style>
