<template>
  <div class="not-found-wrapper">
    <div class="not-found-image">
      <img class="not-found-logo" src="../assets/opennem-logo-notfound.svg" alt="Not Found">
    </div>
    <p class="not-found-text">
      Oops... looks like there is nothing here.<br>
      <a href="/">&larr; Home</a>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import "../styles/variables.scss";

.not-found-wrapper {
  text-align: center;
}
.not-found-image {
  background: $not-found-bg-alpha;
  height: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    align-self: flex-end;
    position: relative;
    top: 2.8rem;
    left: 0rem;
  }
}
.not-found-logo {
  height: 10rem;
}
.not-found-text {
  margin-top: 4rem;
  font-weight: 600;
  font-size: 1.5rem;

  a {
    font-size: 0.8em;
  }
}
</style>

