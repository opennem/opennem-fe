/**
 * Parse interval:
 * - years = y
 * - months = M
 * - weeks = w
 * - days = d
 * - hours = h
 * - minutes = m
 * - seconds = s
 */
const durationKeys = ['s', 'm', 'h', 'd', 'w', 'M', 'y'];

/**
 * returns {key, value}
 * if string contains only key, value is 1
 */
function parseInterval(string) {
  const length = string.length;
  const key = string.charAt(length - 1);
  const value = (length === 1) ? 1 : parseInt(string.substring(0, length - 1), 10);
  if (!_.includes(durationKeys, key)) {
    throw new Error(`Invalid duration key: ${key}`);
  }

  return {
    key,
    value,
  };
}

/**
 * compares 2 duration and returns the shorter one
  - use durationKey index - the smaller the index, the shorter the duration
 */
function compareAndGetShortestInterval(duration1, duration2, returnDuration) {
  const duration1Index = durationKeys.indexOf(duration1.key);
  const duration2Index = durationKeys.indexOf(duration2.key);
  const duration1Value = duration1.value;
  const duration2Value = duration2.value;

  if (duration1Index < duration2Index) {
    return returnDuration ? duration1 : true;
  } else if (duration2Index < duration1Index) {
    return returnDuration ? duration2 : false;
  }

  if (duration1Value < duration2Value) {
    return returnDuration ? duration1 : true;
  } else if (duration2Value < duration1Value) {
    return returnDuration ? duration2 : false;
  }

  // both durations are the same, return the first one
  return returnDuration ? duration1 : true;
}

