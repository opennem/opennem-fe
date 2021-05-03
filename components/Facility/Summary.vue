<template>
  <summary>
    <div class="summary-wrapper">
      <div 
        class="description" 
        v-html="description"/>
      
      <v-popover
        v-if="hasLink"
        class="wiki-link-text"
        placement="auto">
        <i class="fal fa-info-circle"/>

        <template slot="popover">
          <span v-if="hasWikiLink">
            Copied content from <a
              :href="link"
              class="wiki-link"
              target="facility-wiki-link">
              Wikipedia
              <i class="fal fa-external-link"/>
            </a>; see that page's history for attribution.
          </span>
          <span v-if="hasWebsiteLink">
            Copied content from <a
              :href="link"
              class="wiki-link"
              target="facility-wiki-link">
              website
              <i class="fal fa-external-link"/>
            </a>; see that page for attribution.
          </span>
          
        </template>
      </v-popover>
    </div>

  </summary>
</template>

<script>
export default {
  props: {
    description: {
      type: String,
      default: ''
    },
    linkObject: {
      type: Object,
      default: null
    }
  },
  computed: {
    hasLink() {
      return this.linkObject
    },
    link() {
      return this.hasLink ? this.linkObject.url : ''
    },
    hasWikiLink() {
      return this.hasLink && this.linkObject.type === 'wikipedia'
    },
    hasWebsiteLink() {
      return this.hasLink && this.linkObject.type === 'website'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

summary {
  margin-bottom: 2rem;
  line-height: 1.45em;
  font-size: 1em;
  padding: 1rem $facility-tablet-padding;
  // background: #fdfdfd;
  border-radius: 6px;

  @include mobile {
    padding: 1rem $facility-mobile-padding;
    font-size: 0.9em;
    margin-bottom: 0;
  }

  @include tablet {
    padding: 0 0 1rem;
  }

  .description {
    display: inline;
  }

  .summary-wrapper {
    margin-bottom: 1rem;
    font-size: 16px;
    line-height: 25px;
    padding: 2px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .wiki-link-text {
    display: inline-block;
    font-size: 0.8em;
  }
}
</style>
