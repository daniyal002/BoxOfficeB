export const findMinValue = (arr: any[], key: string) => {
  return arr.reduce((min, obj) => (obj[key] < min ? obj[key] : min), Infinity);
};