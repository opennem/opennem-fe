export const ChartConfig = {
  title: {
    show: false
  },
  color: [],
  textStyle: {
    fontFamily: '-apple-system, BlinkMacSystemFont, helvetica, arial, sans-serif'
  },
  animation: false,
  tooltip: {
    show: true,
    trigger: 'axis',
    axisPointer: {
      animation: false,
    },
    formatter: null
  },
  legend: {
    show: false,
    data: []
  },
  toolbox: {
    top: 0,
    right: 20,
    feature: {
      restore: {
        show: true,
        title: 'Reset'
      },
      saveAsImage: {
        show: true,
        title: 'Download PNG'
      }
    }
  },
  dataZoom: [{
    type: 'inside',
    show: true,
    realtime: true,
    start: 0,
    end: 100,
    xAxisIndex: [0, 1]
  }],
  grid: [{
    top: 30,
    left: 60,
    right: 26,
    height: '47%'
  }, {
    left: 60,
    right: 26,
    top: '60%',
    height: '38%'
  }],
  axisPointer: {
    link: {
      xAxisIndex: 'all'
    }
  },
  xAxis: [{
    show: false,
    type: 'category',
    boundaryGap: false,
    axisPointer: {
      show: true,
      label: {
        show: true,
        padding: [8, 10],
        margin: 10
      }
    },
    axisLine: {
      onZero: true
    },
    data: []
  }, {
    show: false,
    gridIndex: 1,
    type: 'category',
    offset: 20,
    boundaryGap: false,
    data: [],
    axisLine: {
      onZero: true,
      lineStyle: {
        color: '#000'
      }
    },
    position: 'top'
  }],
  yAxis: [{
    type: 'value',
    axisLine: {
      lineStyle: {
        color: '#ababab'
      }
    },
    splitLine: {
      lineStyle: {
        color: ['#ddd'],
        type: 'dashed'
      }
    }
  }, {
    gridIndex: 1,
    type: 'log',
    logBase: 300,
    max: 15000,
    axisLine: {
      lineStyle: {
        color: '#ababab'
      }
    },
    splitLine: {
      lineStyle: {
        color: ['#ddd'],
        type: 'dashed'
      }
    }
  }],
  series: []
}