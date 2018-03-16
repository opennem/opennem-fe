<template>
  <div class="article">
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
          <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="your email" required>
          <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_03d0b7fbc9f8d54c06a410737_434dc3a3fb" tabindex="-1" value=""></div>
          <input type="submit" value="join" name="subscribe" id="mc-embedded-subscribe" class="button">
        </form>
      </div>
      
    </section>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
h1 {
  font-size: 1.7rem;
  line-height: 2.2rem;
  margin: 3rem 0 2rem;
  font-weight: 200;
  color: #3a3a3a;
}
h2 {
  font-size: 1.5rem;
  font-weight: 200;
  color: #3a3a3a;
  /* border-top: 1px dashed #bbb; */
  margin-top: 3rem;
  padding-top: 3rem;
}
.article {
  padding: 0 2rem;
}

section {
  font-size: 0.9rem;
  line-height: 1.6rem;
  color: #5a5a5a;

  strong {
    color: #000;
    font-size: 1.2em;
  }
}

p.credits {
  font-size: 0.85em; 
  margin-top: 1.7rem; 
}

#mce-EMAIL {
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 4px 0 0 4px;
}
#mc-embedded-subscribe {
  border: none;
  padding: 0.3rem 0.5rem;
  border-radius: 0 4px 4px 0;
  position: relative;
  left: -2px;

  &:hover {
    background-color: #eee;
  }
}

@media only screen and (min-width: 960px) {
.article {
  padding: 0 5rem;
}
}
</style>

