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

    <!-- Begin MailChimp Signup Form -->
    <div id="mc_embed_signup">
      <small>Mailing List</small>
      <form action="https://opennem.us17.list-manage.com/subscribe/post?u=03d0b7fbc9f8d54c06a410737&amp;id=434dc3a3fb" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
        <div id="mc_embed_signup_scroll">
          <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>
          <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_03d0b7fbc9f8d54c06a410737_434dc3a3fb" tabindex="-1" value=""></div>
          <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">
        </div>
      </form>
    </div>
  </footer>
</template>

<script>
export default {};
</script>

<style scoped>
footer {
  border-top: 1px solid rgba(199, 69, 35, 0.4);
  background: rgba(199, 69, 35, 0.05);
  font-size: 0.8em;
  margin: 4rem 0 0;
  padding: 1.5rem 2rem;
}
p {
  margin-bottom: 1.5rem;
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

#mc_embed_signup {
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
    padding: 1.5rem 5rem;
  }
}
</style>

