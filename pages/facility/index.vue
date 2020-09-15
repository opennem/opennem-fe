<template>
  <section class="facility">
    <div>
      <header>
        <h2>Bayswater Power Station</h2>
      </header>
      <summary>
        <p>Bayswater Power Station is a bituminous (black) coal-powered thermal power station with four 660 
        megawatts (890,000 hp) Tokyo Shibaura Electric (Japan) steam driven turbo alternators for a combined 
        capacity of 2,640 megawatts (3,540,000 hp). Commissioned between 1985 and 1986, the station is located 
        16 kilometres (10 mi) from Muswellbrook, and 28 km (17 mi) from Singleton in the Hunter Region of 
        New South Wales, Australia.</p>
        <p>Prior to September 2014 Bayswater Power Station was part of NSW Government power producer, 
        Macquarie Generation. Macquarie Generation was acquired by AGL Energy in September 2014.</p>
      </summary>
      <div class="facility-chart">
        7 day power
      </div>

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

        <div class="info">
          <h4 class="info-title">Turbine house</h4>
          <ul>
            <li>Length: 510 metres (1,670 ft)</li>
            <li>Height: 38 metres (125 ft)</li>
            <li>Width: 40 metres (130 ft)</li>
          </ul>
        </div>

        <div class="info">
          <h4 class="info-title">Emission stacks</h4>
          <ul>
            <li>Height: 248 metres (814 ft)</li>
            <li>Diameter at base: 23 metres (75 ft)</li>
            <li>Diameter at top: 12 metres (39 ft)</li>
          </ul>
        </div>

        <div class="info">
          <h4 class="info-title">Cooling towers</h4>
          <ul>
            <li>Height: 132 metres (433 ft)</li>
            <li>Diameter at base: 100 metres (330 ft)</li>
            <li>Diameter at top: 52 metres (171 ft)</li>
          </ul>
        </div>
      </section>
    </div>
    <aside>
      <section>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bayswater_Power_Station_with_coal.jpg/600px-Bayswater_Power_Station_with_coal.jpg" 
          alt="Bayswater Power Station with coal">
      </section>
      <section class="map">
        map
      </section>
      <section class="meta">
        <table>
          <tr>
            <th>Region</th>
            <td>New South Wales</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>Operating</td>
          </tr>
          <tr>
            <th>Commissioned date</th>
            <td>1 Jan 1985</td>
          </tr>
          <tr>
            <th>Owner</th>
            <td>AGL Energy</td>
          </tr>
          <tr>
            <th>Primary fuel</th>
            <td>Black Coal</td>
          </tr>
          <tr>
            <th>Units</th>
            <td>4</td>
          </tr>
          <tr>
            <th>Total capacity</th>
            <td>2,640 MW</td>
          </tr>
        </table>
      </section>
    </aside>
  </section>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$radius: 0.5rem;

.facility {
  display: flex;
  margin: 1rem;

  & > div {
    width: 70%;
    padding: 1rem;
  }
}

header {
  h2 {
    font-family: $header-font-family;
    font-size: 1.6em;
    font-weight: 700;
  }
}

summary {
  padding: 1rem 1rem 1rem 0;
  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.facility-chart {
  width: 100%;
  height: 200px;
  background-color: #fff;
  padding: 1rem;
  border-radius: $radius;
}

.facility-info {
  margin-top: 1rem;
  font-size: 0.9em;
  h3 {
    font-family: $header-font-family;
    font-size: 1.4em;
    border-bottom: 1px solid #666;
  }

  h4 {
    font-weight: 700;
    font-size: 1.2em;
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5rem;
  }

  .info {
    margin-top: 1rem;
  }
}

aside {
  width: 30%;
  margin-top: 1rem;

  img {
    border-radius: $radius;
  }

  .map {
    width: 100%;
    height: 150px;
    background-color: #fff;
    padding: 1rem;
    border-radius: $radius;
    margin: 0.5rem 0 1rem;
  }

  .meta {
    background-color: #fff;
    border-radius: $radius;
    padding: 1rem;
    font-size: 0.8em;

    table {
      width: 100%;
    }
    td,
    th {
      border-bottom: 1px solid #efefef;
    }
  }
}
</style>
