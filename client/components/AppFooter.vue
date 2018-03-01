<template>
  <footer>
    <p style="font-size: 1.2em;">OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></p>

    <p><small>Data Sources</small><br>
      <a href="https://www.aemo.com.au/">Australian Energy Market Operator</a><br>
      <a href="http://www.bom.gov.au/">Bureau of Meteorology</a>
    </p>

    <p><small>Contact</small><br>
      <a href="https://twitter.com/OpenNem">@OpenNEM</a><br>
    </p>
  </footer>
</template>

<script>
export default {}
</script>

<style scoped>
footer {
  border-top: 1px solid rgba(199,69,35,0.4);
  background: rgba(199,69,35,0.05);
  font-size: 0.8em;
  margin: 4rem 0 0;
  padding: 1.5rem 2rem;
}
p {
  line-height: 1.2rem;

  small {
    /* font-style: italic; */
    font-weight: 400;
  }

  a {
    font-style: normal;
    font-weight: 600;
  }
}

@media only screen and (min-width: 960px) {
footer {
  padding: 1.5rem 5rem;
}
}
</style>

