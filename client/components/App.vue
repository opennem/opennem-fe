<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:700');

body {
  background-color: #fcfcfc;
  font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif;
}

h2 {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;
}

#app {
  margin: 2rem;
}

$break-small: 320px;
$break-large: 1024px;

@mixin respond-to($media) {
  @if $media == handhelds {
    @media only screen and (max-width: $break-small) { @content; }
  }
  @else if $media == medium-screens {
    @media only screen and (min-width: $break-small + 1) and (max-width: $break-large - 1) { @content; }
  }
  @else if $media == wide-screens {
    @media only screen and (min-width: $break-large) { @content; }
  }
}

</style>
