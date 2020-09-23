<template>
  <section class="facility-info">
    <h3>Facility information</h3>

    <div class="info">
      <h4 class="info-title">Boilers</h4>
      <ul>
        <li>Steam pressure: 16,550 kilopascals (2,400 psi)</li>
        <li>Steam temperature: 540 °C (1,004 °F)</li>
        <li>Height: 80 metres (260 ft)</li>
      </ul>
    </div>

    <div class="info">
      <h4 class="info-title">Turbo alternators</h4>
      <ul>
        <li>Number in use: 4</li>
        <li>Manufacturer: Tokyo Shibaura Electric Company, (Toshiba) Limited, Japan.</li>
        <li>Operating speed 3,000 rpm</li>
        <li>Alternator voltage: 23 kV</li>
        <li>Rating: 660 megawatts (890,000 hp)</li>
        <li>Length: 50 metres (160 ft)</li>
        <li>Weight: 1,342 metric tons (1,479 short tons)</li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// test styles
@mixin redacted($display) {
  color: #999;
  background-color: #999;
  display: $display;
}
//
.facility-info {
  margin: 1rem 0;
  font-size: 0.9em;

  h4 {
    font-weight: 700;
    font-size: 1.2em;
    @include redacted(inline);
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5rem;

    li {
      @include redacted(list-item);
      margin-bottom: 2px;
    }
  }

  .info {
    margin-top: 1rem;
  }
}
</style>
