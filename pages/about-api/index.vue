<template>
  <div class="container">
    <a 
      class="back-link" 
      @click="$router.go(-1)">&larr; back</a>

    <h1>
      <nuxt-link to="/">
        <app-logo class="logo" />
      </nuxt-link>
      About the OpenNEM API
    </h1>

    <section class="about-section intro-section">Getting an access token</section>

  </div>
</template>

<script>
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
  },

  head: {
    titleTemplate: 'About OpenNEM'
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container {
  padding: 1rem;

  a {
    border-bottom: 1px dashed $opennem-link-color;

    &:hover {
      border-bottom-style: solid;
    }
  }
}
.back-link {
  position: absolute;
  left: 4rem;
  top: 4rem;
}
h1 {
  text-align: center;
  font-size: 2rem;
  font-family: $header-font-family;
  font-weight: 700;
  margin: 2rem 0;

  .logo {
    width: 4.5rem;
    margin: 0 auto;
    display: block;
  }

  @include tablet {
    font-size: 2.5rem;
  }
}

.sponsors {
  .about-logos {
    width: 200px;
    display: block;
    margin: 0 auto 1rem;

    &.eca-logo {
      margin-top: 2rem;
    }
  }

  p {
    max-width: 300px;
    text-align: justify;
  }

  @include tablet {
    display: flex;

    .about-section {
      width: 50%;
      margin-top: 1rem;
    }
  }
}

.about-section {
  font-size: 0.9rem;
  text-align: center;

  &.intro-section {
    font-size: 1.2rem;
    border-bottom: 1px solid #ddd;
  }

  p {
    margin: 2rem auto;
  }

  p.credits {
    font-size: 0.8em;
    font-weight: 600;
    a {
      margin-left: 2px;
    }
  }
}

.social-links {
  a {
    border-bottom: 0;
    color: #aaa;
    font-size: 1.5rem;
    margin: 0 0.5rem;

    &:hover {
      color: #333;
    }
  }
}

.dev-links {
  a {
    border-bottom: 0;
    color: #aaa;
    font-size: 1.5rem;
    margin: 0 0.5rem;

    &:hover {
      color: #333;
    }
  }
}
</style>
