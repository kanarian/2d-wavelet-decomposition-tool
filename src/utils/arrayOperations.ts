// apply log
export function loge(arr: number[]): number[] {
  return arr.map((x) => Math.log(x + 1e-5));
}

export function abs(arr: number[]): number[] {
  return arr.map((x) => Math.abs(x));
}

export function loge2d(arr: number[][]): number[][] {
  return arr.map((x) => loge(x));
}

export function abs2d(arr: number[][]): number[][] {
  return arr.map((x) => abs(x));
}

export function scaleArray(
  values: number[],
  newMin: number,
  newMax: number
): number[] {
  const { min: oldMin, max: oldMax } = getMinMax(values);
  const oldRange = oldMax - oldMin;
  const newRange = newMax - newMin;

  return values.map((value) => {
    const scaledValue = ((value - oldMin) * newRange) / oldRange + newMin;
    return scaledValue;
  });
}

function getMinMax(array: number[]): { min: number; max: number } {
  if (array.length === 0) {
    throw new Error("Array is empty");
  }

  return array.reduce(
    (acc, curr) => {
      return {
        min: Math.min(acc.min, curr),
        max: Math.max(acc.max, curr),
      };
    },
    { min: array[0], max: array[0] }
  );
}
