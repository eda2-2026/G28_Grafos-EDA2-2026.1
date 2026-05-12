export type ComparisonFunction<T> = (a: T, b: T) => number;

export function quickSort<T>(
  arr: T[],
  compareFn: ComparisonFunction<T>,
  left = 0,
  right = arr.length - 1
): T[] {
  const copy = [...arr];

  const partition = (low: number, high: number): number => {
    const pivot = copy[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (compareFn(copy[j], pivot) < 0) {
        i++;
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
    }

    [copy[i + 1], copy[high]] = [copy[high], copy[i + 1]];
    return i + 1;
  };

  const sort = (low: number, high: number): void => {
    if (low < high) {
      const pivotIndex = partition(low, high);
      sort(low, pivotIndex - 1);
      sort(pivotIndex + 1, high);
    }
  };

  sort(left, right);
  return copy;
}

export function mergeSort<T>(arr: T[], compareFn: ComparisonFunction<T>): T[] {
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
}

function merge<T>(left: T[], right: T[], compareFn: ComparisonFunction<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}

export function insertionSort<T>(
  arr: T[],
  compareFn: ComparisonFunction<T>
): T[] {
  const copy = [...arr];

  for (let i = 1; i < copy.length; i++) {
    const current = copy[i];
    let j = i - 1;

    while (j >= 0 && compareFn(copy[j], current) > 0) {
      copy[j + 1] = copy[j];
      j--;
    }

    copy[j + 1] = current;
  }

  return copy;
}

export function radixSort(arr: number[], ascending = true): number[] {
  if (arr.length <= 1) return [...arr];

  const positives = arr.filter((num) => num >= 0);
  const negatives = arr.filter((num) => num < 0).map((num) => Math.abs(num));

  const sortedPositives = radixSortPositiveNumbers(positives);
  const sortedNegatives = radixSortPositiveNumbers(negatives)
    .reverse()
    .map((num) => -num);

  const result = [...sortedNegatives, ...sortedPositives];
  return ascending ? result : result.reverse();
}

function radixSortPositiveNumbers(arr: number[]): number[] {
  if (arr.length <= 1) return [...arr];

  let result = [...arr];
  const max = Math.max(...result);
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    result = countingSortByDigit(result, exp);
    exp *= 10;
  }

  return result;
}

function countingSortByDigit(arr: number[], exp: number): number[] {
  const output = new Array<number>(arr.length);
  const count = new Array(10).fill(0);

  for (const num of arr) {
    const digit = Math.floor(num / exp) % 10;
    count[digit]++;
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }

  return output;
}