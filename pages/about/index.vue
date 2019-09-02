<template>
  <div class="container">
    <a
      class="back-link"
      @click="$router.go(-1)">&larr; back</a>

    <h1>
      <app-logo class="logo" />
      An Open Platform for National Electricity Market Data
    </h1>

    <section class="about-section intro-section">
      <p>
        The
        <strong>OpenNEM project</strong> aims to make the wealth of public
        <strong>National Electricity Market</strong> (NEM)
        data more accessible to a wider audience.
      </p>
      <p>
        We hope that improved access will facilitate
        <strong>better public understanding of the market</strong>,
        <strong>improve energy literacy</strong> and help facilitate a more
        <strong>informed national discussion</strong> on Australia’s
        energy transition in the long term interests of consumers.
      </p>
      <p>
        By providing a
        <strong>clear</strong> window on the data, we hope to address the information asymmetry between
        stakeholders and improve the productivity of those engaged in energy market discussions.
      </p>

      <p class="credits">
        By
        <a
          href="https://twitter.com/dylanjmcconnell"
          title="Dylan's twitter page"
          rel="external"
        >Dylan McConnell</a>,
        <a
          href="https://twitter.com/simonahac"
          title="Simon's twitter page"
          rel="external"
        >Simon Holmes à Court</a> and
        <a
          href="https://twitter.com/chienleng"
          title="Steven's twitter page"
          rel="external"
        >Steven Tan</a>
      </p>
    </section>

    <div class="sponsors">
      <section class="about-section eca-section">
        <img
          class="about-logos eca-logo"
          src="~/assets/img/eca_logo.png"
          alt="Energy Consumers Australia's logo">
        <p>
          This project was co-funded by
          <a
            href="http://energyconsumersaustralia.com.au/"
            rel="external"
          >Energy Consumers Australia</a>
          as part of its grants process for consumer advocacy projects and research projects for the
          benefit of consumers of electricity and natural gas.
        </p>
      </section>

      <section class="about-section eth-section">
        <img
          class="about-logos eth-logo"
          src="~/assets/img/eth-logo.png"
          alt="Energy Transition Hub's logo">
        <p>
          This project is part of the University of Melbourne’s
          <a
            href="http://climatecollege.unimelb.edu.au/"
            rel="external">Climate and Energy College</a>
          “Live-Emission tracker” project under the
          <a
            href="http://www.energy-transition-hub.org/"
            rel="external">Energy Transition Hub</a>.
        </p>
      </section>
    </div>

    <section
      class="about-section"
      style="border-top: 1px solid #ddd; padding-top: 1.5rem; display: flex; justify-content: space-between;"
    >
      <div class="social-links">
        <a
          class="icon-link"
          title="OpenNEM's twitter page"
          rel="external"
          href="https://twitter.com/opennem"
        >
          <i class="fab fa-lg fa-twitter" />
        </a>
        <a
          class="icon-link"
          title="OpenNEM's github page"
          rel="external"
          href="https://github.com/opennem"
        >
          <i class="fab fa-lg fa-github" />
        </a>
      </div>

      <div>
        <form
          id="mc-embedded-subscribe-form"
          style="white-space: nowrap;"
          action="https://opennem.us17.list-manage.com/subscribe/post?u=03d0b7fbc9f8d54c06a410737&amp;id=434dc3a3fb"
          method="post"
          name="mc-embedded-subscribe-form"
          class="validate"
          target="_blank"
          novalidate
        >
          <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div
            style="position: absolute; left: -5000px;"
            aria-hidden="true">
            <input
              type="text"
              name="b_03d0b7fbc9f8d54c06a410737_434dc3a3fb"
              tabindex="-1"
              value>
          </div>
          <div class="field has-addons">
            <div class="control">
              <input
                id="mce-EMAIL"
                type="email"
                value
                name="EMAIL"
                class="email input"
                placeholder="your email"
                required
              >
            </div>
            <div class="control">
              <input
                id="mc-embedded-subscribe"
                type="submit"
                value="join"
                name="subscribe"
                class="button"
              >
            </div>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
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
</style>
