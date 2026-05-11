"use client";

import React from "react";

export type AlgoritmoOrdenacao =
    | "native"
    | "quicksort"
    | "mergesort"
    | "radixsort"
    | "insertionsort";

    interface AlgoritmoSelectorProps {
    value: AlgoritmoOrdenacao;
    onChange: (value: AlgoritmoOrdenacao) => void;
    options?: AlgoritmoOrdenacao[];
    }

    const labels: Record<AlgoritmoOrdenacao, string> = {
    native: "Sort nativo",
    quicksort: "QuickSort",
    mergesort: "MergeSort",
    radixsort: "RadixSort",
    insertionsort: "InsertionSort",
    };

    export default function AlgoritmoSelector({
    value,
    onChange,
    options = ["native", "quicksort", "mergesort", "radixsort", "insertionsort"],
    }: AlgoritmoSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[#050036]">
            Algoritmo de ordenação
        </label>

        <select
            value={value}
            onChange={(e) => onChange(e.target.value as AlgoritmoOrdenacao)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-[#050036] bg-white"
        >
            {options.map((option) => (
            <option key={option} value={option}>
                {labels[option]}
            </option>
            ))}
        </select>
        </div>
    );
}