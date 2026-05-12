export type CompareFn<T> = (a: T, b: T) => number;

    export function mergeSort<T>(arr: T[], compareFn: CompareFn<T>): T[] {
    if (arr.length <= 1) return [...arr];

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), compareFn);
    const right = mergeSort(arr.slice(mid), compareFn);

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

    export function insertionSort<T>(arr: T[], compareFn: CompareFn<T>): T[] {
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