<template>
  <summary>
    <p class="blank">Bayswater Power Station is a bituminous (black) coal-powered thermal power station with four 660 
    megawatts (890,000 hp) Tokyo Shibaura Electric (Japan) steam driven turbo alternators for a combined 
    capacity of 2,640 megawatts (3,540,000 hp). Commissioned between 1985 and 1986, the station is located 
    16 kilometres (10 mi) from Muswellbrook, and 28 km (17 mi) from Singleton in the Hunter Region of 
    New South Wales, Australia.</p>
    <p class="blank">Prior to September 2014 Bayswater Power Station was part of NSW Government power producer, 
    Macquarie Generation. Macquarie Generation was acquired by AGL Energy in September 2014.</p>
  </summary>
</template>

<style lang="scss" scoped>
// test styles
@mixin redacted($display) {
  color: #999;
  background-color: #999;
  display: $display;
}
.blank {
  @include redacted(inline);
}
//

summary {
  padding: 1rem 1rem 1rem 0;
  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
