<template>
  <footer>
    <div style="margin-bottom: 2rem;">
      
      <span>Sources:</span>
      <a href="https://www.aemo.com.au/">AEMO</a>,
      <a href="http://www.bom.gov.au/">BoM</a>
      
    </div>

    <div style="text-align: left;">
      <div>OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></div>
        
      <!-- <div style="margin: 1rem 0;"><small>Contact</small><br><a href="https://twitter.com/OpenNem">@OpenNEM</a></div> -->
    </div>
  </footer>
</template>

<script>
export default {};
</script>

<style scoped>
footer {
  /* border-top: 1px dashed rgba(199, 69, 35, 0.6); */
  /* background: rgba(199, 69, 35, 0.05); */
  border-top: 1px solid rgba(3,3,3, 0.1);
  font-size: 0.8em;
  margin: 4rem 0 0;
  padding: 1.5rem 2rem;
  color: #666;
}
small {
  /* font-style: italic; */
  font-weight: 600;
}

a {
  font-style: normal;
  font-weight: 600;
}



@media only screen and (min-width: 960px) {
  footer {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
  }
}
</style>

