<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
/* @import url('https://fonts.googleapis.com/css?family=Raleway:700'); */
@import url('https://fonts.googleapis.com/css?family=Merriweather:300,400,700');

body {
  /* fcfcfc */
  /* background-color: rgba(255, 236, 218, 0.74); */
  background: #ECE9E6;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #FFFFFF, #ECE9E6);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #FFFFFF, #ECE9E6); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  /* font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif; */
  font-family: 'Merriweather', serif;
}
select, option {
  font-family: 'Merriweather', serif;
}

h2 {
  font-weight: 700;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;
}

#app {
  margin: 2rem;
}
</style>
