import { SortingAlgorithms } from './sorting.algorithms';

describe('SortingAlgorithms', () => {
    describe('quickSort', () => {
        it('deve ordenar números em ordem crescente', () => {
        const result = SortingAlgorithms.quickSort(
            [5, 2, 9, 1, 3],
            (a, b) => a - b,
        );

        expect(result).toEqual([1, 2, 3, 5, 9]);
        });

        it('deve ordenar strings em ordem alfabética', () => {
        const result = SortingAlgorithms.quickSort(
            ['Carlos', 'Ana', 'Bruna'],
            (a, b) => a.localeCompare(b),
        );

        expect(result).toEqual(['Ana', 'Bruna', 'Carlos']);
        });
    });

    describe('mergeSort', () => {
        it('deve ordenar datas da mais recente para a mais antiga', () => {
        const data = [
            { id: 1, data: '2025-07-09T12:29:56.111Z' },
            { id: 2, data: '2025-07-09T12:53:01.903Z' },
            { id: 3, data: '2025-07-10T17:10:04.692Z' },
        ];

        const result = SortingAlgorithms.mergeSort(
            data,
            (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        );

        expect(result.map((item) => item.id)).toEqual([3, 2, 1]);
        });

        it('deve manter estabilidade quando valores são iguais', () => {
        const data = [
            { id: 1, nota: 10 },
            { id: 2, nota: 10 },
            { id: 3, nota: 8 },
        ];

        const result = SortingAlgorithms.mergeSort(
            data,
            (a, b) => b.nota - a.nota,
        );

        expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
        });
    });

    describe('insertionSort', () => {
        it('deve ordenar listas pequenas de strings', () => {
        const result = SortingAlgorithms.insertionSort(
            ['Matemática', 'Algoritmos', 'Banco de Dados'],
            (a, b) => a.localeCompare(b),
        );

        expect(result).toEqual(['Algoritmos', 'Banco de Dados', 'Matemática']);
        });

        it('deve manter estabilidade em objetos com valores iguais', () => {
        const data = [
            { id: 1, nome: 'Ana' },
            { id: 2, nome: 'Ana' },
            { id: 3, nome: 'Bruna' },
        ];

        const result = SortingAlgorithms.insertionSort(
            data,
            (a, b) => a.nome.localeCompare(b.nome),
        );

        expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
        });
    });

    describe('radixSort', () => {
        it('deve ordenar números inteiros positivos', () => {
        const result = SortingAlgorithms.radixSort([
            170, 45, 75, 90, 802, 24, 2, 66,
        ]);

        expect(result).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
        });

        it('deve ordenar números inteiros em ordem decrescente', () => {
        const result = SortingAlgorithms.radixSort([10, 5, 30, 1], false);

        expect(result).toEqual([30, 10, 5, 1]);
        });

        it('deve ordenar números negativos e positivos', () => {
        const result = SortingAlgorithms.radixSort([5, -10, 3, -1, 0]);

        expect(result).toEqual([-10, -1, 0, 3, 5]);
        });
    });

    describe('edge cases', () => {
        it('deve lidar com array vazio', () => {
        expect(SortingAlgorithms.quickSort([], (a, b) => a - b)).toEqual([]);
        expect(SortingAlgorithms.mergeSort([], (a, b) => a - b)).toEqual([]);
        expect(SortingAlgorithms.insertionSort([], (a, b) => a - b)).toEqual([]);
        expect(SortingAlgorithms.radixSort([])).toEqual([]);
        });

        it('deve lidar com array de um único elemento', () => {
        expect(SortingAlgorithms.quickSort([1], (a, b) => a - b)).toEqual([1]);
        expect(SortingAlgorithms.mergeSort([1], (a, b) => a - b)).toEqual([1]);
        expect(SortingAlgorithms.insertionSort([1], (a, b) => a - b)).toEqual([1]);
        expect(SortingAlgorithms.radixSort([1])).toEqual([1]);
        });

        it('não deve modificar o array original', () => {
        const original = [3, 1, 2];

        SortingAlgorithms.quickSort(original, (a, b) => a - b);
        SortingAlgorithms.mergeSort(original, (a, b) => a - b);
        SortingAlgorithms.insertionSort(original, (a, b) => a - b);
        SortingAlgorithms.radixSort(original);

        expect(original).toEqual([3, 1, 2]);
        });
    });
});