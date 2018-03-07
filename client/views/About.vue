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
        <a href="https://twitter.com/simonahac" title="Simon's twitter page" rel="external">Simon Holmes á Court</a> and
        <a href="https://twitter .com/chienleng" title="Steven's twitter page" rel="external">Steven Tan</a></p>
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
  margin-bottom: 2rem;
  font-weight: 200;
  color: #3a3a3a;
}
.article {
  padding: 0 2rem;
}

section {
  font-size: 0.9rem;
  line-height: 1.6rem;
  color: #3a3a3a;

  strong {
    color: #000;
  }
}

p.credits {
  font-size: 0.85em; 
  border-top: 1px dashed #bbb; 
  margin-top: 1.7rem; 
  padding-top: 1.7rem;
}

@media only screen and (min-width: 960px) {
.article {
  padding: 0 5rem;
}
}
</style>

