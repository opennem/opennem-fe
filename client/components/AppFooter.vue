<template>
  <footer>
    <div style="margin-bottom: 2rem;">
      
      <small>Sources:</small>
      <a href="https://www.aemo.com.au/">AEMO</a>,
      <a href="http://www.bom.gov.au/">BOM</a>
      
    </div>

    <div style="text-align: left;">
      <div style="font-size: 1.2em;">OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></div>
        
      <!-- <div style="margin: 1rem 0;"><small>Contact</small><br><a href="https://twitter.com/OpenNem">@OpenNEM</a></div> -->

      <!-- Begin MailChimp Signup Form -->
      <div id="mc_embed_signup">
        <form action="https://opennem.us17.list-manage.com/subscribe/post?u=03d0b7fbc9f8d54c06a410737&amp;id=434dc3a3fb" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
          <div id="mc_embed_signup_scroll">
            <label for=""><small>Mailing List</small></label>
            <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="Email" required>
            <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
            <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_03d0b7fbc9f8d54c06a410737_434dc3a3fb" tabindex="-1" value=""></div>
            <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">
          </div>
        </form>
      </div>
    </div>

    
  </footer>
</template>

<script>
export default {};
</script>

<style scoped>
footer {
  border-top: 1px solid rgba(199, 69, 35, 0.4);
  /* background: rgba(199, 69, 35, 0.05); */
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

#mc_embed_signup {
  margin: 2rem 0 1rem;
  small {
    display: block;
    margin-bottom: 3px;
  }
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
  footer {
    padding: 1.5rem 1rem;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
  }
}
</style>

