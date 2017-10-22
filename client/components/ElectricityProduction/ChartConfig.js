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
    xAxisIndex: [0, 1, 2, 3]
  }],
  grid: [{
    top: 30,
    left: 60,
    right: 26,
    height: '42%'
  }, {
    left: 60,
    right: 26,
    top: '55%',
    height: '10%'
  }, {
    left: 60,
    right: 26,
    top: '65%',
    height: '26%'
  }, {
    left: 60,
    right: 26,
    top: '91%',
    height: '5%'
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
  }, {
    show: false,
    gridIndex: 2,
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
  }, {
    show: false,
    gridIndex: 3,
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
    axisTick: {
      show: false
    },
    axisLabel: {
      formatter: function(value, index) {
        return value
      }
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['#ddd'],
        type: 'dotted'
      }
    }
  }, {
    gridIndex: 1,
    type: 'log',
    min: 300,
    logBase: 300,
    max: 15000,
    axisLine: {
      lineStyle: {
        color: '#ddd'
      }
    },
    splitLine: {
      lineStyle: {
        color: ['#ddd'],
        type: 'dotted'
      }
    }
  }, {
    gridIndex: 2,
    type: 'value',
    min: -100,
    max: 300,
    axisLabel: {
      color: '#000'
    },
    axisTick: {
      show: true
    },
    axisLine: {
      lineStyle: {
        color: '#ababab'
      }
    },
    splitLine: {
      lineStyle: {
        color: ['#aaa'],
        type: 'dotted'
      }
    }
  }, {
    gridIndex: 3,
    type: 'log',
    logBase: 100,
    min: 100,
    max: 5000,
    inverse: true,
    splitNumber: 1,
    axisLine: {
      lineStyle: {
        color: '#ddd'
      }
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: ['#ddd'],
        type: 'dotted'
      }
    }
  }],
  series: []
}