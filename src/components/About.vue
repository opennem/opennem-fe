<template>
  <div class="container">

    <p><a @click="$router.go(-1)">&larr; back</a></p>
    <h1>An Open Platform for National Electricity Market Data</h1>

    <section style="max-width: 700px;">
      <p>
        The <strong>OpenNEM project</strong> aims to make the wealth of public <strong>National Electricity Market</strong> (NEM) 
        data more accessible to a wider audience.</p> 
      <p>
        We hope that improved access will facilitate <strong>better public understanding of the market</strong>, 
        <strong>improve energy literacy</strong> and help facilitate a more <strong>informed national discussion</strong> on Australia’s 
        energy transition in the long term interests of consumers.
      </p>
      <p>
        By providing a <strong>clear</strong> window on the data, we hope to address the information asymmetry between 
        stakeholders and improve the productivity of those engaged in energy market discussions.
      </p>

      <p class="credits">
        By 
        <a href="https://twitter.com/dylanjmcconnell" title="Dylan's twitter page" rel="external">Dylan McConnell</a>, 
        <a href="https://twitter.com/simonahac" title="Simon's twitter page" rel="external">Simon Holmes à Court</a> and
        <a href="https://twitter.com/chienleng" title="Steven's twitter page" rel="external">Steven Tan</a>
      </p>
    </section>

    <h2>How to keep in touch</h2>
    <section>
      <div>Follow us on <a href="https://twitter.com/opennem" title="OpenNEM's twitter page" rel="external">@OpenNEM</a>. <br>
        We also send an occasional email:
        <form style="display: inline; margin-left: 5px; white-space: nowrap" action="https://opennem.us17.list-manage.com/subscribe/post?u=03d0b7fbc9f8d54c06a410737&amp;id=434dc3a3fb" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
          <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_03d0b7fbc9f8d54c06a410737_434dc3a3fb" tabindex="-1" value=""></div>
          <div class="field has-addons">
            <div class="control">
              <input type="email" value="" name="EMAIL" class="email input" id="mce-EMAIL" placeholder="your email" required>
            </div>
            <div class="control">
              <input type="submit" value="join" name="subscribe" id="mc-embedded-subscribe" class="button">
            </div>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import "../styles/variables.scss";
@import "../../node_modules/bulma/sass/utilities/mixins.sass";

.container {
  padding: 0 1rem;
}
a {
  border-bottom: 1px dashed;
}
h1 {
  font-family: $header-font-family;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.75rem 0;
  margin-top: 1rem;

  @include tablet {
    font-size: 2rem;
  }
}
h2 {
  font-family: $header-font-family;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 0.75rem 0;
  margin-top: 2rem;

  @include tablet {
    margin-top: 3rem;
    font-size: 2rem;
  }
}
p {
  padding: 0.75rem 0;

  &.credits {
    font-size: 0.9rem;
  }
}
</style>

