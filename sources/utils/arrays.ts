export function range(start: number, stop: number) {
  const length = stop - start;
  const result = new Array<number>(length);

  for (let i = 0, j = start; i < length; i++, j++)
    result[i] = j;

  return result;
}

export function pluck<T, K extends keyof T>(array: Array<T>, key: K) {
  return array.map(val => {
    return val[key];
  });
}
