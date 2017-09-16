<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
/*TODO: import these from node modules*/
@import "//cdn.rawgit.com/necolas/normalize.css/master/normalize.css";
@import "//cdn.rawgit.com/milligram/milligram/master/dist/milligram.min.css";

#app {
  margin: 3rem 0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont,
               'avenir next', avenir,
               helvetica, 'helvetica neue',
               Ubuntu,
               'segoe ui', arial,
               sans-serif;
}
</style>
