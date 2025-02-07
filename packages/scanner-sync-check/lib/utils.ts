/**
 * create the plural form based on the value and measure
 * @param measure
 * @param value
 * @returns human readable plural form
 */
const PluralForm = (measure: string, value: number) => {
  return value > 0 ? `${value} ${measure}` + (value > 1 ? 's' : '') : '';
};

/**
 * convert time frame (seconds) to human readable format
 * @param time in seconds
 * @returns human readable elapsed time
 */
export const ConvertTime = (time: number): string => {
  if (time < 60) {
    return PluralForm('second', Math.floor(time));
  }
  let minute = Math.floor(time / 60);
  let convertedTime = '';
  if (minute >= 60) {
    const hour = Math.floor(minute / 60);
    convertedTime = PluralForm('hour', hour);
    minute = Math.floor(minute % 60);
    convertedTime += minute > 0 ? ' and ' : '';
  }
  convertedTime += PluralForm('minute', minute);
  return convertedTime;
};
