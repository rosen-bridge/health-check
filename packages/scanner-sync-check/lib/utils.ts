/**
 * convert time frame (seconds) to human readable format
 * @param time
 * @returns human readable string
 */
const convertTime = (time: number): string => {
  let convertedTime = '';
  if (time >= 60) {
    convertedTime = `${Math.floor(time / 60)} hour`;
    convertedTime +=
      Math.floor(time % 60) > 0 ? ` and ${Math.floor(time % 60)} minutes` : '';
  } else convertedTime = `${Math.floor(time)} minutes`;
  return convertedTime;
};
