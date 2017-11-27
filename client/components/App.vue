<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {}
</script>


<style>
/* @import url('https://fonts.googleapis.com/css?family=Raleway:700'); */
@import url("https://fonts.googleapis.com/css?family=Merriweather:300,400,700");

body {
  background: #ece9e6;
  /* font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif; */
  font-family: "Merriweather", serif;
}
select,
option {
  font-family: "Merriweather", serif;
}

h2 {
  font-weight: 700;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;
}

a[title="JavaScript charts"],
a[title="Interactive JavaScript maps"] {
  display: none !important;
}

#app {
  padding: 2rem;
}

/* loading icon */
.loader {
  font-size: 10px;
  margin: 50px auto;
  text-indent: -9999em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background: #000000;
  background: -moz-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -webkit-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -o-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -ms-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: linear-gradient(to right, #000000 10%, rgba(0, 0, 0, 0) 42%);
  position: relative;
  -webkit-animation: load3 0.5s infinite linear;
  animation: load3 0.5s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.loader:before {
  width: 50%;
  height: 50%;
  background: #000000;
  border-radius: 100% 0 0 0;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
}
.loader:after {
  background: #ece9e6;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  content: "";
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
@-webkit-keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
