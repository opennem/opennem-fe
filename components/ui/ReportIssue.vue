<template>
  <DraggableDiv class="floating-palette">
    <template slot="header">
      <header>
        <i class="fal fa-fw fa-comment-alt-exclamation"/>
        Report an Issue
      </header>
    </template>
    <template slot="main">
      <main>
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

        <label>Sources (Web address or report name)</label>
        <textarea 
          v-model="sources"
          class="textarea source-input" 
          placeholder="One source per line"/>
        
        <label>Describe</label>
        <textarea 
          v-model="description" 
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
      <footer>
        <button
          class="button is-light"
          @click="handleReportIssueCancel">
          Cancel
        </button>
        <button
          class="button is-dark"
          @click="handleReportIssueSubmit">
          Report
        </button>
      </footer>
    </template>
  </DraggableDiv>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import DraggableDiv from './DraggableContainer'

export default {
  components: {
    DraggableDiv
  },

  props: {
    path: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      sources: '',
      description: '',
      email: ''
    }
  },

  computed: {
    ...mapGetters({
      selectedFields: 'feedback/selectedFields'
    })
  },

  methods: {
    ...mapActions({
      removeIssueField: 'feedback/removeIssueField',
      clearIssueFields: 'feedback/clearIssueFields'
    }),
    ...mapMutations({
      setShowFields: 'feedback/showFields'
    }),
    handleRemoveField(field) {
      this.removeIssueField(field)
    },
    handleReportIssueCancel() {
      this.clearIssueFields()
      this.setShowFields(false)
    },
    handleReportIssueSubmit() {
      const description = `
Path:
${this.path}

Sources:
${this.sources}

Fields:
${this.selectedFields}

Description:
${this.description}
      `

      const payload = {
        subject: '',
        description: description,
        email: this.email
      }

      console.log(payload)

      this.clearIssueFields()
      this.setShowFields(false)
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
  footer {
    display: flex;
    padding: 10px;
    gap: 5px;
    button {
      width: 50%;
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
}
</style>
