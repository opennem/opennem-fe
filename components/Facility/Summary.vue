<template>
  <summary>
    <p>{{ description }}</p>
    <p v-if="hasWikiLink">
      <a
        :href="wikiLink"
        class="wiki-link" 
        target="facility-wiki-link">
        Wikipedia
        <i class="fal fa-external-link"/>
      </a>
    </p>
  </summary>
</template>

<script>
export default {
  props: {
    description: {
      type: String,
      default: ''
    },
    wikiLink: {
      type: String,
      default: ''
    }
  },
  computed: {
    hasWikiLink() {
      return this.wikiLink && this.wikiLink !== ''
    }
  }
}
</script>

<style lang="scss" scoped>
summary {
  margin-bottom: 1rem;
  line-height: 1.45em;
  font-size: 1.05em;
  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .wiki-link {
    font-size: 0.8em;
  }
}
</style>
